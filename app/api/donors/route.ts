import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Donor } from '@/models/Donor';

export async function GET(request: NextRequest) {
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

    // Get all donors
    const donors = await Donor.find({}).select('uid name email phone organizationType totalDonations totalAmount verifiedStatus createdAt').lean();

    return NextResponse.json({
      success: true,
      message: 'Donors loaded successfully',
      data: donors
    });

  } catch (error) {
    console.error('Error loading donors:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
