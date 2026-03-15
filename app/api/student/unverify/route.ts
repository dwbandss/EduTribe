import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Student } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'school') {
      return NextResponse.json({ success: false, message: 'Unauthorized - School role required' }, { status: 401 });
    }

    const { studentUid } = await request.json();
    
    if (!studentUid) {
      return NextResponse.json({ success: false, message: 'Student UID is required' }, { status: 400 });
    }

    // Find the student and verify they belong to this school
    const student = await Student.findOne({ uid: studentUid });
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    // Check if the student belongs to this school
    if (student.schoolUid !== user.uid) {
      return NextResponse.json({ success: false, message: 'Student does not belong to your school' }, { status: 403 });
    }

    // Update student verification status
    const updatedStudent = await Student.findOneAndUpdate(
      { uid: studentUid },
      { verified: false },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Student unverified successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error unverifying student:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
