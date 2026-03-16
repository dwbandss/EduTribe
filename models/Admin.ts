import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/* =========================
   Admin Interface
========================= */
export interface IAdmin extends Document {
  adminUid: string;
  name: string;
  email: string;
  password: string;
  role: "superAdmin" | "verifier";
  createdAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* =========================
   Admin Schema
========================= */
const AdminSchema = new Schema<IAdmin>({
  adminUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["superAdmin", "verifier"],
    default: "verifier",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================
   Indexes
========================= */

AdminSchema.index({ adminUid: 1 });
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });

/* =========================
   Password Hashing Middleware
========================= */

AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================
   Password Comparison
========================= */

AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/* =========================
   Export Model
========================= */

const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;