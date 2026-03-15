import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerRequest } from '@/models/VolunteerRequest';
import { Volunteer } from '@/models/VolunteerNew';

// Validation schema
const GetMatchingRequestsSchema = z.object({
  volunteerUid: z.string().min(1, 'Volunteer UID is required')
});

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

    // Get volunteer profile (try new collection first, then old)
    let volunteer = await Volunteer.findOne({ uid: volunteerUid, isActive: true });
    let preferredLocality, preferredDistrict, preferredSubjects, preferredClasses, skills;
    
    if (volunteer) {
      preferredLocality = volunteer.preferredLocality;
      preferredDistrict = volunteer.preferredDistrict;
      preferredSubjects = volunteer.preferredSubjects;
      preferredClasses = volunteer.preferredClasses;
    } else {
      // Volunteer not found in new collection
      return NextResponse.json(
        { success: false, message: 'Volunteer not found or inactive' },
        { status: 404 }
      );
    }

    if (preferredSubjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No preferred subjects set for volunteer',
        data: []
      });
    }

    // Find matching requests based on location (locality OR district) AND subjects
    const matchingRequests = await VolunteerRequest.find({
      status: 'open',
      $or: [
        { locality: preferredLocality },
        { district: preferredDistrict }
      ],
      subjectsRequired: { $in: preferredSubjects }
    }).sort({ createdAt: -1 });

    // Further filter by classes if volunteer has preferred classes
    const filteredRequests = matchingRequests.filter(request => {
      if (preferredClasses.length === 0) return true;
      return request.classesRequired.some((cls: string) => preferredClasses.includes(cls));
    });

    return NextResponse.json({
      success: true,
      message: `Found ${filteredRequests.length} matching requests`,
      data: filteredRequests
    });

  } catch (error) {
    console.error('Get matching requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch matching requests' },
      { status: 500 }
    );
  }
}
