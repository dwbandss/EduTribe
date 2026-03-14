import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { documentStore } from '@/lib/document-store';
import { sampleSchools, sampleSchemes } from '@/data/sample-data';
import { askGemini } from '@/lib/ai/gemini';
import { z } from 'zod';

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 50; // requests per hour per user (same as scholarship API)

// Validation schema
const AdmissionRequestSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  studentProfile: z.object({
    class: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional(),
    uid: z.string().optional()
  })
});

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 3600000); // 1 hour in milliseconds
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  // Clean old requests
  rateLimitMap.set(userId, [...recentRequests, now]);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request
    const body = await request.json();
    const validation = AdmissionRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { question, studentProfile } = validation.data;

    // Check rate limit (using student ID as userId)
    if (!checkRateLimit(studentProfile.uid || 'anonymous')) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Search for relevant documents
    const relevantDocs = documentStore.searchDocuments(question, 10);

    // Debug: Log what documents are found
    console.log('Question:', question);
    console.log('Found documents:', relevantDocs.length);
    console.log('Document titles:', relevantDocs.map(d => d.title));

    // Build context for AI
    const context = relevantDocs.map(doc => `DOCUMENT: ${doc.title}\nCONTENT: ${doc.text}`).join('\n\n---\n\n');

    // Create AI prompt
    const prompt = `
You are a helpful ADMISSION ASSISTANT for EduTribe platform. Be flexible and helpful.

STUDENT'S EXACT QUESTION: "${question}"

STUDENT PROFILE:
- Class: ${studentProfile.class || 'Not specified'}
- State: ${studentProfile.state || 'Not specified'}
- Category: ${studentProfile.category || 'Not specified'}

AVAILABLE DOCUMENTS:
${context}

TASK: Answer the student's question helpfully. Follow these guidelines:
1. If question is about ADMISSIONS, SCHOOLS, or EDUCATIONAL INSTITUTIONS - answer normally
2. If question mentions "passed from here" or similar - DON'T ask for documents, acknowledge their statement
3. If question is about SCHOLARSHIPS - politely redirect to Scholarships tab
4. If question is about CAREER GUIDANCE - provide helpful admission-related advice
5. If question is NOT about admission - politely say you can only help with admission-related questions
6. Be conversational and helpful, not overly strict
7. Use available documents to provide accurate information
8. If user says they passed from somewhere, accept their statement and don't question it

ADMISSION TOPICS:
- School admissions and requirements
- Application processes and deadlines  
- Document requirements for admissions
- Eligibility criteria
- Entrance exams and preparation
- College selection guidance

Remember: Be helpful and flexible while staying focused on admission topics.

RESPONSE FORMAT:
{
  "answer": "Direct answer to admission question based on documents",
  "sources": [
    {"id": "doc_id", "type": "school/scheme", "title": "Document Title", "link": "https://actual-website.com"}
  ]
}

ANSWER THE ADMISSION QUESTION: "${question}"
`;

    // Get AI response (with caching disabled for admission questions)
    const aiText = await askGemini(prompt, { cache: false });
    
    if (!aiText) {
      return NextResponse.json(
        { success: false, message: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    // Parse AI response
    let aiResponse: {
      answer: string;
      sources: Array<{
        id: string;
        type: 'school' | 'scheme';
        title: string;
      }>;
    };
    
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to simple response
        aiResponse = {
          answer: aiText,
          sources: relevantDocs.map(doc => ({
            id: doc.id,
            type: doc.type,
            title: doc.title
          }))
        };
      }
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      aiResponse = {
        answer: 'I apologize, but I encountered an error processing your request.',
        sources: []
      };
    }

    return NextResponse.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    console.error('Admission assistant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
