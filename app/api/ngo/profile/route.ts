import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import NGO from '@/models/NGO';
import { Volunteer } from '@/models/Volunteer';
import { School } from '@/models/School';
import { Student } from '@/models/Student';

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

    // Verify token using JWT directly (consistent with other APIs)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Debug UID mismatch
    console.log('=== DEBUG: Token UID ===', decoded.uid);
    console.log('=== DEBUG: Token NGO UID ===', decoded.ngoUid);
    console.log('=== DEBUG: Token Role ===', decoded.role);
    console.log('=== DEBUG: Full Token ===', JSON.stringify(decoded, null, 2));

    // Get NGO data - normalize UID to uppercase
    const ngo = await NGO.findOne({ ngoUid: decoded.uid?.toUpperCase() });
    console.log('=== DEBUG: Found NGO ===', ngo ? ngo.ngoUid : 'NOT FOUND');
    console.log('=== DEBUG: NGO Details ===', ngo ? {
      ngoUid: ngo.ngoUid,
      ngoName: ngo.ngoName,
      email: ngo.email
    } : 'NULL');
    if (!ngo) {
      return NextResponse.json({ success: false, message: 'NGO not found' }, { status: 404 });
    }

    // Get all volunteer UIDs first - normalize UID
    const allVolunteers = await Volunteer.find({ ngoUid: decoded.uid?.toUpperCase() });
    const volunteerUids = allVolunteers.map(v => v.volunteerUid);
    
    // Get associated data
    const [volunteers, schools, students] = await Promise.all([
      Volunteer.find({ ngoUid: decoded.uid?.toUpperCase() }),
      School.find({ ngoUid: decoded.uid?.toUpperCase() }),
      Student.find({ assignedVolunteerUid: { $in: volunteerUids } })
    ]);

    // Calculate stats
    const stats = {
      totalVolunteers: volunteers.length,
      activeVolunteers: volunteers.filter(v => v.verified === true && v.status === 'active').length,
      totalSchools: schools.length,
      totalStudents: students.length,
      averageRating:
        volunteers.length > 0
          ? volunteers.reduce((acc, v) => acc + (v.ratingAverage || 0), 0) / volunteers.length
          : 0,
      districtsCovered: Array.from(new Set(schools.map(s => s.district))).length
    };

    return NextResponse.json({
      success: true,
      profile: {
        ngoUid: ngo.ngoUid,
        ngoName: ngo.ngoName,
        email: ngo.email,
        phone: ngo.phone,
        district: ngo.district,
        locality: ngo.locality,
        address: ngo.address,
        description: ngo.description,
        verifiedStatus: ngo.verifiedStatus,
        registrationNumber: ngo.registrationNumber,
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

// PUT endpoint to update NGO profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookieToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json(
        { success: false, message: 'Invalid NGO token' },
        { status: 401 }
      );
    }

    const ngoUid = decoded.uid;
    const updateData = await request.json();

    console.log('=== DEBUG: Updating NGO profile ===', { ngoUid, updateData });

    // Find and update NGO
    const ngo = await NGO.findOne({ ngoUid });
    if (!ngo) {
      return NextResponse.json(
        { success: false, message: 'NGO not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = [
      'ngoName', 'email', 'phone', 'website', 'description',
      'establishedYear', 'district', 'state', 'locality', 'address', 'registrationNumber'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        ngo[field] = updateData[field];
      }
    });

    await ngo.save();

    // Fetch updated stats
    const volunteers = await Volunteer.find({ ngoUid });
    const schools = await School.find({ ngoUid });
    const students = await School.find({ ngoUid }).select('totalStudents');
    
    const totalStudents = students.reduce((sum, school) => sum + (school.totalStudents || 0), 0);
    const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
    const districts = Array.from(new Set(schools.map(s => s.district)));

    const stats = {
      totalVolunteers: volunteers.length,
      activeVolunteers,
      totalSchools: schools.length,
      totalStudents,
      averageRating: ngo.ratingAverage || 0,
      districtsCovered: districts.length
    };

    const profileResponse = {
      ngoUid: ngo.ngoUid,
      ngoName: ngo.ngoName,
      email: ngo.email,
      phone: ngo.phone,
      website: ngo.website,
      description: ngo.description,
      establishedYear: ngo.establishedYear,
      district: ngo.district,
      state: ngo.state,
      locality: ngo.locality,
      address: ngo.address,
      verifiedStatus: ngo.verifiedStatus,
      registrationNumber: ngo.registrationNumber,
      stats
    };

    console.log('=== DEBUG: NGO profile updated successfully ===');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileResponse
    });

  } catch (error) {
    console.error('NGO profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
