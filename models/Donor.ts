import mongoose, { Document, Schema } from "mongoose";

export interface IDonor extends Document {
  name?: string;
  email?: string;
  password?: string;
  uid?: string;
  donorType?: "Individual" | "Corporate" | "Foundation";
  organizationName?: string;
  phone?: string;
  createdAt: Date;
}

const DonorSchema: Schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  uid: { type: String, unique: true },
  donorType: { type: String, enum: ["Individual","Corporate","Foundation"] },
  organizationName: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Donor || mongoose.model<IDonor>("Donor", DonorSchema);
