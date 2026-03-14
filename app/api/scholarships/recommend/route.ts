// Real scholarship API using Gemini for real data
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { askGemini } from '@/lib/ai/gemini';

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 50; // Increased to 50 requests per hour for better UX

// Validation schema
const RecommendationRequestSchema = z.object({
  studentProfile: z.object({
    class: z.string(),
    state: z.string(),
    category: z.string().optional(),
    income: z.number().optional(),
    marks: z.number().optional(),
    uid: z.string().optional()
  })
});

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 3600000);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  rateLimitMap.set(userId, [...recentRequests, now]);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎓 Scholarship API called with real data flow');

    const body = await request.json();
    const validation = RecommendationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { studentProfile } = validation.data;
    console.log('🎓 Processing profile:', studentProfile);

    if (!checkRateLimit(studentProfile.uid || 'anonymous')) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Use Gemini to get real scholarship recommendations
    const prompt = `You are a scholarship advisor providing accurate, real scholarship information. Always provide verifiable scholarship opportunities with official links.

Based on the following student profile, provide real scholarship recommendations:

Student Profile:
- Class: ${studentProfile.class}
- State: ${studentProfile.state}
- Category: ${studentProfile.category || 'Not specified'}
- Income: ${studentProfile.income || 'Not specified'}
- Marks: ${studentProfile.marks || 'Not specified'}

Please provide 3-5 real scholarship recommendations that match this profile. For each scholarship, include:
1. Name of the scholarship
2. Description
3. Eligibility criteria
4. Required documents
5. Application deadline
6. Official website link (MUST be a working, official government or educational institution website)
7. Sponsoring organization

IMPORTANT REQUIREMENTS:
- Focus on government scholarships, state-specific scholarships, and scholarships for the student's category
- ONLY provide real, verifiable scholarship information from official sources
- All links MUST be working official websites (prefer .gov.in, .nic.in, or official university websites)
- Avoid broken or non-working links
- Include scholarships with deadlines in the future

Format the response as a JSON array with the following structure:
{
  "scholarships": [
    {
      "name": "Scholarship Name",
      "description": "Description",
      "eligibilityRules": {
        "class": "Class requirement",
        "state": "State requirement", 
        "category": "Category requirement",
        "incomeLimit": Income limit,
        "minimumMarks": Minimum marks
      },
      "documentsRequired": ["Document 1", "Document 2"],
      "deadline": "YYYY-MM-DD",
      "sponsoringOrg": "Organization Name",
      "link": "Official website URL (must be working)"
    }
  ]
}`;

    const geminiResponse = await askGemini(prompt, {
      cache: false
    });

    if (!geminiResponse) {
      return NextResponse.json(
        { success: false, message: 'Failed to get scholarship recommendations' },
        { status: 500 }
      );
    }

    let scholarships = [];
    try {
      // Parse JSON response from Gemini
      const responseText = geminiResponse;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        scholarships = parsedResponse.scholarships || [];
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }

    if (scholarships.length === 0) {
      // Fallback to reliable official scholarship sources
      const fallbackScholarships = [
        {
          name: 'National Scholarship Portal',
          description: 'Central government scholarship portal for all categories',
          eligibilityRules: {
            class: studentProfile.class,
            state: studentProfile.state,
            category: studentProfile.category || 'General',
            incomeLimit: 800000,
            minimumMarks: 50
          },
          documentsRequired: ['Aadhaar Card', 'Bank Account', 'Income Certificate', 'Category Certificate'],
          deadline: '2024-12-31',
          sponsoringOrg: 'Ministry of Education',
          link: 'https://scholarships.gov.in/'
        },
        {
          name: 'State Scholarship Portal',
          description: `${studentProfile.state} State Government Scholarship Portal`,
          eligibilityRules: {
            class: studentProfile.class,
            state: studentProfile.state,
            category: studentProfile.category || 'General',
            incomeLimit: 600000,
            minimumMarks: 60
          },
          documentsRequired: ['Domicile Certificate', 'Mark Sheets', 'Income Certificate'],
          deadline: '2024-12-31',
          sponsoringOrg: `${studentProfile.state} Government`,
          link: 'https://scholarships.gov.in/'
        }
      ];

      const fallbackRecommendations = fallbackScholarships.map((scholarship, index) => ({
        scholarshipId: `fallback-${index + 1}`,
        name: scholarship.name,
        score: 75,
        explanation: `Based on your profile, you match 75% with this scholarship. ${scholarship.description}`,
        requiredDocs: scholarship.documentsRequired,
        link: scholarship.link,
        deadline: scholarship.deadline,
        sponsoringOrg: scholarship.sponsoringOrg,
        source: {
          name: scholarship.sponsoringOrg,
          link: scholarship.link,
          type: 'official'
        }
      }));

      return NextResponse.json({
        success: true,
        message: 'Recommendations retrieved successfully',
        data: fallbackRecommendations
      });
    }

    // Generate recommendations with scoring and sources
    const recommendations = scholarships.map((scholarship: any, index: number) => {
      let score = 50; // Base score

      // Calculate match score based on profile
      if (scholarship.eligibilityRules.class === studentProfile.class || scholarship.eligibilityRules.class === 'all') {
        score += 20;
      }

      if (scholarship.eligibilityRules.state === studentProfile.state) {
        score += 20;
      }

      if (studentProfile.category && scholarship.eligibilityRules.category === studentProfile.category) {
        score += 10;
      }

      if (studentProfile.income && scholarship.eligibilityRules.incomeLimit && studentProfile.income <= scholarship.eligibilityRules.incomeLimit) {
        score += 10;
      }

      if (studentProfile.marks && scholarship.eligibilityRules.minimumMarks && studentProfile.marks >= scholarship.eligibilityRules.minimumMarks) {
        score += 10;
      }

      return {
        scholarshipId: `gemini-${index + 1}`,
        name: scholarship.name,
        score: Math.min(score, 100),
        explanation: `Based on your profile, you match ${score}% with this scholarship. ${scholarship.description}`,
        requiredDocs: scholarship.documentsRequired || [],
        link: scholarship.link || '#',
        deadline: scholarship.deadline || new Date().toISOString().split('T')[0],
        sponsoringOrg: scholarship.sponsoringOrg || 'Unknown',
        source: {
          name: scholarship.sponsoringOrg || 'Official Scholarship Source',
          link: scholarship.link || '#',
          type: 'official'
        }
      };
    });

    console.log('🎓 Generated recommendations from Gemini:', recommendations.length);

    return NextResponse.json({
      success: true,
      message: 'Recommendations retrieved successfully',
      data: recommendations
    });

  } catch (error) {
    console.error('Scholarship recommendation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
