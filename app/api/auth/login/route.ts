import { connectDB } from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../../../../models/refactored";

const loginSchema = z.object({
  uid: z.string().min(3, "UID is required"),
  password: z.string().min(1, "Password is required")
});

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {

    const body = await req.json();

    // Validate request
    const { uid, password } = loginSchema.parse(body);

    await connectDB();

    // Find user by UID
    const user = await User.findOne({ uid }).select("+password");

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid UID or password"
        }),
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid UID or password"
        }),
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        uid: user.uid,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = new Response(
      JSON.stringify({
        success: true,
        token,
        uid: user.uid,
        role: user.role,
        name: user.name
      }),
      { status: 200 }
    );

    response.headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
    );

    return response;

  } catch (error) {

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Validation error",
          errors: error.issues
        }),
        { status: 400 }
      );
    }

    console.error("Login error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error"
      }),
      { status: 500 }
    );
  }
}