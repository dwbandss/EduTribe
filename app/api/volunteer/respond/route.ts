import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerMatch } from '@/models/volunteer';
import { SchoolRequest } from '@/models/volunteer';

// Validation schema
const RespondToMatchSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  action: z.enum(['accept', 'decline']),
  volunteerId: z.string().min(1, 'Volunteer ID is required')
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = RespondToMatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { matchId, action, volunteerId } = validation.data;

    // Find the match
    const match = await VolunteerMatch.findOne({ _id: matchId, volunteerId });
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'This request has already been responded to' },
        { status: 400 }
      );
    }

    // Update match status
    match.status = action === 'accept' ? 'accepted' : 'declined';
    match.respondedAt = new Date();
    await match.save();

    // If accepted, update school request status to in_progress
    if (action === 'accept') {
      await SchoolRequest.findOneAndUpdate(
        { requestId: match.requestId },
        { status: 'in_progress' }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action === 'accept' ? 'accepted' : 'declined'} successfully`,
      data: {
        matchId: match._id,
        requestId: match.requestId,
        status: match.status,
        action: action
      }
    });

  } catch (error) {
    console.error('Respond to match error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to respond to request' },
      { status: 500 }
    );
  }
}
