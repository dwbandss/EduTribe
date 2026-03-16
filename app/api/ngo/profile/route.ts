import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { NGO } from '@/models/NGO';
import { Volunteer } from '@/models/Volunteer';
import { School } from '@/models/School';
import { Student } from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Get NGO data
    const ngo = await NGO.findOne({ ngoUid: decoded.uid });
    if (!ngo) {
      return NextResponse.json({ success: false, message: 'NGO not found' }, { status: 404 });
    }

    // Get all volunteer UIDs first
    const allVolunteers = await Volunteer.find({ ngoUid: decoded.uid });
    const volunteerUids = allVolunteers.map(v => v.uid);
    
    // Get associated data
    const [volunteers, schools, students] = await Promise.all([
      Volunteer.find({ ngoUid: decoded.uid }),
      School.find({ ngoUid: decoded.uid }),
      Student.find({ assignedVolunteerUid: { $in: volunteerUids } })
    ]);

    // Calculate stats
    const stats = {
      totalVolunteers: volunteers.length,
      activeVolunteers: volunteers.filter(v => v.verifiedStatus === 'verified').length,
      totalSchools: schools.length,
      totalStudents: students.length,
      averageRating: volunteers.reduce((acc, v) => acc + (v.rating || 0), 0) / volunteers.length || 0,
      districtsCovered: Array.from(new Set(schools.map(s => s.district))).length
    };

    return NextResponse.json({
      success: true,
      ngo: {
        ...ngo.toObject(),
        stats
      },
      volunteers,
      schools,
      students
    });

  } catch (error) {
    console.error('NGO profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
