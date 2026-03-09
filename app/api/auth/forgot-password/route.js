import { connectDB } from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../../../../models/User";
import School from "../../../../models/School";
import Donor from "../../../../models/Donor";
import Student from "../../../../models/Student";
import Admin from "../../../../models/Admin";

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    await connectDB();

    // Search for user across all collections
    const models = [Admin, School, User, Donor, Student];
    let found = null;
    
    for (const Model of models) {
      const doc = await Model.findOne({ email }).lean();
      if (doc) {
        found = doc;
        break;
      }
    }

    // Always return success to prevent email enumeration attacks
    if (!found) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "If this email exists, password reset instructions have been sent." 
      }), { status: 200 });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { uid: found.uid, type: "password_reset" }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // TODO: Send email with reset link
    // For development, return the token (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Password reset token:", resetToken);
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Password reset token created (development mode).", 
        resetToken,
        resetLink: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`
      }), { status: 200 });
    }

    // In production, you would send an email here
    // await sendPasswordResetEmail(email, resetToken);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "If this email exists, password reset instructions have been sent." 
    }), { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Validation error", 
        errors: error.errors 
      }), { status: 400 });
    }
    
    console.error("Forgot password error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Internal server error" 
    }), { status: 500 });
  }
}
