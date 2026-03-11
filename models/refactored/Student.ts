import mongoose, { Document, Schema } from 'mongoose';

// Student Types
export type TribeCategory = 'ST' | 'SC' | 'OBC' | 'General';

// Student Interface
export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  class: string;
  state: string;
  district: string;
  tribeCategory?: TribeCategory;
  marks?: number;
  familyIncome?: number;
  interests?: string[];
  savedSchools?: mongoose.Types.ObjectId[];
  savedScholarships?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Student Schema
const StudentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School'
  },
  
  class: {
    type: String,
    required: false, // Made optional for student registration
    trim: true
  },
  
  state: {
    type: String,
    required: false, // Made optional for student registration
    trim: true
  },
  
  district: {
    type: String,
    required: false, // Made optional for student registration
    trim: true
  },
  
  tribeCategory: {
    type: String,
    enum: ['ST', 'SC', 'OBC', 'General']
  },
  
  marks: {
    type: Number,
    min: [0, 'Marks cannot be less than 0'],
    max: [100, 'Marks cannot exceed 100']
  },
  
  familyIncome: {
    type: Number,
    min: [0, 'Family income cannot be less than 0']
  },
  
  interests: [{
    type: String,
    trim: true
  }],
  
  savedSchools: [{
    type: Schema.Types.ObjectId,
    ref: 'School'
  }],
  
  savedScholarships: [{
    type: Schema.Types.ObjectId,
    ref: 'Scholarship'
  }]
}, {
  timestamps: true
});

// Indexes
StudentSchema.index({ userId: 1 });
StudentSchema.index({ schoolId: 1 });

// Virtual population
StudentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Export Student model
export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
