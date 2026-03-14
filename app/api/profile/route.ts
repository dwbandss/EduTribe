import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Simple in-memory storage for demo (works without MongoDB)
const profileStore = new Map();

// Validation schema for profile data
const ProfileUpdateSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  class: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  studying: z.string().optional(),
  currentInstitution: z.string().optional(),
  targetCourses: z.string().optional(),
  income: z.number().optional(),
  marks: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = ProfileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid profile data' },
        { status: 400 }
      );
    }

    const profileData = validation.data;

    // Store profile data in memory (in production, use MongoDB)
    profileStore.set(profileData.uid, profileData);
    
    console.log('Profile saved for user:', profileData.uid);
    console.log('Profile data:', profileData);
    console.log('Total profiles in memory:', profileStore.size);

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data: profileData
    });

  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    // Get profile data from memory (in production, query from MongoDB)
    const profile = profileStore.get(uid);

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
