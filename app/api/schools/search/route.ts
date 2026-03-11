import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { School, ISchool } from '@/models/refactored/SchoolSimple';
import { rateLimiters } from '@/lib/middleware/rateLimit';
import { z } from 'zod';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Search request schema
const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  filters: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    hostel: z.boolean().optional(),
    science: z.boolean().optional(),
    sports: z.boolean().optional(),
    stream: z.string().optional(),
    streams: z.array(z.string()).optional(),
    type: z.string().optional(),
    board: z.string().optional(),
    tribalCategory: z.string().optional()
  }).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(50).default(10),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(500).default(50) // radius in km
  }).optional()
});

// Parsed filters interface
interface ParsedFilters {
  state?: string;
  district?: string;
  hostel?: boolean;
  science?: boolean;
  sports?: boolean;
  stream?: string;
  streams?: string[];
  type?: string;
  board?: string;
  tribalCategory?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  confidence: number;
}

// Gemini prompt for natural language parsing
const PARSE_QUERY_PROMPT = `
You are a school search query parser for tribal schools in India. Extract structured filters from natural language queries.

Rules:
1. Extract location names (states, districts, cities)
2. Identify facility requirements (hostel, science, sports, etc.)
3. Recognize stream preferences (science, commerce, arts)
4. Detect school types (government, private, EMRS, Eklavya, Ashram)
5. Identify tribal categories (ST, SC, OBC)
6. Extract board preferences (CBSE, State Board, ICSE)
7. Look for distance/location-based queries

Examples:
Input: "hostel schools near Koraput offering science stream"
Output: {"district": "Koraput", "hostel": true, "stream": "science", "confidence": 0.9}

Input: "government schools in Odisha with sports facilities"
Output: {"state": "Odisha", "type": "government", "sports": true, "confidence": 0.85}

Input: "EMRS schools with hostel facility in tribal areas"
Output: {"type": "EMRS", "hostel": true, "tribalCategory": "ST", "confidence": 0.8}

Parse this query and return only valid JSON:
`;

async function parseNaturalLanguageQuery(query: string): Promise<ParsedFilters> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = PARSE_QUERY_PROMPT + query;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return { confidence: 0 };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      confidence: parsed.confidence || 0.5
    };
  } catch (error) {
    console.error('Gemini parsing error:', error);
    return { confidence: 0 };
  }
}

async function buildMongoQuery(parsedFilters: ParsedFilters, manualFilters?: any): Promise<any> {
  const query: any = { 
    isActive: true,
    isVerified: true 
  };

  // Combine parsed and manual filters
  const filters = { ...parsedFilters, ...manualFilters };

  // Location-based queries
  if (filters.location) {
    query.locationCoordinates = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [filters.location.longitude, filters.location.latitude]
        },
        $maxDistance: filters.location.radius * 1000 // Convert km to meters
      }
    };
  }

  // Geographic filters
  if (filters.state) query['contact.state'] = new RegExp(filters.state, 'i');
  if (filters.district) query['contact.district'] = new RegExp(filters.district, 'i');

  // School type
  if (filters.type) {
    query.type = new RegExp(filters.type, 'i');
  }

  // Academic filters
  if (filters.stream) {
    query['academics.streams'] = { $in: [filters.stream] };
  }
  if (filters.streams && Array.isArray(filters.streams)) {
    query['academics.streams'] = { $in: filters.streams };
  }
  if (filters.board) {
    query['academics.board'] = new RegExp(filters.board, 'i');
  }

  // Facility filters
  if (filters.hostel !== undefined) query['facilities.hostel'] = filters.hostel;
  if (filters.science !== undefined) query['facilities.science'] = filters.science;
  if (filters.sports !== undefined) query['facilities.sports'] = filters.sports;

  // Tribal category
  if (filters.tribalCategory) {
    query['tribalInfo.tribalCategory'] = filters.tribalCategory;
  }

  return query;
}

