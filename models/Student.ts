import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  name?: string;
  email?: string;
  password?: string;
  uid?: string;
  schoolId?: mongoose.Types.ObjectId;
  class?: string;
  createdAt: Date;
}

const StudentSchema: Schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  uid: { type: String, unique: true },
  schoolId: { type: Schema.Types.ObjectId, ref: "School" },
  class: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
