import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { askGemini } from '@/lib/ai/gemini';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 20; // requests per day per student

// Profanity filter (simple implementation)
const profanityList = ['badword1', 'badword2', 'badword3']; // Add actual profanity words

// Validation schema
const TutorRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(500, 'Question too long'),
  subject: z.string().min(1, 'Subject is required'),
  level: z.string().min(1, 'Level is required'),
  language: z.string().default('English')
});

function checkRateLimit(studentId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(studentId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 86400000); // 24 hours
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  rateLimitMap.set(studentId, [...recentRequests, now]);
  return true;
}

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word.toLowerCase()));
}

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const validation = TutorRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { question, subject, level, language } = validation.data;

    // Check for profanity
    if (containsProfanity(question)) {
      return NextResponse.json(
        { success: false, message: 'Question contains inappropriate content' },
        { status: 400 }
      );
    }

    // Check rate limit (using a mock student ID for now)
    const studentId = 'STUDENT-001'; // This should come from auth
    if (!checkRateLimit(studentId)) {
      return NextResponse.json(
        { success: false, message: 'Daily limit exceeded. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Build prompt for Gemini
    const prompt = `You are an AI tutor helping a ${level} student with ${subject}. The question is in ${language}.

Student Question: "${question}"

Please provide a comprehensive response with the following structure:

1. **Explanation**: Explain the concept simply and clearly for a ${level} student. Use age-appropriate language and examples they can understand.

2. **Examples**: Provide 2 clear, relatable examples that illustrate the concept. Make them practical and easy to remember.

3. **Quiz**: Create 3 short multiple-choice questions to test understanding. Each question should have 4 options (A, B, C, D) with the correct answer marked.

Format your response as JSON:
{
  "explanation": "Clear, simple explanation suitable for ${level} level",
  "examples": [
    "Example 1: Clear, relatable example",
    "Example 2: Another clear example"
  ],
  "quiz": [
    {
      "question": "Question 1",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "C"
    },
    {
      "question": "Question 2", 
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A"
    },
    {
      "question": "Question 3",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"], 
      "correctAnswer": "B"
    }
  ]
}

Important:
- Keep explanations simple and age-appropriate
- Use ${language} for the explanation
- Make examples practical and relatable
- Quiz questions should test understanding, not just memorization
- All content must be educational and appropriate`;

    const response = await askGemini(prompt, { cache: false });

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let tutorResponse;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        tutorResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        tutorResponse = {
          explanation: response.substring(0, 500),
          examples: ["Example 1", "Example 2"],
          quiz: [
            {
              question: "What did you learn from this explanation?",
              options: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              correctAnswer: "A"
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to process AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tutorResponse
    });

  } catch (error) {
    console.error('AI Tutor error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
