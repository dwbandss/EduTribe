import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Admin } from '@/models';
import { signToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Admin login schema
const adminLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    const body = await request.json();
    const validatedData = adminLoginSchema.parse(body);

    // Find admin by email
    const admin = await Admin.findOne({ email: validatedData.email });
    
    // Debug logging
    console.log('=== ADMIN LOGIN DEBUG ===');
    console.log('Email:', validatedData.email);
    console.log('Admin found:', !!admin);
    if (admin) {
      console.log('Admin UID:', admin.adminUid);
      console.log('Admin name:', admin.name);
      console.log('Has password:', !!admin.password);
    }
    console.log('========================');
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(validatedData.password);
    
    console.log('Password comparison result:', isPasswordValid);
    console.log('Input password length:', validatedData.password.length);
    console.log('Stored password hash length:', admin.password.length);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = signToken({
      uid: admin.adminUid,
      role: 'admin',
      userId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      adminRole: admin.role
    });

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      role: 'admin',
      name: admin.name,
      uid: admin.adminUid,
      admin: {
        adminUid: admin.adminUid,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

