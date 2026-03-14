import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// MongoDB Schema for Student Profile
const StudentProfileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  class: { type: String },
  state: { type: String },
  category: { type: String },
  studying: { type: String },
  currentInstitution: { type: String },
  targetCourses: { type: String },
  income: { type: Number },
  marks: { type: Number },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create or get the model
const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);

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
    await dbConnect();
    
    // Parse and validate request body
    const body = await request.json();
    const validation = ProfileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid profile data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const profileData = validation.data;

    // Store profile data in MongoDB with upsert
    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { uid: profileData.uid },
      { 
        ...profileData, 
        updatedAt: new Date() 
      },
      { 
        upsert: true, 
        new: true, 
        runValidators: true,
        returnDocument: 'after'
      }
    );
    
    console.log('Profile saved to MongoDB for user:', profileData.uid);
    console.log('Profile data:', profileData);
    console.log('MongoDB document ID:', updatedProfile._id);

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
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    // Get profile data from MongoDB
    const profile = await StudentProfile.findOne({ uid });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB document to plain object
    const profileData = {
      uid: profile.uid,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      class: profile.class,
      state: profile.state,
      category: profile.category,
      studying: profile.studying,
      currentInstitution: profile.currentInstitution,
      targetCourses: profile.targetCourses,
      income: profile.income,
      marks: profile.marks,
      phone: profile.phone,
      address: profile.address,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    console.log('Profile fetched from MongoDB for user:', uid);
    console.log('Profile data:', profileData);

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
