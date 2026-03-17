import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import VolunteerRequestModelExport from '@/models/VolunteerRequest';
import { Volunteer } from '@/models/Volunteer';

const GetMatchingRequestsSchema = z.object({
  volunteerUid: z.string().min(1, 'Volunteer UID is required')
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const parsed = GetMatchingRequestsSchema.safeParse({
      volunteerUid: searchParams.get('volunteerUid')
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { volunteerUid } = parsed.data;

    const volunteer = await Volunteer.findOne({
      volunteerUid,
      isActive: true
    }).lean(); // ✅ IMPORTANT

    if (!volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer not found or inactive' },
        { status: 404 }
      );
    }

    // SAFE DEFAULTS - Access nested profile fields
    const preferredLocality = volunteer.profile?.preferredLocality || null;
    const preferredDistrict = volunteer.profile?.preferredDistrict || null;
    const preferredSubjects = volunteer.profile?.preferredSubjects || [];
    const preferredClasses = volunteer.profile?.preferredClasses || [];

    if (preferredSubjects.length === 0) {
      // fallback → show all requests in district
      const district = volunteer.profile?.preferredDistrict;
      if (district) {
        const allRequests = await VolunteerRequestModelExport.find({
          district: district,
          status: 'open'
        }).sort({ createdAt: -1 });
        
        return NextResponse.json({
          success: true,
          message: `Found ${allRequests.length} matching requests`,
          data: allRequests
        });
      }
    }

    // ✅ BUILD QUERY SAFELY
    const locationFilters = [];

    if (preferredLocality) {
      locationFilters.push({ locality: preferredLocality });
    }

    if (preferredDistrict) {
      locationFilters.push({ district: preferredDistrict });
    }

    const query: any = {
      status: 'open',
      subjectsRequired: { $in: preferredSubjects }
    };

    if (locationFilters.length > 0) {
      query.$or = locationFilters;
    }

    // ✅ FETCH WITH LEAN
    const matchingRequests = await VolunteerRequestModelExport.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // SAFE FILTER
    const filteredRequests = matchingRequests.filter((request: any) => {
      if (!preferredClasses.length) return true;

      const classesRequired = request.classesRequired || [];
      return classesRequired.some((cls: string) =>
        preferredClasses.includes(cls)
      );
    });

    return NextResponse.json({
      success: true,
      message: `Found ${filteredRequests.length} matching requests`,
      data: filteredRequests
    });

  } catch (error: any) {
    console.error('Get matching requests error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch matching requests',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}