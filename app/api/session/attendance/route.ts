import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Attendance, Session, Student, ActivityLog } from '@/models';
import { z } from 'zod';

// Attendance marking schema
const attendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  presentStudents: z.array(z.string()).min(0, "Present students array is required")
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user (volunteer or school)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // Parse request body
    const body = await request.json();
    const validatedData = attendanceSchema.parse(body);

    // Find session
    const session = await Session.findOne({ sessionId: validatedData.sessionId });
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify authorization (volunteer assigned to session or school that owns the session)
    if (decoded.role === 'volunteer' && session.volunteerUid !== decoded.uid) {
      return NextResponse.json(
        { success: false, message: 'You can only mark attendance for your assigned sessions' },
        { status: 403 }
      );
    }

    if (decoded.role === 'school' && session.schoolUid !== decoded.uid) {
      return NextResponse.json(
        { success: false, message: 'You can only mark attendance for your school sessions' },
        { status: 403 }
      );
    }

    // Get all students for the session's classes and school
    const allStudents = await Student.find({
      schoolUid: session.schoolUid,
      class: { $in: session.classes }
    });

    // Clear existing attendance for this session
    await Attendance.deleteMany({ sessionId: validatedData.sessionId });

    // Mark attendance for all students
    const attendanceRecords = allStudents.map(student => ({
      sessionId: validatedData.sessionId,
      studentUid: student.uid,
      status: validatedData.presentStudents.includes(student.uid) ? 'present' : 'absent',
      markedBy: decoded.uid
    }));

    // Bulk insert attendance records
    await Attendance.insertMany(attendanceRecords);

    // Log activity
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    await ActivityLog.create({
      userType: decoded.role,
      userUid: decoded.uid,
      action: 'attendance_marked',
      details: `Attendance marked for session ${validatedData.sessionId}: ${presentCount}/${allStudents.length} present`
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      sessionId: validatedData.sessionId,
      totalStudents: allStudents.length,
      presentCount: presentCount,
      absentCount: allStudents.length - presentCount
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark attendance',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // Get sessionId from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find session and verify authorization
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify authorization
    if (decoded.role === 'volunteer' && session.volunteerUid !== decoded.uid) {
      return NextResponse.json(
        { success: false, message: 'You can only view attendance for your assigned sessions' },
        { status: 403 }
      );
    }

    if (decoded.role === 'school' && session.schoolUid !== decoded.uid) {
      return NextResponse.json(
        { success: false, message: 'You can only view attendance for your school sessions' },
        { status: 403 }
      );
    }

    // Get attendance records with student details
    const attendanceRecords = await Attendance.find({ sessionId })
      .populate('studentUid', 'uid name class')
      .sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      sessionId,
      attendance: attendanceRecords.map(record => ({
        studentUid: typeof record.studentUid === 'object' ? record.studentUid.uid : record.studentUid,
        studentName: typeof record.studentUid === 'object' ? record.studentUid.name : 'Unknown Student',
        studentClass: typeof record.studentUid === 'object' ? record.studentUid.class : 'Unknown Class',
        status: record.status,
        markedAt: record.createdAt
      }))
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch attendance',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
