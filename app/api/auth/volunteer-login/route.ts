import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import models
import { Volunteer } from '@/models/Volunteer';
import { NGO } from '@/models/NGO';

// Import JWT utilities
import { signToken } from '@/lib/auth/jwt';

// Import database connection
import dbConnect from '@/lib/dbConnect';

// Validation Schema for NGO Volunteers
const ngoVolunteerLoginSchema = z.object({
  ngoUid: z.string().min(1, "NGO UID is required"),
  volunteerUid: z.string().min(1, "Volunteer UID is required"),
  password: z.string().min(1, "Password is required")
});

// Validation Schema for Independent Volunteers
const independentVolunteerLoginSchema = z.object({
  aadhaarNumber: z.string().min(12, "Aadhaar number is required"),
  password: z.string().min(1, "Password is required")
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    let body;
    try {
      body = await request.json();
      console.log('=== DEBUG: Volunteer Login request body ===', JSON.stringify(body, null, 2));
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

    const { loginType } = body;

    // Handle NGO Volunteer Login
    if (loginType === 'ngo') {
      const { ngoUid, volunteerUid, password } = ngoVolunteerLoginSchema.parse(body);

      // Verify NGO exists
      const ngo = await NGO.findOne({ uid: ngoUid.toUpperCase() });
      if (!ngo) {
        return NextResponse.json(
          {
            success: false,
            message: "NGO not found"
          },
          { status: 404 }
        );
      }

      // Find volunteer by UID and NGO
      const volunteer = await Volunteer.findOne({
        uid: volunteerUid.toUpperCase(),
        ngoUid: ngoUid.toUpperCase(),
        volunteerType: 'ngo'
      }).select("+password");

      if (!volunteer) {
        return NextResponse.json(
          {
            success: false,
            message: "Volunteer not found in this NGO"
          },
          { status: 401 }
        );
      }

      // Check verification status
      if (volunteer.verificationStatus !== 'verified') {
        return NextResponse.json(
          {
            success: false,
            message: "Volunteer not verified by NGO"
          },
          { status: 401 }
        );
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, volunteer.password);
      if (!isMatch) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid password"
          },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = signToken({
        uid: volunteer.uid,
        role: 'volunteer',
        volunteerType: 'ngo',
        ngoUid: ngo.uid,
        userId: volunteer._id
      });

      // Create response
      const response = NextResponse.json(
        {
          success: true,
          message: "NGO Volunteer login successful",
          role: 'volunteer',
          volunteerType: 'ngo',
          name: volunteer.name,
          uid: volunteer.uid,
          ngoUid: ngo.uid,
          ngoName: ngo.ngoName
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
    }

    // Handle Independent Volunteer Login
    if (loginType === 'independent') {
      const { aadhaarNumber, password } = independentVolunteerLoginSchema.parse(body);

      // Find volunteer by Aadhaar number
      const volunteer = await Volunteer.findOne({
        aadhaarNumber: aadhaarNumber,
        volunteerType: 'independent'
      }).select("+password");

      if (!volunteer) {
        return NextResponse.json(
          {
            success: false,
            message: "Aadhaar number not found"
          },
          { status: 401 }
        );
      }

      // Check admin verification
      if (!volunteer.adminVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Volunteer not verified by admin"
          },
          { status: 401 }
        );
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, volunteer.password);
      if (!isMatch) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid password"
          },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = signToken({
        uid: volunteer.uid,
        role: 'volunteer',
        volunteerType: 'independent',
        userId: volunteer._id
      });

      // Create response
      const response = NextResponse.json(
        {
          success: true,
          message: "Independent volunteer login successful",
          role: 'volunteer',
          volunteerType: 'independent',
          name: volunteer.name,
          uid: volunteer.uid,
          profileCompleted: volunteer.profileCompleted
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
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid login type"
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("Volunteer login error:", error);

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
