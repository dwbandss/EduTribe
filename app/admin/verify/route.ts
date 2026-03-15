import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from 'd:/EduTribe/lib/auth/jwt';
import dbConnect from 'd:/EduTribe/lib/dbConnect';
import { NGO } from 'd:/EduTribe/models/NGO';
import { Volunteer } from 'd:/EduTribe/models/VolunteerNew';
import { School } from 'd:/EduTribe/models/School';
import { Student } from 'd:/EduTribe/models/Student';
import { Donor } from 'd:/EduTribe/models/Donor';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin role required' }, { status: 401 });
    }

    const { type, uid } = await request.json();
    
    if (!type || !uid) {
      return NextResponse.json({ success: false, message: 'Type and UID are required' }, { status: 400 });
    }

    let updatedEntity = null;
    let successMessage = '';

    switch (type) {
      case 'ngo':
        updatedEntity = await NGO.findOneAndUpdate(
          { uid },
          { 
            verifiedStatus: 'verified',
            updatedAt: new Date()
          },
          { new: true }
        );
        successMessage = 'NGO verified successfully';
        break;
        
      case 'school':
        updatedEntity = await School.findOneAndUpdate(
          { uid },
          { 
            verificationStatus: 'verified',
            updatedAt: new Date()
          },
          { new: true }
        );
        successMessage = 'School verified successfully';
        break;
        
      case 'volunteer':
        updatedEntity = await Volunteer.findOneAndUpdate(
          { uid },
          { 
            verificationStatus: 'verified',
            updatedAt: new Date()
          },
          { new: true }
        );
        successMessage = 'Volunteer verified successfully';
        break;
        
      case 'student':
        updatedEntity = await Student.findOneAndUpdate(
          { uid },
          { 
            verified: true,
            updatedAt: new Date()
          },
          { new: true }
        );
        successMessage = 'Student verified successfully';
        break;
        
      case "donor":
        updatedEntity = await Donor.findOneAndUpdate(
          { uid },
          { 
            verifiedStatus: 'verified',
            updatedAt: new Date()
          },
          { new: true, upsert: true, runValidators: true }
        );
        successMessage = 'Donor verified successfully';
        break;
        
      default:
        return NextResponse.json({ success: false, message: 'Invalid entity type' }, { status: 400 });
    }

    if (!updatedEntity) {
      return NextResponse.json({ success: false, message: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: updatedEntity
    });

  } catch (error) {
    console.error('Error verifying entity:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
