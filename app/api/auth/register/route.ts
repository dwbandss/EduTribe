import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Import models
import { User } from "@/models/refactored";
import { School } from "@/models/refactored/SchoolSimple";
import { Volunteer } from "@/models/volunteer";
import { Student } from "@/models/refactored/Student";
import { NGO } from "@/models/refactored/NGOSimple";
import { Donor } from "@/models/refactored/DonorSimple";
import { Admin } from "@/models/refactored/AdminSimple";

// Import database connection
import dbConnect from "@/lib/dbConnect";

// Import UID generator
import { generateUID } from "@/lib/utils/generateUID";

// Validation Schema
const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["student", "school", "volunteer", "ngo", "donor", "admin"]),
  organizationName: z.string().optional(),
  schoolName: z.string().optional(),
  schoolCode: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Role-specific validation
const roleValidation = {
  school: z.object({
    schoolName: z.string().min(2, "School name is required"),
    district: z.string().min(2, "District is required"),
    state: z.string().min(2, "State is required"),
    schoolCode: z.string().optional(),
  }),
  ngo: z.object({
    organizationName: z.string().min(2, "Organization name is required"),
  }),
  volunteer: z.object({}), // No additional required fields
  student: z.object({}), // No additional required fields
  donor: z.object({}), // No additional required fields
  admin: z.object({}), // No additional required fields
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

    // Step 4: Create User document
  

    const user = await User.create({
      uid,
      name: fullName,
      email,
      password: password,
      role,
      phone: phone || "",
      isVerified: false,
    });

    // Step 6: Create role-specific document
    switch (role) {
      case "school": {
        // Validate school-specific fields
        const schoolData = roleValidation.school.parse(validatedData);
        
        await School.create({
          userId: user._id,
          schoolName: schoolData.schoolName,
          schoolCode: schoolData.schoolCode || `SCH-${Date.now()}`,
          district: schoolData.district,
          state: schoolData.state,
          location: {
            type: 'Point',
            coordinates: [85.8234, 22.7956] // Default coordinates for Odisha
          },
          facilities: {
            hostel: false,
            sports: false,
            scienceLab: false,
            digitalClassroom: false,
            library: false,
            computerLab: false
          },
          streamsOffered: [],
          needs: [],
          contact: {
            phone: phone || "",
            email: email,
            address: "",
            city: schoolData.district,
            district: schoolData.district,
            state: schoolData.state,
            pincode: ""
          },
          verificationStatus: "pending"
        });
        break;
      }

      case "ngo": {
        // Validate NGO-specific fields
        const ngoData = roleValidation.ngo.parse(validatedData);
        
        await NGO.create({
          userId: user._id,
          organizationName: ngoData.organizationName,
          verificationStatus: "pending",
        });
        break;
      }

      case "volunteer": {
        const volunteerData = {
          userId: user._id,
          name: validatedData.fullName,
          email: email,
          phone: phone || "",
          location: {
            type: "Point",
            coordinates: [85.8234, 22.7956] // Default coordinates for Odisha
          },
          skills: [],
          languages: [],
          availability: [
            {
              day: "Monday",
              timeSlots: ["9:00-12:00", "14:00-17:00"]
            }
          ],
          rating: 0,
          profileVisibility: "public",
          bio: "",
          education: "",
          experience: "",
          isActive: true,
          verified: false
        };
        
        console.log('Creating volunteer with data:', volunteerData);
        
        // Use Volunteer.create() to avoid constructor issues
        await Volunteer.create(volunteerData);
        break;
      }

      case "student": {
        await Student.create({
          userId: user._id,
          class: "",
          state: "",
          district: "",
        });
        break;
      }

      case "donor": {
        await Donor.create({
          userId: user._id,
          donorType: "Individual",
          organizationName: validatedData.organizationName || "",
          donationHistory: [],
          totalDonated: 0,
        });
        break;
      }

      case "admin": {
        await Admin.create({
          userId: user._id,
          role: "admin",
          permissions: [],
        });
        break;
      }

      default:
        throw new Error(`Invalid role: ${role}`);
    }

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      uid,
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });

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