async function searchSchools(query: any, page: number, perPage: number) {
  const skip = (page - 1) * perPage;
  
  try {
    // Get total count
    const total = await School.countDocuments(query);
    
    // Get paginated results
    const schools = await School
      .find(query)
      .select('name schoolCode type location contact academics facilities tribalInfo description rating reviewCount')
      .sort({ 
        rating: -1, 
        reviewCount: -1,
        name: 1 
      })
      .skip(skip)
      .limit(perPage)
      .lean();

    return {
      schools: schools.map((school: any) => ({
        _id: school._id,
        name: school.name,
        type: school.type,
        location: school.location,
        contact: {
          city: school.contact?.city || '',
          district: school.contact?.district || '',
          state: school.contact?.state || '',
          address: school.contact?.address || ''
        },
        academics: school.academics || {},
        facilities: school.facilities || {},
        tribalInfo: school.tribalInfo || {},
        description: school.description || '',
        rating: school.rating || 0,
        reviewCount: school.reviewCount || 0
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      hasNext: page * perPage < total,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Database search error:', error);
    throw new Error('Database search failed');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.general(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = SearchRequestSchema.parse(body);

    // Parse natural language query with Gemini
    const parsedFilters = await parseNaturalLanguageQuery(validatedData.query);
    
    // Build MongoDB query
    const mongoQuery = await buildMongoQuery(parsedFilters, validatedData.filters);
    
    // Search schools
    const searchResults = await searchSchools(
      mongoQuery, 
      validatedData.page, 
      validatedData.perPage
    );

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        schools: searchResults.schools.map(school => ({
          _id: school._id,
          name: school.name,
          type: school.type,
          location: school.location,
          contact: {
            city: school.contact?.city || '',
            district: school.contact?.district || '',
            state: school.contact?.state || '',
            address: school.contact?.address || ''
          },
          academics: school.academics || {},
          facilities: school.facilities || {},
          tribalInfo: school.tribalInfo || {},
          description: school.description || '',
          rating: school.rating || 0,
          reviewCount: school.reviewCount || 0
        })),
        parsing: {
          originalQuery: validatedData.query,
          parsedFilters,
          confidence: parsedFilters.confidence
        },
        pagination: {
          total: searchResults.total,
          page: searchResults.page,
          perPage: searchResults.perPage,
          totalPages: searchResults.totalPages,
          hasNext: searchResults.hasNext,
          hasPrev: searchResults.hasPrev
        }
      }
    });

  } catch (error) {
    console.error('School search API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request format',
          errors: error.issues 
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

// GET endpoint for simple search without natural language parsing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('q') || '';
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const hostel = searchParams.get('hostel') === 'true';
    const science = searchParams.get('science') === 'true';
    const stream = searchParams.get('stream');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    // Build query
    const mongoQuery = await buildMongoQuery(
      { confidence: 0 }, // No parsing for GET requests
      { state, district, hostel, science, stream }
    );

    // Add text search if query provided
    if (query) {
      mongoQuery.$text = { $search: query };
    }

    // Search schools
    const searchResults = await searchSchools(mongoQuery, page, perPage);

    return NextResponse.json({
      success: true,
      data: {
        schools: searchResults.schools.map((school: any) => ({
          _id: school._id,
          name: school.name,
          type: school.type,
          location: school.location,
          contact: {
            city: school.contact?.city || '',
            district: school.contact?.district || '',
            state: school.contact?.state || '',
            address: school.contact?.address || ''
          },
          academics: school.academics || {},
          facilities: school.facilities || {},
          tribalInfo: school.tribalInfo || {},
          description: school.description || '',
          rating: school.rating || 0,
          reviewCount: school.reviewCount || 0
        })),
        pagination: {
          total: searchResults.total,
          page: searchResults.page,
          perPage: searchResults.perPage,
          totalPages: searchResults.totalPages,
          hasNext: searchResults.hasNext,
          hasPrev: searchResults.hasPrev
        }
      }
    });

  } catch (error) {
    console.error('School search GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
