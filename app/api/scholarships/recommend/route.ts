import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Scholarship } from '@/models/refactored/Scholarship';
import { z } from 'zod';

// Validation schema for request
const RecommendationRequestSchema = z.object({
  studentProfile: z.object({
    class: z.string(),
    state: z.string(),
    category: z.string().optional(),
    income: z.number().optional(),
    marks: z.number().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse and validate request body
    const body = await request.json();
    const validation = RecommendationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { studentProfile } = validation.data;

    // Fetch scholarships from database
    const scholarships = await Scholarship.find({
      isActive: true,
      'eligibilityRules.state': studentProfile.state,
      'eligibilityRules.class': { $in: [studentProfile.class, 'all'] },
      deadline: { $gt: new Date() }
    }).sort({ deadline: 1 }).limit(20);

    // Simple matching algorithm (without AI for now)
    const recommendations = scholarships.slice(0, 5).map(scholarship => {
      let score = 50; // Base score

      // Class match
      if (scholarship.eligibilityRules.class === studentProfile.class || scholarship.eligibilityRules.class === 'all') {
        score += 20;
      }

      // State match
      if (scholarship.eligibilityRules.state === studentProfile.state) {
        score += 20;
      }

      // Category match
      if (studentProfile.category && scholarship.eligibilityRules.category === studentProfile.category) {
        score += 10;
      }

      // Income check
      if (studentProfile.income && scholarship.eligibilityRules.incomeLimit && studentProfile.income <= scholarship.eligibilityRules.incomeLimit) {
        score += 10;
      }

      // Marks check
      if (studentProfile.marks && scholarship.eligibilityRules.minimumMarks && studentProfile.marks >= scholarship.eligibilityRules.minimumMarks) {
        score += 10;
      }

      return {
        scholarshipId: scholarship._id,
        name: scholarship.name,
        score: Math.min(score, 100),
        explanation: `Matches your ${studentProfile.class} class in ${studentProfile.state}`,
        requiredDocs: scholarship.documentsRequired,
        link: scholarship.link || '#',
        deadline: scholarship.deadline
      };
    });

    return NextResponse.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Scholarship recommendation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
