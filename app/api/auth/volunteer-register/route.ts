import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Import models
import { Volunteer } from '@/models/Volunteer';
import { ActivityLog } from '@/models/ActivityLog';
import { NGO } from '@/models/NGO';

// Import JWT utilities
import { signToken } from '@/lib/auth/jwt';

// Import database connection
import dbConnect from '@/lib/dbConnect';

// Validation Schema for Volunteer Registration (both NGO and Independent)
const volunteerRegistrationSchema = z.object({
  // Common fields
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  type: z.enum(["ngo", "independent"], "Volunteer type is required"),
  
  // NGO volunteer fields
  ngoUid: z.string().optional(),
  
  // Independent volunteer fields
  aadhaarNumber: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => {
  if (data.type === "ngo") {
    return data.ngoUid && data.ngoUid.length > 0;
  }
  if (data.type === "independent") {
    return data.aadhaarNumber && data.aadhaarNumber.length >= 12;
  }
  return true;
}, {
  message: "Required fields missing for volunteer type",
  path: ["type"]
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    let body;
    try {
      body = await request.json();
      console.log('=== DEBUG: Volunteer Registration request body ===', JSON.stringify(body, null, 2));
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

    const { type, ngoUid, aadhaarNumber, name, email, phone, password } = volunteerRegistrationSchema.parse(body);

    // Handle NGO volunteer registration
    if (type === 'ngo') {
      // Check if email already exists for NGO volunteers
      const existingEmail = await Volunteer.findOne({
        email: email.toLowerCase(),
        type: 'ngo'
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already registered for NGO volunteer"
          },
          { status: 400 }
        );
      }

      // Verify NGO exists
      const ngo = await NGO.findOne({ ngoUid: ngoUid });
      if (!ngo) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid NGO UID"
          },
          { status: 400 }
        );
      }

      // Generate unique volunteer UID
      const volunteerCount = await Volunteer.countDocuments({ type: 'ngo' });
      const volunteerUid = `EDU-VOL-NGO-${String(volunteerCount + 1).padStart(4, '0')}`;

      // Create NGO volunteer (password will be hashed by middleware)
      const volunteer = new Volunteer({
        volunteerUid: volunteerUid,
        type: 'ngo',
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password, // Let middleware handle hashing
        ngoUid: ngoUid,
        verified: false, // NGO volunteers need NGO verification
        status: 'pending', // NGO volunteers start as pending until NGO verifies
        profileCompleted: false,
        userId: `USER-${volunteerUid}`, // Generate unique userId
        profile: {
          skills: [],
          preferredSubjects: [],
          preferredClasses: [],
          preferredDistrict: '',
          experience: '',
          bio: '',
          availability: []
        }
      });

      await volunteer.save();

      console.log('=== DEBUG: New NGO volunteer created ===', {
        volunteerUid: volunteer.volunteerUid,
        name: volunteer.name,
        ngoUid: volunteer.ngoUid,
        verified: volunteer.verified,
        status: volunteer.status
      });

      // Log activity
      await ActivityLog.create({
        userType: 'volunteer',
        userUid: volunteer.volunteerUid,
        action: 'registration',
        details: `NGO volunteer ${name} registered under NGO ${ngoUid}`
      });

      // Generate JWT token
      const token = signToken({
        uid: volunteer.volunteerUid,
        volunteerUid: volunteer.volunteerUid,
        role: 'volunteer',
        type: 'ngo',
        verified: volunteer.verified,
        status: volunteer.status,
        userId: volunteer._id
      });

      return NextResponse.json({
        success: true,
        message: "NGO volunteer registration successful. Please complete your profile.",
        role: 'volunteer',
        type: 'ngo',
        uid: volunteer.volunteerUid, // Return as uid for consistency
        volunteerUid: volunteer.volunteerUid,
        token: token
      });
    }

    // Handle independent volunteer registration
    if (type === 'independent') {
      // Check if Aadhaar number already exists
      const existingAadhaar = await Volunteer.findOne({
        aadhaarNumber: aadhaarNumber,
        type: 'independent'
      });

      if (existingAadhaar) {
        return NextResponse.json(
          {
            success: false,
            message: "Aadhaar number already registered"
          },
          { status: 400 }
        );
      }

      // Check if email already exists for independent volunteers
      const existingEmail = await Volunteer.findOne({
        email: email.toLowerCase(),
        type: 'independent'
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already registered for independent volunteer"
          },
          { status: 400 }
        );
      }

      // Generate unique volunteer UID
      const volunteerCount = await Volunteer.countDocuments({ type: 'independent' });
      const volunteerUid = `EDU-VOL-IND-${String(volunteerCount + 1).padStart(4, '0')}`;

      // Create new independent volunteer (password will be hashed by middleware)
      const volunteer = new Volunteer({
        volunteerUid: volunteerUid,
        type: 'independent',
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password, // Let middleware handle hashing
        aadhaarNumber: aadhaarNumber?.trim(),
        verified: false, // Needs admin verification
        status: 'pending',
        profileCompleted: false,
        userId: `USER-${volunteerUid}`, // Generate unique userId
        profile: {
          skills: [],
          preferredSubjects: [],
          preferredClasses: [],
          preferredDistrict: '',
          experience: '',
          bio: '',
          availability: []
        }
      });

      await volunteer.save();

      console.log('=== DEBUG: New independent volunteer created ===', {
        volunteerUid: volunteer.volunteerUid,
        name: volunteer.name,
        aadhaarNumber: volunteer.aadhaarNumber,
        verified: volunteer.verified,
        status: volunteer.status
      });

      // Log activity
      await ActivityLog.create({
        userType: 'volunteer',
        userUid: volunteer.volunteerUid,
        action: 'registration',
        details: `Independent volunteer ${name} registered with Aadhaar ${aadhaarNumber}`
      });

      // Generate JWT token
      const token = signToken({
        uid: volunteer.volunteerUid,
        volunteerUid: volunteer.volunteerUid,
        role: 'volunteer',
        type: 'independent',
        verified: volunteer.verified,
        status: volunteer.status,
        userId: volunteer._id
      });

      return NextResponse.json({
        success: true,
        message: "Independent volunteer registration successful. Please complete your profile and wait for admin verification.",
        role: 'volunteer',
        type: 'independent',
        uid: volunteer.volunteerUid, // Return as uid for consistency
        volunteerUid: volunteer.volunteerUid,
        token: token
      });
    }

  } catch (error) {
    console.error('Volunteer registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
