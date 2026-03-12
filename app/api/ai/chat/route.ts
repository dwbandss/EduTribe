import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'AI service is not configured. Please add GEMINI_API_KEY to your environment variables.' 
        },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create EduTribe-specific prompt
    const eduTribePrompt = `You are an expert educational assistant for EduTribe, a platform dedicated to helping students find schools, scholarships, and educational opportunities in India, especially for tribal and underprivileged communities.

Your role is to provide helpful, accurate, and encouraging guidance on:
- School admissions and requirements
- Scholarship opportunities and eligibility
- Educational schemes and government benefits
- Career guidance and counseling
- Application processes and deadlines
- Boarding facilities and hostel information
- Stream selection (Science, Commerce, Arts)
- Tribal educational benefits and reservations

IMPORTANT LANGUAGE REQUIREMENT:
- Detect the language of the user's question
- Reply in the SAME language as the user asked
- If user asks in English → reply in English
- If user asks in Odia → reply in Odia
- If user asks in Hindi → reply in Hindi

IMPORTANT: Keep your responses VERY SHORT and PRECISE:
- Maximum 2-3 sentences total
- Use bullet points for lists (max 3-4 bullets)
- Each bullet point should be 1 line maximum
- Be direct and to the point
- Focus only on the most important information
- NO lengthy explanations or introductions
- Start directly with the answer

User Question: ${message}

Context: ${context || 'EduTribe educational platform assistant'}

Provide a SHORT and PRECISE response in the same language as the user:`;

    // Generate response
    console.log('🤖 Calling Gemini API...');
    const result = await model.generateContent(eduTribePrompt);
    const response = result.response.text();
    console.log('✅ Gemini API call successful');
    console.log(`📝 Response length: ${response.length} characters`);

    return NextResponse.json({
      success: true,
      response: response.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Chat Error:', error);
    console.error('📋 Error Details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Get the message from the request body for fallback
    const requestBody = await request.json().catch(() => ({}));
    const userMessage = requestBody.message || 'your question';
    
    // Fallback response if Gemini fails
    const fallbackResponse = `I'm here to help you with your educational journey! 

Based on your question about "${userMessage}", I'd recommend:

1. **For School Admissions**: Check the School Finder tool for schools in your area
2. **For Scholarships**: Look at the Scholarships section for available opportunities  
3. **For General Guidance**: Our admission counselors can provide personalized assistance

Could you please provide more specific details about what you'd like to know? For example:
- What class/grade are you looking for?
- What's your preferred location?
- Are you interested in any specific stream (Science, Commerce, Arts)?

This will help me give you more targeted advice!`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}
