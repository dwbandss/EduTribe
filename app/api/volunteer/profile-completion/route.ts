import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const volunteerUid = searchParams.get('volunteerUid');

    if (!volunteerUid) {
      return NextResponse.json(
        { success: false, message: 'Volunteer UID is required' },
        { status: 400 }
      );
    }

    const volunteer = await Volunteer.findOne({ uid: volunteerUid });
    
    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Check if profile is complete
    const isProfileComplete = volunteer.profileCompleted || (
      volunteer.skills?.length > 0 &&
      volunteer.preferredSubjects?.length > 0 &&
      volunteer.preferredClasses?.length > 0 &&
      volunteer.preferredLocality &&
      volunteer.preferredDistrict &&
      volunteer.availability?.length > 0
    );

    return NextResponse.json({
      success: true,
      data: {
        uid: volunteer.uid,
        profileCompleted: isProfileComplete,
        missingFields: {
          skills: !volunteer.skills || volunteer.skills.length === 0,
          preferredSubjects: !volunteer.preferredSubjects || volunteer.preferredSubjects.length === 0,
          preferredClasses: !volunteer.preferredClasses || volunteer.preferredClasses.length === 0,
          preferredLocality: !volunteer.preferredLocality,
          preferredDistrict: !volunteer.preferredDistrict,
          availability: !volunteer.availability || volunteer.availability.length === 0
        }
      }
    });

  } catch (error) {
    console.error('Profile completion check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check profile completion' },
      { status: 500 }
    );
  }
}
