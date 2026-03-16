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

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get volunteer UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'volunteer') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validation = CompleteProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid profile data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const profileData = validation.data;

    // Update volunteer profile
    const updatedVolunteer = await Volunteer.findOneAndUpdate(
      { uid: decoded.uid },
      {
        ...profileData,
        dateOfBirth: new Date(profileData.dateOfBirth),
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

    console.log('=== DEBUG: Volunteer profile completed ===', {
      uid: updatedVolunteer.uid,
      name: updatedVolunteer.name,
      volunteerType: updatedVolunteer.volunteerType,
      profileCompleted: updatedVolunteer.profileCompleted
    });

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        uid: updatedVolunteer.uid,
        name: updatedVolunteer.name,
        volunteerType: updatedVolunteer.volunteerType,
        profileCompleted: updatedVolunteer.profileCompleted,
        verificationStatus: updatedVolunteer.verificationStatus,
        adminVerified: updatedVolunteer.adminVerified
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
