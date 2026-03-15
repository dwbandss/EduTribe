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

    // Get donor statistics
    const [totalDonors, verifiedDonors] = await Promise.all([
      Donor.countDocuments(),
      Donor.countDocuments({ verifiedStatus: 'verified' })
    ]);

    const totalDonationsResult = await Donor.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDonations' } } }
    ]);

    const totalDonations = totalDonationsResult[0]?.totalDonations || 0;

    const totalAmountResult = await Donor.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    return NextResponse.json({
      success: true,
      message: 'Donor statistics loaded successfully',
      data: {
        totalDonors,
        verifiedDonors,
        totalDonations,
        totalAmount
      }
    });

  } catch (error) {
    console.error('Error loading donor statistics:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
