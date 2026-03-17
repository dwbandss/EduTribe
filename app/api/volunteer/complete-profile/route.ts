import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from '@/models/Volunteer';

// Validation Schema for Profile Completion
const CompleteProfileSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(['male', 'female', 'other'], "Gender is required"),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  preferredSubjects: z.array(z.string()).min(1, 'At least one subject is required'),
  preferredClasses: z.array(z.string()).min(1, 'At least one class is required'),
  preferredDistrict: z.string().min(1, 'District is required'),
  experience: z.string().optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  availability: z.array(z.object({
    day: z.string(),
    timeSlots: z.array(z.string())
  })).optional()
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const volunteerUid = searchParams.get('volunteerUid');

    if (!volunteerUid) {
      return NextResponse.json(
        { success: false, message: 'Volunteer UID required' },
        { status: 400 }
      );
    }

    const volunteer = await Volunteer.findOne({ volunteerUid }).lean();

    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // ✅ Check profile completion - realistic logic
    const profileCompleted =
      volunteer.name &&
      volunteer.email &&
      volunteer.phone &&
      volunteer.profile?.bio &&
      volunteer.profile?.experience;

    return NextResponse.json({
      success: true,
      data: {
        profileCompleted: Boolean(profileCompleted)
      }
    });

  } catch (error: any) {
    console.error('Complete profile error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("📥 Incoming body:", body);

    const { volunteerUid, profile } = body;

    if (!volunteerUid || !profile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updated = await Volunteer.findOneAndUpdate(
      { volunteerUid },
      {
        $set: {
          profile,
          profileCompleted: true
        }
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated
    });

  } catch (error: any) {
    console.error("❌ BACKEND ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
