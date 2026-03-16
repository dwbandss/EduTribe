import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@edutribe.org" });
    if (existingAdmin) {
      // Delete existing admin to recreate with new password hash
      await Admin.deleteOne({ email: "admin@edutribe.org" });
      console.log("🗑️ Deleted existing admin account");
    }

    // Create admin account (model will hash password automatically)
    const admin = await Admin.create({
      adminUid: "ADM-001",
      name: "EduTribe Super Admin",
      email: "admin@edutribe.org",
      password: "Admin@123", // Plain password - model will hash it
      role: "superAdmin"
    });

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@edutribe.org");
    console.log("Password: Admin@123");
    console.log("Admin UID:", admin.adminUid);

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin: {
        adminUid: admin.adminUid,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error: any) {
    console.error("❌ Error creating admin:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create admin",
      error: error.message
    }, { status: 500 });
  }
}
