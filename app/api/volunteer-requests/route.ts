import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerRequest } from '@/models/VolunteerRequest';
import { School } from '@/models/School';
import { Volunteer } from '@/models'; // Import Volunteer correctly

// Validation schema
const CreateRequestSchema = z.object({
  schoolUid: z.string().min(1, 'School UID is required'),
  subjectsRequired: z.array(z.string()).min(1, 'At least one subject is required'),
  classesRequired: z.array(z.string()).min(1, 'At least one class is required'),
  volunteersNeeded: z.number().min(1, 'At least one volunteer is required'),
  description: z.string().optional()
});

// Generate unique request ID
function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = CreateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { schoolUid, subjectsRequired, classesRequired, volunteersNeeded, description } = validation.data;

    // Verify school exists (try new collection first, then old)
    let school = await School.findOne({ uid: schoolUid });
    let schoolName, district, locality;
    
    if (school) {
      schoolName = school.schoolName;
      district = school.district;
      locality = school.locality || "";
    } else {
      // Try old collection
      const oldSchool = await School.findOne({ userId: schoolUid });
      if (!oldSchool) {
        return NextResponse.json(
          { success: false, message: 'School not found' },
          { status: 404 }
        );
      }
      schoolName = oldSchool.schoolName;
      district = oldSchool.district;
      locality = oldSchool.locality || oldSchool.district;
    }

    // Create volunteer request - NO data duplication, only store UID reference
    const volunteerRequest = new VolunteerRequest({
      requestId: generateRequestId(),
      schoolUid,
      district,
      locality,
      subjectsRequired,
      classesRequired,
      volunteersNeeded,
      status: 'open'
    });

    await volunteerRequest.save();

    return NextResponse.json({
      success: true,
      message: 'Volunteer request created successfully',
      data: {
        requestId: volunteerRequest.requestId,
        schoolUid: volunteerRequest.schoolUid,
        district: volunteerRequest.district,
        locality: volunteerRequest.locality,
        subjectsRequired: volunteerRequest.subjectsRequired,
        classesRequired: volunteerRequest.classesRequired,
        volunteersNeeded: volunteerRequest.volunteersNeeded,
        status: volunteerRequest.status,
        createdAt: volunteerRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Create volunteer request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create volunteer request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const schoolUid = searchParams.get('schoolUid');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};
    if (schoolUid) query.schoolUid = schoolUid;
    if (status) query.status = status;

    const requests = await VolunteerRequest.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: `Found ${requests.length} volunteer requests`,
      data: requests
    });

  } catch (error) {
    console.error('Get volunteer requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteer requests' },
      { status: 500 }
    );
  }
}
