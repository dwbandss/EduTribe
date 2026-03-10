import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { askGemini } from '@/lib/ai/gemini';
import { rateLimiters, addRateLimitHeaders } from '@/lib/middleware/rateLimit';
import { validateAIRequest, extractUserIdFromJWT, validateJWTFormat } from '@/lib/validation/aiSchema';

/**
 * JWT verification middleware
 */
async function verifyJWT(req: NextRequest): Promise<{ userId: string; valid: boolean }> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: '', valid: false };
  }
  
  const token = authHeader.substring(7);
  
  // Basic format validation
  if (!validateJWTFormat(token)) {
    return { userId: '', valid: false };
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.uid || decoded.sub || decoded.userId || decoded.id;
    
    if (!userId) {
      return { userId: '', valid: false };
    }
    
    return { userId, valid: true };
  } catch (error) {
    console.warn('JWT verification failed:', error);
    return { userId: '', valid: false };
  }
}

/**
 * Main AI API endpoint
 */
export async function POST(req: NextRequest) {
  try {
    // Verify JWT authentication
    const { userId, valid: isValidToken } = await verifyJWT(req);
    
    if (!isValidToken) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Valid JWT token is required',
        },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="EduTribe AI API"',
          },
        }
      );
    }

    // Apply rate limiting (20 requests per hour per user)
    const rateLimitResult = await rateLimiters.ai(req);
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const body = await req.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    const validatedData = validateAIRequest(body);

    // Add user ID to the request for tracking
    const promptWithUser = `[User ID: ${userId}] ${validatedData.prompt}`;

    // Call Gemini AI service
    const response = await askGemini(promptWithUser, validatedData.options);

    // Create response with rate limit headers
    const apiResponse = NextResponse.json({
      text: response,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Add rate limit headers to response
    if (rateLimitResult.rateLimit) {
      return addRateLimitHeaders(apiResponse, rateLimitResult.rateLimit);
    }

    return apiResponse;

  } catch (error) {
    console.error('AI API error:', error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { 
            error: 'Bad Request',
            message: error.message,
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('GEMINI_API_KEY')) {
        return NextResponse.json(
          { 
            error: 'Service Unavailable',
            message: 'AI service is not properly configured',
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('too long')) {
        return NextResponse.json(
          { 
            error: 'Bad Request',
            message: error.message,
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'Too Many Requests',
            message: 'AI service rate limit exceeded',
          },
          { status: 429 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and rate limit status
 */
export async function GET(req: NextRequest) {
  try {
    // Verify JWT for authenticated status check
    const { userId, valid: isValidToken } = await verifyJWT(req);
    
    if (!isValidToken) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Valid JWT token is required',
        },
        { status: 401 }
      );
    }

    // Check rate limit status
    const rateLimitResult = await rateLimiters.ai(req);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate Limited',
          message: 'You have exceeded the rate limit',
          rateLimit: rateLimitResult.rateLimit,
        },
        { status: 429 }
      );
    }

    // Return status information
    return NextResponse.json({
      status: 'healthy',
      service: 'EduTribe AI API',
      userId,
      rateLimit: rateLimitResult.rateLimit,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI API health check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Service Unavailable',
        message: 'AI service health check failed',
      },
      { status: 503 }
    );
  }
}

/**
 * OPTIONS endpoint for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}
