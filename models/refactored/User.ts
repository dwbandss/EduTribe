import mongoose, { Document, Schema, HydratedDocument, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

/* -----------------------------
   Types
------------------------------ */

export type UserRole =
  | "volunteer"
  | "ngo"
  | "donor"
  | "student"
  | "admin"
  | "school";

export interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  getJWT(): string;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByRole(role: UserRole): Promise<IUser[]>;
}

/* -----------------------------
   Zod Validation Schema
------------------------------ */

export const userValidationSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),

  role: z.enum(["volunteer", "ngo", "donor", "student", "admin", "school"]),

  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, "Invalid phone number")
    .optional(),

  isVerified: z.boolean().default(false),
});

/* -----------------------------
   Schema
------------------------------ */

const userSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      required: [true, "UID is required"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be less than 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [128, "Password must be less than 128 characters"],
      select: false,
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["volunteer", "ngo", "donor", "student", "admin", "school"],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        const { password, ...result } = ret;
        return result;
      },
    },
  }
);

/* -----------------------------
   Indexes
------------------------------ */

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });

/* -----------------------------
   Password Hash Middleware
------------------------------ */

userSchema.pre("save", async function (this: HydratedDocument<IUser>) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* -----------------------------
   Instance Methods
------------------------------ */

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getJWT = function (): string {
  const JWT_SECRET = process.env.JWT_SECRET as string;

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      uid: this.uid 
    }, 
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* -----------------------------
   Static Methods
------------------------------ */

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByRole = function (role: UserRole) {
  return this.find({ role });
};

/* -----------------------------
   Virtual Profile Relation
------------------------------ */

userSchema.virtual("profile", {
  ref: function (this: IUser) {
    switch (this.role) {
      case "student":
        return "Student";
      case "volunteer":
        return "Volunteer";
      case "school":
        return "School";
      case "ngo":
        return "NGO";
      case "donor":
        return "Donor";
      case "admin":
        return "Admin";
      default:
        return null;
    }
  },
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

/* -----------------------------
   Model Export
------------------------------ */

export const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", userSchema);

/* -----------------------------
   Validation Helper
------------------------------ */

export const validateUser = (data: unknown) => {
  return userValidationSchema.safeParse(data);
};