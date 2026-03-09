import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  password: string;
  uid: string;
  role: "volunteer" | "ngo" | "donor" | "student" | "admin";
  organizationName?: string;
  phone?: string;
  createdAt: Date;
}

const UserSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  uid: { type: String, unique: true, required: true },
  role: { type: String, enum: ["volunteer","ngo","donor","student","admin"], required: true },
  organizationName: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
