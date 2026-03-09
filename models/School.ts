import mongoose, { Document, Schema } from "mongoose";

export interface ISchool extends Document {
  schoolName: string;
  schoolCode?: string;
  email?: string;
  password: string;
  uid: string;
  district?: string;
  state?: string;
  studentsCount?: number;
  teachersCount?: number;
  needs?: string[];
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
}

const SchoolSchema: Schema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  schoolCode: { type: String, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  uid: { type: String, unique: true, required: true },
  district: String,
  state: String,
  studentsCount: Number,
  teachersCount: Number,
  needs: [String],
  verificationStatus: { type: String, enum: ["pending","verified","rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);
