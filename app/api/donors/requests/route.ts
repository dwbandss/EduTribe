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

    const { targetUid, targetType, reason } = await request.json();
    
    if (!targetUid || !targetType || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: 'Target UID, target type, and reason are required' 
      }, { status: 400 });
    }

    if (!['ngo', 'school'].includes(targetType)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid target type. Must be ngo or school' 
      }, { status: 400 });
    }

    // Create verification request
    const verificationRequest = new Donor({
      requestId: `DR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      requesterType: 'donor',
      requesterUid: user.uid,
      requesterName: user.name || 'Donor',
      targetUid,
      targetType,
      reason,
      status: 'pending',
      createdAt: new Date()
    });

    await verificationRequest.save();

    return NextResponse.json({
      success: true,
      message: 'Donor verification request submitted successfully',
      data: verificationRequest
    });

  } catch (error) {
    console.error('Error creating donor verification request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
