import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { VerificationRequest } from '@/models/VerificationRequest';

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

    const { requestId, action, adminNotes } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing requestId or action' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid action. Must be approve or reject' 
      }, { status: 400 });
    }

    // Find and update the verification request
    const verificationRequest = await VerificationRequest.findOne({ requestId });
    
    if (!verificationRequest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Verification request not found' 
      }, { status: 404 });
    }

    // Update the verification request
    const updateData: any = {
      status: action,
      reviewedBy: user.uid,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const updatedRequest = await VerificationRequest.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Verification request ${action}d successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error processing verification request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
