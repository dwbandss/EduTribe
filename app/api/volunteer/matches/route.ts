import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from "@/models/Volunteer";
import VolunteerRequestModelExport, { SchoolRequest } from '@/models/VolunteerRequest';
import { VolunteerMatch } from '@/models/types/volunteer-match';

// Validation schema
const GetMatchesSchema = z.object({
  volunteerUid: z.string().min(1, 'Volunteer UID is required')
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get volunteer ID from query params
    const { searchParams } = new URL(request.url);
    const volunteerUid = searchParams.get('volunteerUid');

    if (!volunteerUid) {
      return NextResponse.json(
        { success: false, message: 'Volunteer UID is required' },
        { status: 400 }
      );
    }

    // Find all matches for this volunteer
    const matches = await VolunteerMatch.find({ 
      volunteerUid,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending requests found',
        data: []
      });
    }

    // Get detailed request information for each match
    const detailedMatches = [];
    for (const match of matches) {
      try {
        const schoolRequest = await VolunteerRequestModelExport.findOne({ 
          requestId: match.requestId 
        });

        if (schoolRequest) {
          detailedMatches.push({
            matchId: match._id,
            requestId: schoolRequest.requestId,
            schoolName: schoolRequest.schoolName,
            subject: schoolRequest.subject,
            gradeLevel: schoolRequest.gradeLevel,
            requiredSkills: schoolRequest.requiredSkills,
            description: schoolRequest.description,
            urgency: schoolRequest.urgency,
            duration: schoolRequest.duration,
            schedule: schoolRequest.schedule,
            score: match.score,
            explanation: match.explanation,
            status: match.status,
            createdAt: match.createdAt,
            requestCreatedAt: schoolRequest.createdAt
          });
        }
      } catch (error) {
        console.error('Error fetching request details for match:', match._id, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${detailedMatches.length} pending requests`,
      data: detailedMatches
    });

  } catch (error) {
    console.error('Get volunteer matches error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = GetMatchesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { volunteerUid } = validation.data;

    // Find all matches for this volunteer
    const matches = await VolunteerMatch.find({ 
      volunteerUid,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending requests found',
        data: []
      });
    }

    // Get detailed request information for each match
    const detailedMatches = [];
    for (const match of matches) {
      try {
        const schoolRequest = await VolunteerRequestModelExport.findOne({ 
          requestId: match.requestId 
        });

        if (schoolRequest) {
          detailedMatches.push({
            matchId: match._id,
            requestId: schoolRequest.requestId,
            schoolName: schoolRequest.schoolName,
            subject: schoolRequest.subject,
            gradeLevel: schoolRequest.gradeLevel,
            requiredSkills: schoolRequest.requiredSkills,
            description: schoolRequest.description,
            urgency: schoolRequest.urgency,
            duration: schoolRequest.duration,
            schedule: schoolRequest.schedule,
            score: match.score,
            explanation: match.explanation,
            status: match.status,
            createdAt: match.createdAt,
            requestCreatedAt: schoolRequest.createdAt
          });
        }
      } catch (error) {
        console.error('Error fetching request details for match:', match._id, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${detailedMatches.length} pending requests`,
      data: detailedMatches
    });

  } catch (error) {
    console.error('Get volunteer matches error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
