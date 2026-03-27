import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided"
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token"
        },
        { status: 401 }
      );
    }

    // Return user info from token
    console.log('🔍 AUTH VERIFY: Decoded token:', {
      uid: decoded.uid,
      role: decoded.role,
      volunteerUid: decoded.volunteerUid,
      type: decoded.type,
      verified: decoded.verified,
      status: decoded.status
    });
    
    return NextResponse.json({
      success: true,
      uid: decoded.uid,
      role: decoded.role,
      volunteerUid: decoded.volunteerUid,
      type: decoded.type,
      verified: decoded.verified,
      status: decoded.status
    });

  } catch (error: any) {
    console.error('Auth verify error:', error);

    return NextResponse.json(
      {
        success: false,
        message: "Token verification failed"
      },
      { status: 401 }
    );
  }
}
