import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Import models
import { User } from '@/models/User';

// Import JWT utilities
import { signToken } from '@/lib/auth/jwt';

// Import database connection
import dbConnect from '@/lib/dbConnect';

// Validation Schema - supports both email and UID login
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or UID is required"), // Can be email or UID
  password: z.string().min(1, "Password is required")
}).transform((data) => {
  // Handle both email and UID formats
  if (data.identifier.includes('@')) {
    // Email format
    return {
      identifier: data.identifier.toLowerCase(),
      password: data.password
    };
  } else {
    // UID format (convert to uppercase)
    return {
      identifier: data.identifier.toUpperCase(),
      password: data.password
    };
  }
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    let body;
    try {
      body = await request.json();
      console.log('=== DEBUG: Login request body ===', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('=== JSON Parse Error ===', parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON format"
        },
        { status: 400 }
      );
    }

    // Validate request data
    const { identifier, password } = loginSchema.parse(body);

    // Find user by email or UID
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { uid: identifier.toUpperCase() }
      ]
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email/UID or password"
        },
        { status: 401 }
      );
    }

    // Compare password
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials. Please register again."
        },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email/UID or password"
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      uid: user.uid,
      role: user.role,
      userId: user._id
    });

    // Create response with HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        role: user.role,
        name: user.name,
        uid: user.uid
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err: z.ZodIssue) => ({
            path: err.path,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}