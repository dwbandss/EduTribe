import mongoose, { Document, Schema } from 'mongoose';

// NGO Types
export type FocusArea = 'education' | 'digitalLiteracy' | 'girlsEducation' | 'teacherTraining';

// NGO Interface
export interface INGO extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  registrationNumber?: string;
  focusAreas: FocusArea[];
  operatingRegions: string[];
  projectsCompleted?: number;
  studentsSupported?: number;
  schoolsSupported?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// NGO Schema
const NGOSchema = new Schema<INGO>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  
  registrationNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  focusAreas: [{
    type: String,
    enum: ['education', 'digitalLiteracy', 'girlsEducation', 'teacherTraining']
  }],
  
  operatingRegions: [{
    type: String,
    trim: true
  }],
  
  projectsCompleted: {
    type: Number,
    min: [0, 'Projects completed cannot be less than 0']
  },
  
  studentsSupported: {
    type: Number,
    min: [0, 'Students supported cannot be less than 0']
  },
  
  schoolsSupported: {
    type: Number,
    min: [0, 'Schools supported cannot be less than 0']
  },
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
NGOSchema.index({ focusAreas: 1 });
NGOSchema.index({ userId: 1 });

// Export NGO model
export const NGO = mongoose.models.NGO || mongoose.model<INGO>('NGO', NGOSchema);
