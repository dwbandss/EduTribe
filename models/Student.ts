import mongoose, { Document, Schema, Model } from "mongoose";

/*
|--------------------------------------------------------------------------
| Student Interface
|--------------------------------------------------------------------------
*/

export interface IStudent extends Document {
  uid: string;
  name: string;
  email: string;
  schoolUid: string;
  ngoUid: string; // Link to NGO
  class?: string;
  state?: string;
  category?: string;

  currentInstitution?: string;
  targetCourses?: string;

  phone?: string;
  income?: number;
  marks?: number;

  subjects?: string[];
  verified?: boolean;

  assignedVolunteerUid?: string;

  createdAt: Date;
  updatedAt: Date;
}

/*
|--------------------------------------------------------------------------
| Student Schema
|--------------------------------------------------------------------------
*/

const StudentSchema = new Schema<IStudent>(
  {
    uid: {
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
      index: true
    },

    schoolUid: {
      type: String,
      required: true,
      index: true
    },
    ngoUid: {
      type: String,
      required: false, // Optional until NGO assignment
      index: true
    },
    class: {
      type: String,
      default: "",
      index: true
    },

    state: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: ""
    },

    currentInstitution: {
      type: String,
      default: ""
    },

    targetCourses: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    income: {
      type: Number,
      default: 0
    },

    marks: {
      type: Number,
      default: 0
    },

    subjects: {
      type: [String],
      default: []
    },

    assignedVolunteerUid: {
      type: String,
      required: false,
      index: true
    },

    verified: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Prevent Model Overwrite in Next.js
|--------------------------------------------------------------------------
*/

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
export { Student };