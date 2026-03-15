import mongoose, { Document, Schema } from 'mongoose';

// School Interface
export interface ISchool extends Document {
  uid: string;
  schoolName: string;
  email: string;
  phone?: string;
  district: string;
  state: string;
  address?: string;
  subjectsNeeded: string[];
  classesAvailable: string[];
  totalStudents: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// School Schema
const SchoolSchema = new Schema<ISchool>({
  uid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  schoolName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: false,
    default: "Not provided"
  },
  district: { 
    type: String, 
    required: true,
    index: true
  },
  state: { 
    type: String, 
    required: true,
    index: true
  },
  address: { 
    type: String, 
    required: false,
    default: "Not provided"
  },
  subjectsNeeded: [{ 
    type: String, 
    required: true 
  }],
  classesAvailable: [{ 
    type: String, 
    required: true 
  }],
  totalStudents: { 
    type: Number, 
    required: true,
    default: 0
  },
  verificationStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for location queries
SchoolSchema.index({ state: 1, district: 1 });

// Export School model
export const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
export default School;
