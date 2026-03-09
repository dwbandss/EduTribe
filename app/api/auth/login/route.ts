import { connectDB } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../../../../models/User";
import School from "../../../../models/School";
import Donor from "../../../../models/Donor";
import Student from "../../../../models/Student";
import Admin from "../../../../models/Admin";

// Simple rate limiting (in production, use Redis or a proper rate limiting service)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 60 * 1000; // 1 minute

// Input validation schema
const loginSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  password: z.string().min(1, "Password is required")
});

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter((time: number) => now - time < ATTEMPT_WINDOW);
  
  if (validAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }
  
  validAttempts.push(now);
  loginAttempts.set(ip, validAttempts);
  return true;
}

async function findByUid(uid: string) {
  // Search in collections; return { doc, modelName }
  const models = [Admin, School, User, Donor, Student];
  for (const Model of models) {
    if (!Model) continue;
    const doc = await Model.findOne({ uid }).lean();
    if (doc) return { doc, Model };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Too many login attempts. Please try again later." 
      }), { status: 429 });
    }

    const body = await req.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    const { uid, password } = validatedData;

    await connectDB();

    const found = await findByUid(uid);
    if (!found) {
      return new Response(JSON.stringify({ success: false, message: "Invalid UID or password." }), { status: 401 });
    }

    const { doc } = found;
    const match = await bcrypt.compare(password, doc.password);
    if (!match) {
      return new Response(JSON.stringify({ success: false, message: "Invalid UID or password." }), { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { uid: doc.uid, role: doc.role || "school" }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const response = new Response(JSON.stringify({ 
      success: true, 
      token, 
      role: doc.role || "school", 
      uid: doc.uid,
      name: doc.name || doc.schoolName
    }), { status: 200 });

    response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60 * 1000}; Path=/`);

    // Clear login attempts on successful login
    loginAttempts.delete(clientIP);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Validation error", 
        errors: error.issues 
      }), { status: 400 });
    }
    
    console.error("Login error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Internal server error" 
    }), { status: 500 });
  }
}
