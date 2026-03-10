import { connectDB } from "../../../../lib/mongodb";
import { generateUID } from "../../../../lib/generateUID";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User, School } from "../../../../models/refactored";

/* -----------------------------
   Helpers
------------------------------ */

// Convert "" -> undefined so optional fields don't fail validation
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/* -----------------------------
   Base Schema
------------------------------ */

const baseSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["volunteer", "ngo", "donor", "student", "admin", "school"]),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
});

/* -----------------------------
   Role-specific fields (optional here)
------------------------------ */

const registerSchema = baseSchema
  .extend({
    organizationName: z.preprocess(emptyToUndefined, z.string().optional()),
    schoolName: z.preprocess(emptyToUndefined, z.string().optional()),
    schoolCode: z.preprocess(emptyToUndefined, z.string().optional()),
    district: z.preprocess(emptyToUndefined, z.string().optional()),
    state: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .superRefine((data, ctx) => {
    // Password match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords don't match",
      });
    }

    // NGO requirement
    if (data.role === "ngo" && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationName"],
        message: "Organization name is required for NGO",
      });
    }

    // School requirements
    if (data.role === "school") {
      if (!data.schoolName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["schoolName"],
          message: "School name is required",
        });
      }

      if (!data.district) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["district"],
          message: "District is required",
        });
      }

      if (!data.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["state"],
          message: "State is required",
        });
      }
    }
  });

const JWT_SECRET = process.env.JWT_SECRET as string;

/* -----------------------------
   Register API
------------------------------ */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email already registered",
        }),
        { status: 400 }
      );
    }

    const uid = generateUID(data.role);

    const user = await User.create({
      uid,
      name:
        data.role === "school"
          ? data.schoolName
          : data.role === "ngo"
          ? data.organizationName
          : data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || "",
      isVerified: false,
    });

    /* -----------------------------
       Create School Profile
    ------------------------------ */

    if (data.role === "school") {
      await School.create({
        userId: user._id,
        schoolName: data.schoolName,
        schoolCode: data.schoolCode || `SCH-${Date.now()}`,
        district: data.district,
        state: data.state,
        locationCoordinates: {
          type: "Point",
          coordinates: [0, 0],
        },
        studentsCount: 0,
        teachersCount: 0,
        facilities: [],
        needs: [],
        verificationStatus: "pending",
      });
    }

    /* -----------------------------
       Generate JWT
    ------------------------------ */

    const token = jwt.sign(
      {
        userId: user._id,
        uid: user.uid,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = new Response(
      JSON.stringify({
        success: true,
        uid: user.uid,
        role: user.role,
        token,
        message: "Account created successfully",
      }),
      { status: 201 }
    );

    response.headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("ZOD ERROR:", error.issues); // helps debugging

      return new Response(
        JSON.stringify({
          success: false,
          message: "Validation error",
          errors: error.issues,
        }),
        { status: 400 }
      );
    }

    console.error("Register error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}