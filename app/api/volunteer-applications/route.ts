import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerApplication, VolunteerRequest, Volunteer, School } from '@/models';

// Validation schema
const ApplyToRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  volunteerUid: z.string().min(1, 'Volunteer UID is required')
});

// Generate unique application ID
function generateApplicationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = ApplyToRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { requestId, volunteerUid } = validation.data;

    // Verify volunteer request exists and is open
    const volunteerRequest = await VolunteerRequest.findOne({ 
      requestId, 
      status: 'open' 
    });
    if (!volunteerRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found or not open for applications' },
        { status: 404 }
      );
    }

    // Verify volunteer exists and is active
    const volunteer = await Volunteer.findOne({ 
      uid: volunteerUid, 
      isActive: true 
    });
    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found or inactive' },
        { status: 404 }
      );
    }

    // Check if volunteer has already applied
    const existingApplication = await VolunteerApplication.findOne({
      requestId,
      volunteerUid
    });
    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied to this request' },
        { status: 400 }
      );
    }

    // Create application
    const application = new VolunteerApplication({
      applicationId: generateApplicationId(),
      requestId,
      volunteerUid,
      schoolUid: volunteerRequest.schoolUid,
      status: 'pending'
    });

    await application.save();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.applicationId,
        requestId: application.requestId,
        volunteerUid: application.volunteerUid,
        schoolUid: application.schoolUid,
        status: application.status,
        createdAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('Apply to request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const schoolUid = searchParams.get('schoolUid');
    const volunteerUid = searchParams.get('volunteerUid');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};
    if (schoolUid) query.schoolUid = schoolUid;
    if (volunteerUid) query.volunteerUid = volunteerUid;
    if (status) query.status = status;

    const applications = await VolunteerApplication.find(query)
      .sort({ createdAt: -1 });

    // Populate with request and volunteer details
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        const request = await VolunteerRequest.findOne({ requestId: app.requestId });
        const volunteer = await Volunteer.findOne({ uid: app.volunteerUid });
        
        return {
          applicationId: app.applicationId,
          requestId: app.requestId,
          volunteerUid: app.volunteerUid,
          schoolUid: app.schoolUid,
          status: app.status,
          createdAt: app.createdAt,
          requestDetails: request,
          volunteerDetails: volunteer
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: `Found ${populatedApplications.length} applications`,
      data: populatedApplications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
