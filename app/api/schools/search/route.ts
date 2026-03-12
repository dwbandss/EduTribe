import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { School } from '@/models/refactored/SchoolSimple';

// Validation schema for search request
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    hostel: z.boolean().optional(),
    stream: z.enum(['science', 'arts', 'commerce']).optional(),
    verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional()
  }).optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(50).default(10),
  location: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    const body = await request.json();
    const { query, filters, page, perPage, location } = searchSchema.parse(body);

    console.log('=== SMART SCHOOL SEARCH ===');
    console.log('Query:', query);
    console.log('Filters:', filters);
    console.log('Location:', location);

    // Build MongoDB query
    let mongoQuery: any = {};

    // Add text search for school name
    if (query && query.toLowerCase() !== 'all') {
      mongoQuery.$or = [
        { schoolName: { $regex: query, $options: 'i' } },
        { schoolCode: { $regex: query, $options: 'i' } }
      ];
    }
    // If query is "all", don't add any search criteria to get all schools

    // Add filters
    if (filters) {
      if (filters.state) mongoQuery.state = filters.state;
      if (filters.district) mongoQuery.district = filters.district;
      if (filters.hostel !== undefined) mongoQuery['facilities.hostel'] = filters.hostel;
      if (filters.stream) mongoQuery.streamsOffered = { $in: [filters.stream] };
      if (filters.verificationStatus) mongoQuery.verificationStatus = filters.verificationStatus;
    }

    // Add geospatial search if location provided
    if (location && location.longitude && location.latitude) {
      mongoQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: 50000 // 50km radius
        }
      };
    }

    // Execute query with pagination
    const skip = (page - 1) * perPage;
    const schools = await School.find(mongoQuery)
      .select('-__v')
      .sort(location ? { score: { $meta: 'textScore' } } : { schoolName: 1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    // Get total count for pagination
    const total = await School.countDocuments(mongoQuery);

    // Sanitize results for public view
    const sanitizedSchools = schools.map(school => ({
      id: school._id,
      name: school.schoolName,
      schoolCode: school.schoolCode,
      district: school.district,
      state: school.state,
      facilities: school.facilities,
      streamsOffered: school.streamsOffered,
      coordinates: school.location?.coordinates || [0, 0],
      studentsCount: school.studentsCount,
      teachersCount: school.teachersCount,
      verificationStatus: school.verificationStatus,
      // Hide sensitive contact info for public users
      contact: {
        phone: 'hidden',
        email: 'hidden',
        address: school.contact?.address || '',
        city: school.contact?.city || '',
        district: school.contact?.district || '',
        state: school.contact?.state || '',
        pincode: school.contact?.pincode || ''
      }
    }));

    return NextResponse.json({
      success: true,
      schools: sanitizedSchools,
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        total
      },
      confidence: 0.85 // Mock confidence score
    });

  } catch (error) {
    console.error('School search error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err: z.ZodIssue) => ({
            path: err.path,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
