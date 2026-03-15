import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Student } from '@/models';

export async function GET(request: NextRequest) {
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

    // Get schoolUid from query params
    const { searchParams } = new URL(request.url);
    const schoolUid = searchParams.get('schoolUid');

    if (!schoolUid) {
      return NextResponse.json({ success: false, message: 'School UID is required' }, { status: 400 });
    }

    // Verify the school is requesting their own students
    if (schoolUid !== user.uid) {
      return NextResponse.json({ success: false, message: 'Unauthorized to view students for this school' }, { status: 403 });
    }

    // Fetch all students for this school
    const students = await Student.find({ schoolUid })
      .select('uid name email class state category verified')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
