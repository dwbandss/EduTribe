import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name?: string;
  email?: string;
  password?: string;
  uid?: string;
  role: string;
  permissions?: string[];
  createdAt: Date;
}

const AdminSchema: Schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  uid: { type: String, unique: true },
  role: { type: String, default: "admin" },
  permissions: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
