import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { documentStore } from '@/lib/document-store';
import { sampleSchools, sampleSchemes } from '@/data/sample-data';
import { askGemini } from '@/lib/ai/gemini';
import { z } from 'zod';

// Initialize document store with sample data
sampleSchools.forEach(school => {
  documentStore.addDocument({
    id: school.id,
    text: school.text,
    type: 'school',
    title: school.name
  });
});

sampleSchemes.forEach(scheme => {
  documentStore.addDocument({
    id: scheme.id,
    text: scheme.text,
    type: 'scheme',
    title: scheme.name
  });
});

console.log('Document store initialized with', documentStore.getAllDocuments().length, 'documents');

// Validation schema
const AdmissionRequestSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  studentProfile: z.object({
    class: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional()
  })
});

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
CRITICAL INSTRUCTION: You must answer the student's specific question using ONLY the provided documents. NO GENERIC RESPONSES.

STUDENT'S EXACT QUESTION: "${question}"

STUDENT PROFILE:
- Class: ${studentProfile.class || 'Not specified'}
- State: ${studentProfile.state || 'Not specified'}
- Category: ${studentProfile.category || 'Not specified'}

AVAILABLE DOCUMENTS:
${context}

TASK: Answer the question "${question}" using ONLY the information from the documents above.

RULES:
1. DO NOT provide generic greetings or introductions
2. DO NOT say "I can help with..." or "I'm here to assist..."
3. DIRECTLY answer the specific question asked
4. If documents contain the answer, use that information
5. If documents DON'T contain the answer, say "I don't have information about that in the available documents"
6. Reference specific document titles in your answer

EXAMPLE OF WRONG RESPONSE: "Hello! I can help you with scholarships..."
EXAMPLE OF RIGHT RESPONSE: "Based on the documents, the KVPY scholarship deadline is..."

RESPONSE FORMAT:
{
  "answer": "Direct answer to the question based on documents",
  "sources": [
    {"id": "doc_id", "type": "school/scheme", "title": "Document Title"}
  ]
}

ANSWER THE QUESTION: "${question}"
`;

    // Get AI response
    const aiText = await askGemini(prompt);
    
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
