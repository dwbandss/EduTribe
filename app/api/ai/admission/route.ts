import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { connectDB } from '../../../../lib/mongodb';
import { askGemini } from '../../../../lib/ai/gemini';
import { vectorStore, initializeVectorStore, Document } from '../../../../lib/ai/embeddings';
import { rateLimit } from '../../../../lib/middleware/rateLimit';

// Input validation schema
const admissionQuerySchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  studentProfile: z.object({
    class: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional()
  }).optional()
});

// Rate limiting: 10 requests per hour per student
const rateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 requests per hour
  keyGenerator: (req: NextRequest) => {
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');
    return `admission-query:${token}`;
  }
};

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(req, rateLimitConfig);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: "Too many admission queries. Please try again later." },
        { status: 429 }
      );
    }

    // Verify JWT token
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { success: false, message: "This feature is only available for students" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = admissionQuerySchema.parse(body);
    const { question, studentProfile } = validatedData;

    // Initialize vector store if needed
    if (vectorStore.getDocumentCount() === 0) {
      await initializeVectorStore();
    }

    // Search for relevant documents
    const relevantDocs = await vectorStore.search(question, 5);
    
    if (relevantDocs.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I couldn't find specific information about your query. Please try rephrasing your question or contact the school directly for more details.",
        sources: []
      });
    }

    // Create context-aware prompt
    const context = relevantDocs.map(doc => 
      `${doc.metadata.title} (${doc.metadata.type}): ${doc.text.substring(0, 500)}...`
    ).join('\n\n');

    const profileContext = studentProfile ? 
      `Student Profile: Class ${studentProfile.class || 'Not specified'}, State: ${studentProfile.state || 'Not specified'}, Category: ${studentProfile.category || 'Not specified'}\n\n` : '';

    const prompt = `You are an AI admission assistant for tribal students in India. Use the provided context to answer the student's question accurately and helpfully.

${profileContext}Context Information:
${context}

Student Question: ${question}

Instructions:
1. Answer based on the provided context
2. Be specific about admission requirements, documents, and processes
3. If information is missing, suggest contacting the school directly
4. Provide actionable advice
5. Format your response in a clear, organized way
6. Include specific document names, dates, and contact information when available

Provide a comprehensive answer in 2-3 paragraphs.`;

    // Get AI response
    const aiResponse = await askGemini(prompt, { maxTokens: 1000 });

    // Format sources
    const sources = relevantDocs.map(doc => ({
      id: doc.id,
      type: doc.metadata.type,
      title: doc.metadata.title,
      state: doc.metadata.state,
      category: doc.metadata.category,
      class: doc.metadata.class
    }));

    return NextResponse.json({
      success: true,
      answer: aiResponse,
      sources
    });

  } catch (error) {
    console.error('Admission query error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation error", 
          errors: error.issues 
        },
        { status: 400 }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
