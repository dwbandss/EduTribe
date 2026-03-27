import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NGO from '@/models/NGO';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { ngoUid, password } = await request.json();

    if (!ngoUid || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'NGO UID and password are required' 
      }, { status: 400 });
    }

    // Find NGO
    const ngo = await NGO.findOne({ ngoUid });
    
    if (!ngo) {
      return NextResponse.json({ 
        success: false, 
        message: 'NGO not found' 
      }, { status: 404 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await NGO.updateOne(
      { ngoUid },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'NGO password set successfully',
      ngoName: ngo.ngoName
    });

  } catch (error) {
    console.error('NGO password setup error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
