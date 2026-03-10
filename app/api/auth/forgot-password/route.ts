import { connectDB } from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { NextResponse } from "next/server";
import { User } from "../../../../models/refactored";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        {
          success: true,
          message:
            "If this email exists, password reset instructions have been sent.",
        },
        { status: 200 }
      );
    }

    // Create reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // TODO: Send email with reset link
    // Example link:
    // https://yourdomain.com/reset-password?token=RESET_TOKEN

    if (process.env.NODE_ENV === "development") {
      console.log("Password reset token:", resetToken);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If this email exists, password reset instructions have been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}