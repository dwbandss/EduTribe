import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { School, Volunteer, Student, NGO } from '@/models';
import mongoose from 'mongoose';

// Validation schema for profile data
const ProfileUpdateSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  class: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  currentInstitution: z.string().optional(),
  targetCourses: z.string().optional(),
  income: z.number().optional(),
  marks: z.number().optional(),
  phone: z.string().optional(),
  verified: z.boolean().optional(),
  address: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const validation = ProfileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid profile data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const profileData = validation.data;
    const { uid, role, ...dataToSave } = profileData;

    let updatedProfile = null;

    // Save to appropriate collection based on role
    if (role === 'student') {
      console.log('=== PROFILE SAVE DEBUG ===');
      console.log('Saving student profile for uid:', uid);
      console.log('Data to save:', dataToSave);
      
      // Check what exists before saving
      const existingStudent = await Student.findOne({ uid });
      console.log('Existing student in Student collection:', existingStudent ? 'EXISTS' : 'NOT EXISTS');
      
      // Update student profile with additional fields
      updatedProfile = await Student.findOneAndUpdate(
        { uid },
        {
          ...dataToSave,
          updatedAt: new Date()
        },
        { new: true }
      );
      console.log('Updated student profile:', updatedProfile);
      
      // If updatedProfile is null, fetch the document to verify it was saved
      if (!updatedProfile) {
        console.log('UpdatedProfile is null, fetching to verify save...');
        updatedProfile = await Student.findOne({ uid });
        console.log('Fetched student profile after save:', updatedProfile);
      }
      
      // Verify the save
      const verifyStudent = await Student.findOne({ uid });
      console.log('Verification - Student data after save:', {
        name: verifyStudent?.name,
        state: verifyStudent?.state,
        category: verifyStudent?.category,
        class: verifyStudent?.class
      });
      
      console.log('=== END SAVE DEBUG ===');
    } else if (role === 'school') {
      updatedProfile = await School.findOneAndUpdate(
        { uid },
        {
          ...dataToSave,
          updatedAt: new Date()
        },
        { new: true, upsert: true, runValidators: true }
      );
    } else if (role === 'volunteer') {
      updatedProfile = await Volunteer.findOneAndUpdate(
        { volunteerUid: uid },
        {
          ...dataToSave,
          updatedAt: new Date()
        },
        { new: true, upsert: true, runValidators: true }
      );
    }

    console.log('Profile saved to MongoDB for user:', uid);
    console.log('Profile data:', profileData);
    console.log('Final updatedProfile:', updatedProfile);

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data: {
        uid: updatedProfile.volunteerUid,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        type: updatedProfile.type,
        verifiedStatus: updatedProfile.status === 'active' ? 'verified' : 'pending',
        status: updatedProfile.status,
        ratingAverage: updatedProfile.ratingAverage || 0,
        bio: updatedProfile.profile?.bio || '',
        experience: updatedProfile.profile?.experience || '',
        skills: updatedProfile.profile?.skills || [],
        availability: updatedProfile.profile?.availability || [],
        location: updatedProfile.profile?.preferredDistrict || ''
      }
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
    const role = searchParams.get('role');

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    let profile = null;

    if (role) {
      switch (role) {
        case 'school':
          profile = await School.findOne({ uid }).lean();
          if (profile) {
            // Also fetch students under this school
            const Student = await import('@/models/Student').then(m => m.Student);
            const students = await Student.find({ schoolUid: uid }).lean();
            profile.students = students || [];
          }
          break;
        case 'volunteer':
          profile = await Volunteer.findOne({ volunteerUid: uid }).lean();
          if (profile && profile.ngoUid) {
            const ngo = await NGO.findOne({ ngoUid: profile.ngoUid }).lean();
            if (ngo) {
              profile.ngo = {
                ngoUid: ngo.ngoUid,
                ngoName: ngo.ngoName,
                verifiedStatus: ngo.verifiedStatus
              };
            }
          }
          break;
        case 'student':
          profile = await Student.findOne({ uid }).lean();
          break;
        case 'ngo':
          profile = await NGO.findOne({ ngoUid: uid }).lean();
          break;
        default:
          return NextResponse.json(
            { success: false, message: 'Invalid role' },
            { status: 400 }
          );
      }
    } else {
      profile = await School.findOne({ uid }).lean() ||
                await Volunteer.findOne({ volunteerUid: uid }).lean() ||
                await Student.findOne({ uid }).lean() ||
                await NGO.findOne({ ngoUid: uid }).lean();
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // ✅ Flatten volunteer profile data for frontend
    if (role === 'volunteer') {
      return NextResponse.json({
        success: true,
        data: {
          uid: profile.volunteerUid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          type: profile.type,
          verifiedStatus: profile.status === 'active' ? 'verified' : 'pending',
          status: profile.status,
          ratingAverage: profile.ratingAverage || 0,
          bio: profile.profile?.bio || '',
          experience: profile.profile?.experience || '',
          skills: profile.profile?.skills || [],
          availability: profile.profile?.availability || [],
          location: profile.profile?.preferredDistrict || ''
        }
      });
    }

    console.log('Profile fetched from MongoDB for user:', uid);
    console.log('Profile data:', profile);

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
