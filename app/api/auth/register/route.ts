import { connectDB } from "../../../../lib/mongodb";
import { generateUID } from "../../../../lib/generateUID";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../../../../models/User";
import School from "../../../../models/School";

// Input validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["volunteer", "ngo", "donor", "student", "admin", "school"]),
  schoolName: z.string().optional(),
  schoolCode: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    const { fullName, email, password, role, schoolName, schoolCode, district, state } = validatedData;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email }) || await School.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: "Email already registered" }), { status: 400 });
    }

    const uid = generateUID();
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    if (role === "school") {
      user = new School({
        schoolName: schoolName || fullName,
        schoolCode: schoolCode || "",
        email,
        password: hashedPassword,
        uid,
        district,
        state
      });
    } else {
      user = new User({
        name: fullName,
        email,
        password: hashedPassword,
        uid,
        role
      });
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, role: role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const response = new Response(JSON.stringify({
      success: true,
      uid,
      role,
      message: `Your account has been created. Your login UID is: ${uid}. Please save this UID for login.` 
    }), { status: 201 });

    response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60 * 1000}; Path=/`);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Validation error", 
        errors: error.issues 
      }), { status: 400 });
    }
    
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Internal server error" 
    }), { status: 500 });
  }
}
