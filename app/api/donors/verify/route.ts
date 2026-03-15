import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Donor } from '@/models/Donor';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'donor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin or Donor role required' }, { status: 401 });
    }

    const { requestId, action, adminNotes } = await request.json();
    
    if (!requestId || !action) {
      return NextResponse.json({ success: false, message: 'Request ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action. Must be approve or reject' }, { status: 400 });
    }

    // Find and update verification request
    const updatedRequest = await Donor.findOneAndUpdate(
      { uid: requestId },
      { 
        status: action === 'approve' ? 'verified' : 'rejected',
        reviewedBy: user.uid,
        reviewedAt: new Date(),
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ success: false, message: 'Verification request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Donor verification request ${action}d successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error processing donor verification request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
