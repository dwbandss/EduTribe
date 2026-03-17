import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Session, School, Volunteer } from '@/models';
import { errorMonitor } from 'node:events';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated volunteer from middleware
    // The middleware should have set the user info in headers or we can use the token cookie
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Decode JWT token (simplified - in production use proper JWT verification)
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Find volunteer
    const volunteer = await Volunteer.findOne({ volunteerUid: decoded.uid });
    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Get sessions for this volunteer
    const sessions = await Session.find({ 
      volunteerUid: volunteer.volunteerUid,
      status: { $in: ['scheduled', 'active'] }
    }).sort({ 'schedule.day': 1, 'schedule.time': 1 });

    // Get school details for each session
    const sessionsWithSchools = await Promise.all(
      sessions.map(async (session) => {
        const school = await School.findOne({ schoolUid: session.schoolUid });
        return {
          sessionId: session.sessionId,
          school: school?.name || 'Unknown School',
          schoolUid: session.schoolUid,
          subject: session.subject,
          classes: session.classes,
          schedule: session.schedule,
          location: session.location,
          status: session.status,
          mode: session.mode
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithSchools,
      total: sessionsWithSchools.length
    });

  } catch (error) {
    console.error('Get volunteer sessions error:', error);
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
