import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Session, School, Student, Volunteer } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated student
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Find student
    const student = await Student.findOne({ studentUid: decoded.uid });
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get sessions for student's school and class
    const sessions = await Session.find({ 
      schoolUid: student.schoolUid,
      classes: student.class,
      status: { $in: ['scheduled', 'active'] }
    }).sort({ 'schedule.day': 1, 'schedule.time': 1 });

    // Get volunteer details for each session
    const sessionsWithVolunteers = await Promise.all(
      sessions.map(async (session) => {
        const volunteer = await Volunteer.findOne({ volunteerUid: session.volunteerUid });
        return {
          sessionId: session.sessionId,
          subject: session.subject,
          volunteer: volunteer?.name || 'Assigned Volunteer',
          schedule: session.schedule,
          location: session.location,
          status: session.status,
          mode: session.mode
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithVolunteers,
      total: sessionsWithVolunteers.length
    });

  } catch (error) {
    console.error('Get student sessions error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch sessions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
