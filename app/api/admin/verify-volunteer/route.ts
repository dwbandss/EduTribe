import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Import models
import { Volunteer } from '@/models/Volunteer';

// Import database connection
import dbConnect from '@/lib/dbConnect';

// Validation Schema
const verifyVolunteerSchema = z.object({
  volunteerUid: z.string().min(1, "Volunteer UID is required"),
  action: z.enum(['verify', 'reject'], "Action must be verify or reject")
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get admin UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Invalid admin token' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const { volunteerUid, action } = verifyVolunteerSchema.parse(body);

    console.log('=== DEBUG: Admin volunteer verification ===', {
      adminUid: decoded.uid,
      volunteerUid,
      action
    });

    // Find independent volunteer
    const volunteer = await Volunteer.findOne({
      uid: volunteerUid,
      volunteerType: 'independent'
    });

    if (!volunteer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Independent volunteer not found' 
      }, { status: 404 });
    }

    // Handle verification action
    if (action === 'verify') {
      volunteer.adminVerified = true;
      volunteer.verificationStatus = 'verified';
      volunteer.isActive = true;
      
      await volunteer.save();

      console.log('=== DEBUG: Independent volunteer verified ===', {
        uid: volunteer.uid,
        name: volunteer.name,
        adminVerified: volunteer.adminVerified,
        verificationStatus: volunteer.verificationStatus
      });

      return NextResponse.json({
        success: true,
        message: 'Independent volunteer verified successfully',
        volunteer: {
          uid: volunteer.uid,
          name: volunteer.name,
          email: volunteer.email,
          adminVerified: volunteer.adminVerified,
          verificationStatus: volunteer.verificationStatus
        }
      });
    }

    // Handle rejection action
    if (action === 'reject') {
      volunteer.adminVerified = false;
      volunteer.verificationStatus = 'rejected';
      volunteer.isActive = false;
      
      await volunteer.save();

      console.log('=== DEBUG: Independent volunteer rejected ===', {
        uid: volunteer.uid,
        name: volunteer.name,
        adminVerified: volunteer.adminVerified,
        verificationStatus: volunteer.verificationStatus
      });

      return NextResponse.json({
        success: true,
        message: 'Independent volunteer rejected',
        volunteer: {
          uid: volunteer.uid,
          name: volunteer.name,
          verificationStatus: volunteer.verificationStatus
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Admin volunteer verification error:', error);

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
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get admin UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Invalid admin token' }, { status: 401 });
    }

    // Get all independent volunteers pending verification
    const pendingVolunteers = await Volunteer.find({
      volunteerType: 'independent',
      adminVerified: false,
      verificationStatus: 'pending'
    }).select('-password');

    console.log('=== DEBUG: Pending independent volunteers ===', {
      count: pendingVolunteers.length,
      volunteers: pendingVolunteers.map(v => ({
        uid: v.uid,
        name: v.name,
        email: v.email,
        aadhaarNumber: v.aadhaarNumber,
        profileCompleted: v.profileCompleted
      }))
    });

    return NextResponse.json({
      success: true,
      pendingVolunteers: pendingVolunteers.map(v => ({
        uid: v.uid,
        name: v.name,
        email: v.email,
        phone: v.phone,
        aadhaarNumber: v.aadhaarNumber,
        profileCompleted: v.profileCompleted,
        createdAt: v.createdAt
      })),
      count: pendingVolunteers.length
    });

  } catch (error) {
    console.error('Get pending volunteers error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
