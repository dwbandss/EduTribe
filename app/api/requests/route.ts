import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import VolunteerRequestModelExport, { VolunteerRequestModel as SchoolRequest } from '@/models/VolunteerRequest';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 5; // requests per hour per school

// Validation schema
const CreateRequestSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  schoolName: z.string().min(1, 'School name is required'),
  location: z.object({
    coordinates: z.array(z.number()).length(2)
  }),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  duration: z.string().optional(),
  schedule: z.array(z.string()).optional()
});

function checkRateLimit(schoolId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(schoolId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 3600000); // 1 hour
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  rateLimitMap.set(schoolId, [...recentRequests, now]);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request
    const body = await request.json();
    const validation = CreateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const requestData = validation.data;

    // Check rate limit
    if (!checkRateLimit(requestData.schoolId)) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate unique request ID
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create school request using the schema constructor
    await VolunteerRequestModelExport.create({
      requestId,
      ...requestData,
      location: {
        type: 'Point',
        coordinates: requestData.location.coordinates
      }
    });

    return NextResponse.json({
      success: true,
      message: 'School request created successfully',
      data: {
        requestId: requestId,
        status: 'open',
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Create school request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};
    if (schoolId) query.schoolId = schoolId;
    if (status) query.status = status;

    const requests = await SchoolRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get school requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
