import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from '@/models/Volunteer';
import VolunteerRequestModelExport, { VolunteerRequestModel as SchoolRequest } from '@/models/VolunteerRequest';
import { VolunteerMatch } from '@/models/types/volunteer-match';
import { askGemini } from '@/lib/ai/gemini';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per hour per school

// Validation schema
const MatchRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required')
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

// Calculate distance between two points (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate volunteer match score
function calculateMatchScore(volunteer: any, request: any): number {
  let score = 0;
  
  // Skill match (40% weight)
  const skillMatches = volunteer.skills.filter((skill: string) => 
    request.requiredSkills.includes(skill)
  ).length;
  const skillScore = request.requiredSkills.length > 0 ? 
    (skillMatches / request.requiredSkills.length) * 40 : 0;
  
  // Distance score (25% weight) - closer is better
  const distance = calculateDistance(
    volunteer.location.coordinates[1], volunteer.location.coordinates[0],
    request.location.coordinates[1], request.location.coordinates[0]
  );
  const distanceScore = Math.max(0, 25 - (distance / 10)); // 25 points max, decreases with distance
  
  // Availability score (20% weight) - check if volunteer has availability
  const availabilityScore = volunteer.availability.length > 0 ? 20 : 0;
  
  // Rating score (15% weight)
  const ratingScore = (volunteer.rating / 5) * 15;
  
  score = skillScore + distanceScore + availabilityScore + ratingScore;
  
  return Math.min(score, 100); // Cap at 100
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request
    const body = await request.json();
    const validation = MatchRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { requestId } = validation.data;

    // Fetch the school request
    const schoolRequest = await VolunteerRequestModelExport.findOne({ requestId, status: 'open' });
    if (!schoolRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found or already closed' },
        { status: 404 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(schoolRequest.schoolId)) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Find candidate volunteers
    const candidateVolunteers = await Volunteer.find({
      isActive: true,
      profileVisibility: 'public',
      skills: { $in: schoolRequest.requiredSkills }
    }).limit(20);

    if (candidateVolunteers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No volunteers found matching your requirements',
        data: []
      });
    }

    // Calculate scores and get top candidates
    const scoredVolunteers = candidateVolunteers.map(volunteer => ({
      volunteer,
      score: calculateMatchScore(volunteer, schoolRequest)
    })).sort((a, b) => b.score - a.score).slice(0, 5);

    // Generate explanations using Gemini
    const matches = [];
    for (const { volunteer, score } of scoredVolunteers) {
      try {
        const prompt = `You are a volunteer matching coordinator. Explain why this volunteer is a good match for a school request.

SCHOOL REQUEST:
- School: ${schoolRequest.schoolName}
- Subject: ${schoolRequest.subject}
- Grade Level: ${schoolRequest.gradeLevel}
- Required Skills: ${schoolRequest.requiredSkills.join(', ')}
- Description: ${schoolRequest.description}
- Duration: ${schoolRequest.duration || 'Not specified'}

VOLUNTEER PROFILE:
- Name: ${volunteer.name}
- Skills: ${volunteer.skills.join(', ')}
- Languages: ${volunteer.languages.join(', ')}
- Rating: ${volunteer.rating}/5
- Education: ${volunteer.education || 'Not specified'}
- Experience: ${volunteer.experience || 'Not specified'}
- Bio: ${volunteer.bio || 'Not specified'}

Please provide a brief, human-readable explanation (2-3 sentences) why this volunteer is a good match for the school's needs. Focus on their skills, experience, and how they can help the students.

Format your response as a single paragraph explanation.`;

        const explanation = await askGemini(prompt, { cache: false });

        // Save match to database
        const match = new VolunteerMatch({
          requestId: schoolRequest.requestId,
          volunteerId: volunteer.userId,
          score: Math.round(score),
          explanation: explanation || 'Volunteer matches the required skills and has good ratings.'
        });
        await match.save();

        matches.push({
          volunteerId: volunteer.userId,
          name: volunteer.name,
          skills: volunteer.skills,
          languages: volunteer.languages,
          rating: volunteer.rating,
          score: Math.round(score),
          explanation: explanation || 'Volunteer matches the required skills and has good ratings.',
          matchId: match._id
        });
      } catch (error) {
        console.error('Error generating explanation for volunteer:', volunteer.userId, error);
        // Add match without explanation if Gemini fails
        matches.push({
          volunteerId: volunteer.userId,
          name: volunteer.name,
          skills: volunteer.skills,
          languages: volunteer.languages,
          rating: volunteer.rating,
          score: Math.round(score),
          explanation: 'Volunteer matches the required skills and has good ratings.',
          matchId: null
        });
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      message: `Found ${matches.length} matching volunteers`,
      data: matches
    });

  } catch (error) {
    console.error('Volunteer matching error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to find volunteers' },
      { status: 500 }
    );
  }
}
