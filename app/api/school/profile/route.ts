import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { School, User, Student } from '@/models';

// Validation schema
const GetSchoolProfileSchema = z.object({
  schoolUid: z.string().min(1, 'School UID is required')
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const schoolUid = searchParams.get('schoolUid');

    if (!schoolUid) {
      return NextResponse.json(
        { success: false, message: 'School UID is required' },
        { status: 400 }
      );
    }

    // Find school
    const school = await School.findOne({ uid: schoolUid });
    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    // Find user information
    const user = await User.findOne({ uid: schoolUid });
    
    // Get student count
    const studentCount = await Student.countDocuments({ schoolUid });

    return NextResponse.json({
      success: true,
      message: 'School profile retrieved successfully',
      data: {
        uid: school.uid,
        schoolName: school.schoolName,
        district: school.district,
        locality: school.locality,
        address: school.address,
        subjectsNeeded: school.subjectsNeeded,
        classesAvailable: school.classesAvailable,
        studentsCount: studentCount,
        verificationStatus: school.verificationStatus,
        userInfo: user ? {
          name: user.name,
          email: user.email,
          phone: user.phone
        } : null,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt
      }
    });

  } catch (error) {
    console.error('Get school profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch school profile' },
      { status: 500 }
    );
  }
}

// Update school profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { schoolUid, ...updateData } = body;

    if (!schoolUid) {
      return NextResponse.json(
        { success: false, message: 'School UID is required' },
        { status: 400 }
      );
    }

    // Update school
    const school = await School.findOneAndUpdate(
      { uid: schoolUid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'School profile updated successfully',
      data: school
    });

  } catch (error) {
    console.error('Update school profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update school profile' },
      { status: 500 }
    );
  }
}
