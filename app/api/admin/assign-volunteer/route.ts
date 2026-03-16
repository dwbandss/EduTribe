import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Session, Volunteer, School, ActivityLog } from '@/models';
import { z } from 'zod';

// Volunteer assignment schema
const volunteerAssignmentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  volunteerUid: z.string().min(1, "Volunteer UID is required")
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const validatedData = volunteerAssignmentSchema.parse(body);

    // Find session
    const session = await Session.findOne({ sessionId: validatedData.sessionId });
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Find volunteer
    const volunteer = await Volunteer.findOne({ volunteerUid: validatedData.volunteerUid });
    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Check if volunteer is verified and active
    if (!volunteer.verified || volunteer.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Only verified and active volunteers can be assigned' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const conflictSession = await Session.findOne({
      volunteerUid: validatedData.volunteerUid,
      'schedule.day': session.schedule.day,
      'schedule.time': session.schedule.time,
      status: { $in: ['scheduled', 'active'] }
    });

    if (conflictSession) {
      return NextResponse.json(
        { success: false, message: 'Volunteer is already assigned to another session at this time' },
        { status: 400 }
      );
    }

    // Update session with volunteer assignment
    session.volunteerUid = validatedData.volunteerUid;
    
    // Add NGO UID if volunteer is from NGO
    if (volunteer.type === 'ngo' && volunteer.ngoUid) {
      session.ngoUid = volunteer.ngoUid;
    }

    await session.save();

    // Log activity
    await ActivityLog.create({
      userType: 'admin',
      userUid: 'system',
      action: 'volunteer_assignment',
      details: `Volunteer ${validatedData.volunteerUid} assigned to session ${validatedData.sessionId}`
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteer assigned successfully',
      sessionId: session.sessionId,
      volunteerUid: session.volunteerUid,
      schedule: session.schedule,
      location: session.location
    });

  } catch (error) {
    console.error('Volunteer assignment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to assign volunteer',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
