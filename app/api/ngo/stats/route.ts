import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NGO from '@/models/NGO';
import { Volunteer } from '@/models/Volunteer';
import School from '@/models/School';
import VolunteerRequest from '@/models/VolunteerRequest';
import Session from '@/models/Session';
import Student from '@/models/Student';
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

    // Get NGO data
    const ngo = await NGO.findOne({ ngoUid: decoded.uid });
    if (!ngo) {
      return NextResponse.json({ success: false, message: 'NGO not found' }, { status: 404 });
    }

    // Get all volunteer UIDs for this NGO
    const volunteers = await Volunteer.find({ ngoUid: decoded.uid });
    const volunteerUids = volunteers.map(v => v.uid);

    // Get all schools for this NGO
    const schools = await School.find({ ngoUid: decoded.uid });
    const schoolUids = schools.map(s => s.uid);

    // Get all requests from schools managed by this NGO
    const requests = await VolunteerRequest.find({ 
      schoolUid: { $in: schoolUids } 
    });

    // Get all sessions conducted by NGO volunteers
    const sessions = await Session.find({ 
      ngoUid: decoded.uid,
      status: 'completed'
    });

    // Get all students from schools managed by this NGO
    const students = await Student.find({ 
      schoolUid: { $in: schoolUids } 
    });

    // Calculate operational stats
    const stats = {
      // Volunteer Pipeline
      totalVolunteers: volunteers.length,
      activeVolunteers: volunteers.filter(v => v.isActive && v.verificationStatus === 'verified').length,
      pendingVolunteers: volunteers.filter(v => v.verificationStatus === 'pending').length,
      averageRating: volunteers.reduce((acc, v) => acc + (v.ratingAverage || 0), 0) / volunteers.length || 0,

      // School Pipeline
      totalSchools: schools.length,
      verifiedSchools: schools.filter(s => s.verificationStatus === 'verified').length,
      pendingSchools: schools.filter(s => s.verificationStatus === 'pending').length,

      // Request Pipeline
      totalRequests: requests.length,
      openRequests: requests.filter(r => r.status === 'open').length,
      filledRequests: requests.filter(r => r.status === 'filled').length,
      
      // Impact Metrics
      totalStudents: students.length,
      totalSessions: sessions.length,
      totalHours: sessions.reduce((acc, s) => acc + (s.duration || 0), 0),
      studentsReached: Array.from(new Set(sessions.map(s => s.schoolUid))).length,
      
      // District Coverage
      districtsCovered: Array.from(new Set(schools.map(s => s.district))).length,
      
      // Subject Distribution
      subjectDistribution: requests.reduce((acc, req) => {
        req.subjectsRequired.forEach((subject: string) => {
          acc[subject] = (acc[subject] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),

      // District Distribution
      districtDistribution: schools.reduce((acc, school) => {
        acc[school.district] = (acc[school.district] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Monthly Stats
      sessionsThisMonth: 0
    };

    // Calculate monthly stats separately
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const sessionsThisMonth = sessions.filter(s => 
      s.date.getMonth() === currentMonth && 
      s.date.getFullYear() === currentYear
    ).length;

    // Add monthly stats to the stats object
    stats.sessionsThisMonth = sessionsThisMonth;

    return NextResponse.json({
      success: true,
      stats,
      ngo: {
        ngoUid: ngo.ngoUid,
        ngoName: ngo.ngoName,
        district: ngo.district,
        verifiedStatus: ngo.verifiedStatus
      }
    });

  } catch (error) {
    console.error('NGO Stats Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
