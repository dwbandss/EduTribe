import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { Volunteer } from '@/models/Volunteer';
import { NGO } from '@/models';

// Validation Schema
const volunteerActionSchema = z.object({
  volunteerUid: z.string().min(1, "Volunteer UID is required"),
  action: z.enum(['verify', 'reject', 'activate', 'deactivate', 'assign'], "Action must be verify, reject, activate, deactivate, or assign")
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid NGO token' }, { status: 401 });
    }

    const ngoUid = decoded.uid;

    // Get volunteers for this NGO
    const ngoVolunteers = await Volunteer.find({ 
      ngoUid: ngoUid,
      type: 'ngo'
    }).select('-password');

    console.log('=== DEBUG: NGO volunteers fetched ===', {
      ngoUid,
      count: ngoVolunteers.length,
      volunteers: ngoVolunteers.map(v => ({
        uid: v.volunteerUid,
        name: v.name,
        email: v.email,
        verified: v.verified,
        status: v.status
      }))
    });

    return NextResponse.json({
      success: true,
      volunteers: ngoVolunteers.map(v => ({
        uid: v.volunteerUid,
        name: v.name,
        email: v.email,
        phone: v.phone,
        verificationStatus: v.verified ? 'verified' : 'pending',
        isActive: v.status === 'active',
        skills: v.profile?.skills || [],
        preferredSubjects: v.profile?.preferredSubjects || [],
        preferredClasses: v.profile?.preferredClasses || [],
        preferredDistrict: v.preferredDistrict || '',
        ratingAverage: v.ratingAverage || 0,
        totalSessions: v.totalSessions || 0,
        totalHours: v.totalHours || 0,
        studentsTaught: v.studentsTaught || 0
      })),
      count: ngoVolunteers.length
    });

  } catch (error) {
    console.error('NGO Volunteers Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid NGO token' }, { status: 401 });
    }

    const ngoUid = decoded.uid;

    // Validate request body
    const body = await request.json();
    const { volunteerUid, action } = volunteerActionSchema.parse(body);

    console.log('=== DEBUG: NGO volunteer action ===', {
      ngoUid,
      volunteerUid,
      action
    });

    // Find NGO volunteer
    const volunteer = await Volunteer.findOne({ 
      ngoUid: ngoUid,
      volunteerUid: volunteerUid,
      type: 'ngo'
    }).select('-password');

    if (!volunteer) {
      return NextResponse.json({ 
        success: false, 
        message: 'NGO volunteer not found' 
      }, { status: 404 });
    }

    // Handle verification action
    if (action === 'verify') {
      volunteer.verified = true;
      volunteer.status = 'active';
      volunteer.ngoUid = ngoUid;
      
      await volunteer.save();

      // Update NGO volunteers array
      const ngo = await NGO.findOne({ ngoUid: ngoUid });
      if (ngo && !ngo.volunteers.includes(volunteer.volunteerUid)) {
        ngo.volunteers.push(volunteer.volunteerUid);
        await ngo.save();
      }

      console.log('=== DEBUG: NGO volunteer verified ===', {
        uid: volunteer.volunteerUid,
        name: volunteer.name,
        verificationStatus: volunteer.verified ? 'verified' : 'pending'
      });

      return NextResponse.json({
        success: true,
        message: 'NGO volunteer verified successfully',
        volunteer: {
          uid: volunteer.volunteerUid,
          name: volunteer.name,
          email: volunteer.email,
          verificationStatus: volunteer.verified ? 'verified' : 'pending'
        }
      });
    }

    // Handle rejection action
    if (action === 'reject') {
      volunteer.verified = false;
      volunteer.status = 'suspended';
      
      await volunteer.save();

      console.log('=== DEBUG: NGO volunteer rejected ===', {
        uid: volunteer.volunteerUid,
        name: volunteer.name,
        verificationStatus: volunteer.verified ? 'verified' : 'pending'
      });

      return NextResponse.json({
        success: true,
        message: 'NGO volunteer rejected',
        volunteer: {
          uid: volunteer.volunteerUid,
          name: volunteer.name,
          verificationStatus: volunteer.verified ? 'verified' : 'pending'
        }
      });
    }

    // Handle activate action
    if (action === 'activate') {
      volunteer.status = 'active';
      await volunteer.save();

      return NextResponse.json({
        success: true,
        message: 'NGO volunteer activated',
        volunteer: {
          uid: volunteer.uid,
          name: volunteer.name,
          isActive: volunteer.isActive
        }
      });
    }

    // Handle deactivate action
    if (action === 'deactivate') {
      volunteer.status = 'suspended';
      await volunteer.save();

      return NextResponse.json({
        success: true,
        message: 'NGO volunteer deactivated',
        volunteer: {
          uid: volunteer.uid,
          name: volunteer.name,
          isActive: volunteer.isActive
        }
      });
    }

    // Handle assign action (assign to school)
    if (action === 'assign') {
      // This would typically open a modal or redirect to assignment page
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Ready to assign volunteer to school',
        volunteer: {
          uid: volunteer.volunteerUid,
          name: volunteer.name,
          ngoUid: volunteer.ngoUid
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('NGO volunteer action error:', error);

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
