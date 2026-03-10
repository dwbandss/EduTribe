import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  class: string;
  tribeCategory: TribeCategory;
  state: string;
  district: string;
  interests: string[];
  scholarshipsApplied: mongoose.Types.ObjectId[];
  academicPerformance: AcademicPerformance;
  familyBackground: FamilyBackground;
  aiRecommendations: AIRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export type TribeCategory = 'scheduled' | 'tribal' | 'other';

export interface AcademicPerformance {
  grade: string;
  subjects: SubjectPerformance[];
  attendance: number; // percentage
  lastUpdated: Date;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  grade: string;
}

export interface FamilyBackground {
  parentsOccupation: string[];
  familyIncome: 'low' | 'medium' | 'high';
  siblingsCount: number;
  firstGenerationStudent: boolean;
}

export interface AIRecommendation {
  type: 'scholarship' | 'course' | 'career' | 'skill';
  title: string;
  description: string;
  confidence: number; // 0-1
  createdAt: Date;
  applied: boolean;
}

// Zod validation schema
export const studentValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  schoolId: z.string().optional(),
  class: z.string().min(1, 'Class is required').max(20, 'Class must be less than 20 characters'),
  tribeCategory: z.enum(['scheduled', 'tribal', 'other']),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  district: z.string().min(2, 'District must be at least 2 characters').max(50, 'District must be less than 50 characters'),
  interests: z.array(z.string().max(50, 'Interest must be less than 50 characters')).max(20, 'Maximum 20 interests allowed'),
  academicPerformance: z.object({
    grade: z.string(),
    subjects: z.array(z.object({
      subject: z.string(),
      score: z.number().min(0).max(100),
      grade: z.string(),
    })),
    attendance: z.number().min(0).max(100),
    lastUpdated: z.date(),
  }).optional(),
  familyBackground: z.object({
    parentsOccupation: z.array(z.string()),
    familyIncome: z.enum(['low', 'medium', 'high']),
    siblingsCount: z.number().min(0),
    firstGenerationStudent: z.boolean(),
  }).optional(),
});

// Mongoose schema
const studentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
    maxlength: [20, 'Class must be less than 20 characters'],
  },
  tribeCategory: {
    type: String,
    required: [true, 'Tribe category is required'],
    enum: ['scheduled', 'tribal', 'other'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    minlength: [2, 'State must be at least 2 characters'],
    maxlength: [50, 'State must be less than 50 characters'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    minlength: [2, 'District must be at least 2 characters'],
    maxlength: [50, 'District must be less than 50 characters'],
  },
  interests: [{
    type: String,
    trim: true,
    maxlength: [50, 'Interest must be less than 50 characters'],
  }],
  scholarshipsApplied: [{
    type: Schema.Types.ObjectId,
    ref: 'Scholarship',
  }],
  academicPerformance: {
    grade: {
      type: String,
      required: true,
    },
    subjects: [{
      subject: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      grade: {
        type: String,
        required: true,
      },
    }],
    attendance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  familyBackground: {
    parentsOccupation: [{
      type: String,
      trim: true,
    }],
    familyIncome: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    siblingsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    firstGenerationStudent: {
      type: Boolean,
      default: false,
    },
  },
  aiRecommendations: [{
    type: {
      type: String,
      enum: ['scholarship', 'course', 'career', 'skill'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    applied: {
      type: Boolean,
      default: false,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for AI matching and analytics
studentSchema.index({ schoolId: 1 });
studentSchema.index({ state: 1, district: 1 });
studentSchema.index({ tribeCategory: 1 });
studentSchema.index({ interests: 1 });
studentSchema.index({ 'academicPerformance.attendance': -1 });
studentSchema.index({ 'familyBackground.familyIncome': 1 });
studentSchema.index({ 'aiRecommendations.type': 1 });
studentSchema.index({ createdAt: -1 });

// Compound indexes for complex queries
studentSchema.index({ state: 1, tribeCategory: 1 });
studentSchema.index({ class: 1, 'academicPerformance.grade': 1 });

// Virtual population
studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

// Static methods
studentSchema.statics.findByState = function(state: string) {
  return this.find({ state }).populate('user');
};

studentSchema.statics.findByTribeCategory = function(category: TribeCategory) {
  return this.find({ tribeCategory: category }).populate('user');
};

studentSchema.statics.findEligibleForScholarship = function() {
  return this.find({
    'familyBackground.familyIncome': 'low',
    'academicPerformance.attendance': { $gte: 75 }
  }).populate('user');
};

// Instance methods
studentSchema.methods.addAIRecommendation = function(recommendation: Partial<AIRecommendation>) {
  this.aiRecommendations.push({
    ...recommendation,
    createdAt: new Date(),
    applied: false,
  });
  return this.save();
};

studentSchema.methods.updateAcademicPerformance = function(performance: Partial<AcademicPerformance>) {
  if (performance.grade) this.academicPerformance.grade = performance.grade;
  if (performance.subjects) this.academicPerformance.subjects = performance.subjects;
  if (performance.attendance !== undefined) this.academicPerformance.attendance = performance.attendance;
  this.academicPerformance.lastUpdated = new Date();
  return this.save();
};

// Export model
export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);

// Validation helper
export const validateStudent = (data: unknown) => {
  return studentValidationSchema.safeParse(data);
};
