import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Import models
import { User } from '@/models/User';
import { School } from '@/models/School';
import { Volunteer } from '@/models/Volunteer';
import { Student } from '@/models/Student';
import { NGO } from '@/models/NGO';
import { Donor } from '@/models/Donor';

// Import database connection
import dbConnect from '@/lib/dbConnect';

// Import UID generator
import { generateUID } from '@/lib/utils/generateUID';

// Validation Schema - fullName optional (required only for student/volunteer, not school/ngo)
const registrationSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["student", "school", "volunteer", "ngo", "donor", "admin"]),
  organizationName: z.string().optional(),
  schoolName: z.string().optional(),
  schoolUid: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  locality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // fullName required for student and volunteer
  if ((data.role === 'student' || data.role === 'volunteer') && (!data.fullName || data.fullName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Full name must be at least 2 characters",
  path: ["fullName"],
});

// Role-specific validation
const roleValidation = {
  school: z.object({
    schoolName: z.string().min(2, "School name is required"),
    district: z.string().min(2, "District is required"),
    state: z.string().min(2, "State is required"),
  }),
  ngo: z.object({
    organizationName: z.string().min(2, "Organization name is required"),
    phone: z.string().min(10, "Phone number is required"),
    district: z.string().min(2, "District is required"),
    locality: z.string().min(2, "Locality is required"),
    address: z.string().min(5, "Address is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  }),
  volunteer: z.object({}), // No additional required fields
  student: z.object({
    schoolUid: z.string().optional(),
  }),
  admin: z.object({}), // No additional required fields
  donor: z.object({}), // No additional required fields
};

export async function POST(request: NextRequest) {
  try {
    // Step 1: Connect to database
    await dbConnect();

    // Step 2: Validate request body
    const body = await request.json();
    console.log('=== DEBUG: Raw request body ===', JSON.stringify(body, null, 2));
    
    const validatedData = registrationSchema.parse(body);
    const { fullName, email, password, role, phone } = validatedData;
    
    console.log('=== DEBUG: Validated data ===', { fullName, email, role, phone });

    // Step 3: Generate UID
    const uid = generateUID(role);

    // Determine name based on role
    let userName = fullName || "";
    if (role === 'school' && body.schoolName) {
      userName = body.schoolName;
    } else if (role === 'ngo' && body.organizationName) {
      userName = body.organizationName;
    }

    // Step 4: Check if email already exists in ALL collections BEFORE creating anything
    console.log("=== DUPLICATE CHECK DEBUG ===");
    console.log("Email to check:", email);
    
    const existingUser = await User.findOne({ email });
    console.log("CHECK USER:", existingUser);
    
    if (existingUser) {
      console.log("User exists with email:", email);
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Check role specific duplicates
    if (role === "school") {
      const existingSchool = await School.findOne({ email });
      console.log("CHECK SCHOOL:", existingSchool);
      if (existingSchool) {
        console.log("School exists with email:", email);
        return NextResponse.json(
          { success: false, message: "A school with this email is already registered" },
          { status: 400 }
        );
      }
    }

    if (role === "volunteer") {
      const existingVolunteer = await Volunteer.findOne({ email });
      console.log("CHECK VOLUNTEER:", existingVolunteer);
      if (existingVolunteer) {
        console.log("Volunteer exists with email:", email);
        return NextResponse.json(
          { success: false, message: "Volunteer already registered" },
          { status: 400 }
        );
      }
    }

    if (role === "student") {
      const existingStudent = await Student.findOne({ email });
      console.log("CHECK STUDENT:", existingStudent);
      if (existingStudent) {
        console.log("Student exists with email:", email);
        return NextResponse.json(
          { success: false, message: "Student already registered" },
          { status: 400 }
        );
      }
    }
    
    console.log("=== NO DUPLICATES FOUND, PROCEEDING ===");

    // Step 5: Use transaction to ensure atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Create User document within transaction
      const user = await User.create([{
        uid,
        name: userName,
        email,
        password: password, // Will be hashed by pre-save hook
        role,
        phone: phone || "",
        isVerified: false,
      }], { session });

      // Step 6: Create role-specific document within the same transaction
      switch (role) {
        case "school": {
          // Validate school-specific fields
          const schoolData = roleValidation.school.parse(validatedData);
          
          await School.create([{
            uid,
            schoolName: schoolData.schoolName,
            email,
            phone: phone || "",
            district: schoolData.district,
            state: schoolData.state,
            address: "Not provided",
            classesAvailable: [],
            subjectsNeeded: [],
            totalStudents: 0,
            verificationStatus: "pending"
          }], { session });
          break;
        }

        case "ngo": {
          // Validate NGO-specific fields
          const ngoData = roleValidation.ngo.parse(validatedData);
          console.log('=== NGO DATA ===');
          console.log('UID:', uid);
          console.log('NGO Data:', ngoData);
          console.log('Email:', email);
          console.log('Phone:', phone);
          
          const ngoCreateData = {
            ngoUid: uid,
            ngoName: ngoData.organizationName,
            email: email,
            phone: ngoData.phone, // Use phone from ngoData
            district: ngoData.district,
            locality: ngoData.locality,
            address: ngoData.address,
            description: ngoData.description,
            verifiedStatus: "pending",
            registrationNumber: `REG-${Date.now()}` // Generate unique registration number
          };
          console.log('NGO Create Data:', ngoCreateData);
          
          await NGO.create([ngoCreateData], { session });
          console.log('NGO created successfully');
          break;
        }

        case "volunteer": {
          await Volunteer.create([{
            uid: uid,
            name: fullName,
            email: email,
            phone: phone || "",
            skills: [],
            preferredSubjects: [],
            preferredClasses: [],
            preferredDistrict: "",
            availability: "",
            verifiedStatus: "pending"
          }], { session });
          break;
        }

        case "student": {
          await Student.create([{
            uid: uid,
            name: fullName,
            email: email,
            phone: phone || "",
            schoolUid: validatedData.schoolUid || "",
            class: "",
            subjects: [],
            verified: false
          }], { session });
          break;
        }

        case "admin": {
          // Admin doesn't need additional documents
          break;
        }

        case "donor": {
          await Donor.create([{
            uid: uid,
            name: fullName,
            email: email,
            phone: phone || "",
            verifiedStatus: "pending",
            totalDonations: 0,
            totalAmount: 0
          }], { session });
          break;
        }

        default:
          throw new Error("Invalid role specified");
      }

      // If everything succeeded, commit the transaction
      await session.commitTransaction();
      console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
      
      return NextResponse.json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} registration successful!`,
        uid: uid
      });

    } catch (error) {
      // If anything failed, abort the transaction
      await session.abortTransaction();
      console.log("=== TRANSACTION ABORTED DUE TO ERROR ===");
      
      console.error("Registration failed:", error);
      // Return more detailed error for debugging
      return NextResponse.json(
        { 
          success: false, 
          message: 'Registration failed. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    } finally {
      // Always end the session
      session.endSession();
    }

  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
