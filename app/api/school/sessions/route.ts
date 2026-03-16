import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Session, School, Volunteer } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated school
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Find school
    const school = await School.findOne({ schoolUid: decoded.uid });
    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    // Get sessions for this school
    const sessions = await Session.find({ 
      schoolUid: school.schoolUid,
      status: { $in: ['scheduled', 'active', 'completed'] }
    }).sort({ 'schedule.day': 1, 'schedule.time': 1 });

    // Get volunteer details for each session
    const sessionsWithVolunteers = await Promise.all(
      sessions.map(async (session) => {
        let volunteer = null;
        if (session.volunteerUid) {
          volunteer = await Volunteer.findOne({ volunteerUid: session.volunteerUid });
        }
        
        return {
          sessionId: session.sessionId,
          subject: session.subject,
          classes: session.classes,
          schedule: session.schedule,
          location: session.location,
          status: session.status,
          mode: session.mode,
          volunteer: volunteer ? {
            name: volunteer.name,
            volunteerUid: volunteer.volunteerUid
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithVolunteers,
      total: sessionsWithVolunteers.length
    });

  } catch (error) {
    console.error('Get school sessions error:', error);
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
