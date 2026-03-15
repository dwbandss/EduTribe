import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from '@/models';

const CompleteProfileSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  preferredSubjects: z.array(z.string()).min(1, 'At least one subject is required'),
  preferredClasses: z.array(z.string()).min(1, 'At least one class is required'),
  preferredDistrict: z.string().min(1, 'District is required'),
  preferredLocality: z.string().min(1, 'Locality is required'),
  experience: z.string().optional(),
  bio: z.string().optional(),
  availability: z.array(z.object({
    day: z.string(),
    timeSlots: z.array(z.string())
  })).min(1, 'At least one availability slot is required'),
  ngoUid: z.string().optional(),
  profileCompleted: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = CompleteProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid profile data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { uid, ...profileData } = validation.data;

    // Update volunteer profile
    const updatedVolunteer = await Volunteer.findOneAndUpdate(
      { uid },
      {
        ...profileData,
        profileCompleted: true,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        uid: updatedVolunteer.uid,
        profileCompleted: updatedVolunteer.profileCompleted
      }
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete profile' },
      { status: 500 }
    );
  }
}
