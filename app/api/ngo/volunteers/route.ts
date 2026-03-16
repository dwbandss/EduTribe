import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Volunteer } from '@/models/Volunteer';
import School from '@/models/School';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const district = searchParams.get('district');

    // Get volunteers for this NGO
    let volunteersQuery: any = { ngoUid: decoded.uid };
    
    // Add filters if provided
    if (status) {
      volunteersQuery.verificationStatus = status;
    }
    if (subject) {
      volunteersQuery.preferredSubjects = { $in: [subject] };
    }
    if (district) {
      volunteersQuery.preferredDistrict = district;
    }

    const volunteers = await Volunteer.find(volunteersQuery)
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get schools for reference
    const schools = await School.find({ ngoUid: decoded.uid });
    const schoolMap = new Map(schools.map(s => [s.uid, s]));

    // Get session stats for each volunteer
    const volunteerUids = volunteers.map(v => v.uid);
    const sessions = await Session.find({ 
      volunteerUid: { $in: volunteerUids },
      status: 'completed'
    });

    // Calculate session stats per volunteer
    const sessionStats = new Map();
    sessions.forEach(session => {
      const uid = session.volunteerUid;
      if (!sessionStats.has(uid)) {
        sessionStats.set(uid, { sessions: 0, hours: 0, students: 0 });
      }
      const stats = sessionStats.get(uid);
      stats.sessions += 1;
      stats.hours += session.duration || 0;
      stats.students += session.studentsCount || 0;
    });

    // Enrich volunteer data
    const enrichedVolunteers = volunteers.map(volunteer => {
      const assignedSchool = volunteer.assignedSchoolUid ? schoolMap.get(volunteer.assignedSchoolUid) : null;
      const stats = sessionStats.get(volunteer.uid) || { sessions: 0, hours: 0, students: 0 };
      
      return {
        uid: volunteer.uid,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        skills: volunteer.skills,
        preferredSubjects: volunteer.preferredSubjects,
        preferredClasses: volunteer.preferredClasses,
        preferredDistrict: volunteer.preferredDistrict,
        verificationStatus: volunteer.verificationStatus,
        isActive: volunteer.isActive,
        ratingAverage: volunteer.ratingAverage,
        assignedSchool: assignedSchool ? {
          uid: assignedSchool.uid,
          schoolName: assignedSchool.schoolName,
          district: assignedSchool.district
        } : null,
        assignedRequests: volunteer.assignedRequests || [],
        stats: {
          totalSessions: stats.sessions,
          totalHours: Math.round(stats.hours / 60), // Convert minutes to hours
          studentsTaught: stats.students
        },
        createdAt: volunteer.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      volunteers: enrichedVolunteers,
      total: volunteers.length
    });

  } catch (error) {
    console.error('NGO Volunteers Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { volunteerUid, action } = body;

    if (!volunteerUid || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Volunteer UID and action are required' 
      }, { status: 400 });
    }

    // Find volunteer
    const volunteer = await Volunteer.findOne({ uid: volunteerUid, ngoUid: decoded.uid });
    
    if (!volunteer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Volunteer not found' 
      }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'verify':
        volunteer.verificationStatus = 'verified';
        volunteer.isActive = true;
        break;
        
      case 'reject':
        volunteer.verificationStatus = 'rejected';
        volunteer.isActive = false;
        break;
        
      case 'activate':
        volunteer.isActive = true;
        break;
        
      case 'deactivate':
        volunteer.isActive = false;
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }

    await volunteer.save();

    return NextResponse.json({
      success: true,
      message: `Volunteer ${action}d successfully`,
      volunteer: {
        uid: volunteer.uid,
        name: volunteer.name,
        verificationStatus: volunteer.verificationStatus,
        isActive: volunteer.isActive
      }
    });

  } catch (error) {
    console.error('NGO Volunteer Action Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
