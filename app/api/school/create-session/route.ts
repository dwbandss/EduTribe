import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { School, Session, Volunteer } from '@/models';
import { signToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Session request schema
const sessionRequestSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  classes: z.array(z.string().min(1)).min(1, "At least one class is required"),
  schedule: z.object({
    day: z.string().min(1, "Day is required"),
    time: z.string().min(1, "Time is required")
  }),
  location: z.string().min(1, "Location is required")
});

export async function POST(request: NextRequest) {
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
    // Decode token to get school UID
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Find school
    const school = await School.findOne({ schoolUid: decoded.uid });
    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school is verified
    if (school.verified !== 'verified') {
      return NextResponse.json(
        { success: false, message: 'Only verified schools can request volunteer sessions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = sessionRequestSchema.parse(body);

    // Generate session ID
    const sessionCount = await Session.countDocuments();
    const sessionId = `SES-${String(sessionCount + 1).padStart(4, '0')}`;

    // Create session request (without volunteer initially)
    const session = new Session({
      sessionId,
      schoolUid: school.schoolUid,
      volunteerUid: '', // Will be assigned by admin
      subject: validatedData.subject,
      classes: validatedData.classes,
      schedule: validatedData.schedule,
      mode: 'offline',
      location: validatedData.location,
      status: 'scheduled'
    });

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Session request created successfully. A volunteer will be assigned soon.',
      sessionId: session.sessionId,
      status: session.status
    });

  } catch (error) {
    console.error('Session request error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create session request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
