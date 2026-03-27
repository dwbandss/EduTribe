import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import School from '@/models/School';
import { Volunteer } from '@/models/Volunteer';
import VolunteerRequest from '@/models/VolunteerRequest';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const district = searchParams.get('district');

    // Build query
    const query: any = { ngoUid: decoded.uid };
    
    if (status) {
      query.verificationStatus = status;
    }
    
    if (district) {
      query.district = district;
    }

    // Get schools
    const schools = await School.find(query).sort({ createdAt: -1 });
    
    // Get volunteers for reference
    const volunteers = await Volunteer.find({ ngoUid: decoded.uid });
    const volunteerMap = new Map(volunteers.map(v => [v.volunteerUid, v]));

    // Get requests for each school
    const schoolUids = schools.map(s => s.uid);
    const requests = await VolunteerRequest.find({ 
      schoolUid: { $in: schoolUids } 
    });

    // Get student counts for each school
    const students = await Student.find({ 
      schoolUid: { $in: schoolUids } 
    });

    // Calculate stats per school
    const requestStats = new Map();
    requests.forEach(request => {
      const uid = request.schoolUid;
      if (!requestStats.has(uid)) {
        requestStats.set(uid, { open: 0, filled: 0, closed: 0 });
      }
      const stats = requestStats.get(uid);
      stats[request.status]++;
    });

    const studentStats = new Map();
    students.forEach(student => {
      const uid = student.schoolUid;
      studentStats.set(uid, (studentStats.get(uid) || 0) + 1);
    });

    // Enrich school data
    const enrichedSchools = schools.map(school => {
      const assignedVolunteers = (school.assignedVolunteers || [])
        .map((vUid: string) => volunteerMap.get(vUid))
        .filter((v: any) => v)
        .map((v: any) => ({
          uid: v.volunteerUid,
          name: v.name,
          skills: v.skills,
          isActive: v.status === 'active'
        }));

      const stats = requestStats.get(school.uid) || { open: 0, filled: 0, closed: 0 };
      const studentCount = studentStats.get(school.uid) || 0;
      
      return {
        uid: school.uid,
        schoolName: school.schoolName,
        email: school.email,
        phone: school.phone,
        district: school.district,
        state: school.state,
        address: school.address,
        verificationStatus: school.verificationStatus,
        subjectsNeeded: school.subjectsNeeded,
        classesAvailable: school.classesAvailable,
        totalStudents: school.totalStudents,
        actualStudentCount: studentCount,
        assignedVolunteers,
        volunteerCount: assignedVolunteers.length,
        requests: {
          open: stats.open,
          filled: stats.filled,
          closed: stats.closed,
          total: stats.open + stats.filled + stats.closed
        },
        createdAt: school.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      schools: enrichedSchools,
      total: schools.length
    });

  } catch (error) {
    console.error('NGO Schools Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { schoolUid, action } = body;

    if (!schoolUid || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'School UID and action are required' 
      }, { status: 400 });
    }

    // Find school
    const school = await School.findOne({ uid: schoolUid, ngoUid: decoded.uid });
    
    if (!school) {
      return NextResponse.json({ 
        success: false, 
        message: 'School not found' 
      }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'verify':
        school.verificationStatus = 'verified';
        break;
        
      case 'reject':
        school.verificationStatus = 'rejected';
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }

    await school.save();

    return NextResponse.json({
      success: true,
      message: `School ${action}d successfully`,
      school: {
        uid: school.uid,
        schoolName: school.schoolName,
        verificationStatus: school.verificationStatus
      }
    });

  } catch (error) {
    console.error('NGO School Action Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
