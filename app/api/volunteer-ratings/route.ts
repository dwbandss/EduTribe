import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerRating, Volunteer, VolunteerAssignment } from '@/models';

// Validation schema
const CreateRatingSchema = z.object({
  volunteerUid: z.string().min(1, 'Volunteer UID is required'),
  schoolUid: z.string().min(1, 'School UID is required'),
  studentUid: z.string().optional(),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  feedback: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = CreateRatingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { volunteerUid, schoolUid, studentUid, rating, feedback } = validation.data;

    // Verify volunteer assignment exists
    const assignment = await VolunteerAssignment.findOne({
      volunteerUid,
      schoolUid,
      status: 'active'
    });
    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'No active assignment found for this volunteer and school' },
        { status: 404 }
      );
    }

    // Create rating
    const volunteerRating = new VolunteerRating({
      volunteerUid,
      schoolUid,
      studentUid,
      rating,
      feedback
    });

    await volunteerRating.save();

    // Update volunteer's average rating
    const allRatings = await VolunteerRating.find({ volunteerUid });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Volunteer.updateOne(
      { uid: volunteerUid },
      { ratingAverage: Math.round(averageRating * 10) / 10 } // Round to 1 decimal place
    );

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        volunteerUid,
        schoolUid,
        studentUid,
        rating,
        feedback,
        newAverageRating: Math.round(averageRating * 10) / 10
      }
    });

  } catch (error) {
    console.error('Create rating error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const volunteerUid = searchParams.get('volunteerUid');
    const schoolUid = searchParams.get('schoolUid');

    // Build query
    const query: any = {};
    if (volunteerUid) query.volunteerUid = volunteerUid;
    if (schoolUid) query.schoolUid = schoolUid;

    const ratings = await VolunteerRating.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: `Found ${ratings.length} ratings`,
      data: ratings
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}
