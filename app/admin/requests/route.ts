import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { VerificationRequest } from '@/models/VerificationRequest';

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const targetType = searchParams.get('targetType');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    // Fetch verification requests
    const requests = await VerificationRequest.find(query)
      .populate('requesterName', 'targetName')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: `Found ${requests.length} verification requests`,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching verification requests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
