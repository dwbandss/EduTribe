import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface IVolunteer extends Document {
  userId: mongoose.Types.ObjectId;
  skills: VolunteerSkill[];
  subjects: string[];
  languages: string[];
  educationLevel: EducationLevel;
  experienceYears: number;
  availability: Availability;
  preferredRegions: PreferredRegion[];
  rating: VolunteerRating;
  volunteerHours: number;
  verified: boolean;
  backgroundCheck: BackgroundCheck;
  certifications: Certification[];
  aiMatchScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export type VolunteerSkill = 'teaching' | 'mentoring' | 'counseling' | 'sports' | 'arts' | 'science' | 'mathematics' | 'english' | 'computer' | 'administration';

export type EducationLevel = 'highSchool' | 'bachelors' | 'masters' | 'phd' | 'diploma' | 'other';

export interface Availability {
  weekdays: boolean;
  weekends: boolean;
  mornings: boolean;
  afternoons: boolean;
  evenings: boolean;
  hoursPerWeek: number;
  preferredSchedule: string;
}

export interface PreferredRegion {
  state: string;
  district?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface VolunteerRating {
  average: number;
  count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface BackgroundCheck {
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  documents: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  verified: boolean;
}

// Zod validation schema
export const volunteerValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  skills: z.array(z.enum(['teaching', 'mentoring', 'counseling', 'sports', 'arts', 'science', 'mathematics', 'english', 'computer', 'administration'])),
  subjects: z.array(z.string().max(50, 'Subject must be less than 50 characters')).max(10, 'Maximum 10 subjects allowed'),
  languages: z.array(z.string().max(30, 'Language must be less than 30 characters')).max(10, 'Maximum 10 languages allowed'),
  educationLevel: z.enum(['highSchool', 'bachelors', 'masters', 'phd', 'diploma', 'other']),
  experienceYears: z.number().min(0, 'Experience must be at least 0 years').max(50, 'Experience cannot exceed 50 years'),
  availability: z.object({
    weekdays: z.boolean(),
    weekends: z.boolean(),
    mornings: z.boolean(),
    afternoons: z.boolean(),
    evenings: z.boolean(),
    hoursPerWeek: z.number().min(1).max(40),
    preferredSchedule: z.string().max(100, 'Schedule must be less than 100 characters'),
  }),
  preferredRegions: z.array(z.object({
    state: z.string().min(2, 'State must be at least 2 characters'),
    district: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']),
  })),
  rating: z.object({
    average: z.number().min(0).max(5),
    count: z.number().min(0),
    distribution: z.object({
      5: z.number().min(0),
      4: z.number().min(0),
      3: z.number().min(0),
      2: z.number().min(0),
      1: z.number().min(0),
    }),
  }).optional(),
  verified: z.boolean().default(false),
  backgroundCheck: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    verifiedBy: z.string().optional(),
    verifiedAt: z.date().optional(),
    documents: z.array(z.string()),
  }).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issuedDate: z.date(),
    expiryDate: z.date().optional(),
    verified: z.boolean(),
  })).optional(),
});

// Mongoose schema
const volunteerSchema = new Schema<IVolunteer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  skills: [{
    type: String,
    enum: ['teaching', 'mentoring', 'counseling', 'sports', 'arts', 'science', 'mathematics', 'english', 'computer', 'administration'],
  }],
  subjects: [{
    type: String,
    trim: true,
    maxlength: [50, 'Subject must be less than 50 characters'],
  }],
  languages: [{
    type: String,
    trim: true,
    maxlength: [30, 'Language must be less than 30 characters'],
  }],
  educationLevel: {
    type: String,
    required: [true, 'Education level is required'],
    enum: ['highSchool', 'bachelors', 'masters', 'phd', 'diploma', 'other'],
  },
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: [0, 'Experience must be at least 0 years'],
    max: [50, 'Experience cannot exceed 50 years'],
  },
  availability: {
    weekdays: {
      type: Boolean,
      required: true,
    },
    weekends: {
      type: Boolean,
      required: true,
    },
    mornings: {
      type: Boolean,
      required: true,
    },
    afternoons: {
      type: Boolean,
      required: true,
    },
    evenings: {
      type: Boolean,
      required: true,
    },
    hoursPerWeek: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 hour per week required'],
      max: [40, 'Maximum 40 hours per week allowed'],
    },
    preferredSchedule: {
      type: String,
      trim: true,
      maxlength: [100, 'Schedule must be less than 100 characters'],
    },
  },
  preferredRegions: [{
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'State must be at least 2 characters'],
      maxlength: [50, 'State must be less than 50 characters'],
    },
    district: {
      type: String,
      trim: true,
      maxlength: [50, 'District must be less than 50 characters'],
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
  }],
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    count: {
      type: Number,
      min: [0, 'Rating count must be at least 0'],
      default: 0,
    },
    distribution: {
      5: { type: Number, min: 0, default: 0 },
      4: { type: Number, min: 0, default: 0 },
      3: { type: Number, min: 0, default: 0 },
      2: { type: Number, min: 0, default: 0 },
      1: { type: Number, min: 0, default: 0 },
    },
  },
  volunteerHours: {
    type: Number,
    min: [0, 'Volunteer hours must be at least 0'],
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  backgroundCheck: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    documents: [{
      type: String,
    }],
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    issuedDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  }],
  aiMatchScore: {
    type: Number,
    min: [0, 'AI match score must be at least 0'],
    max: [1, 'AI match score cannot exceed 1'],
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for AI matching and analytics
volunteerSchema.index({ skills: 1 });
volunteerSchema.index({ subjects: 1 });
volunteerSchema.index({ languages: 1 });
volunteerSchema.index({ educationLevel: 1 });
volunteerSchema.index({ experienceYears: -1 });
volunteerSchema.index({ rating: -1 });
volunteerSchema.index({ verified: 1 });
volunteerSchema.index({ 'preferredRegions.state': 1 });
volunteerSchema.index({ 'preferredRegions.priority': 1 });
volunteerSchema.index({ aiMatchScore: -1 });
volunteerSchema.index({ volunteerHours: -1 });

// Compound indexes
volunteerSchema.index({ verified: 1, rating: -1 });
volunteerSchema.index({ skills: 1, 'preferredRegions.state': 1 });
volunteerSchema.index({ experienceYears: -1, educationLevel: 1 });
volunteerSchema.index({ 'availability.weekdays': 1, 'availability.weekends': 1 });

// Virtual population
volunteerSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Static methods
volunteerSchema.statics.findBySkills = function(skills: VolunteerSkill[]) {
  return this.find({ skills: { $in: skills } }).populate('user');
};

volunteerSchema.statics.findByRegion = function(state: string, district?: string) {
  const query: any = { 'preferredRegions.state': state };
  if (district) {
    query['preferredRegions.district'] = district;
  }
  return this.find(query).populate('user');
};

volunteerSchema.statics.findVerified = function() {
  return this.find({ verified: true }).populate('user');
};

volunteerSchema.statics.findHighlyRated = function(minRating: number = 4) {
  return this.find({ 'rating.average': { $gte: minRating } }).populate('user');
};

volunteerSchema.statics.findAvailable = function(weekdays: boolean = true) {
  return this.find({ 
    verified: true,
    [`availability.${weekdays ? 'weekdays' : 'weekends'}`]: true 
  }).populate('user');
};

volunteerSchema.statics.findForAI = function(skills: string[], region: string) {
  return this.find({
    verified: true,
    skills: { $in: skills },
    'preferredRegions.state': region,
    'rating.average': { $gte: 3 }
  }).populate('user');
};

// Instance methods
volunteerSchema.methods.updateRating = function(newRating: number) {
  this.rating.count += 1;
  
  // Update distribution (simple average for demo)
  const newAverage = ((this.rating.average * (this.rating.count - 1)) + newRating) / this.rating.count;
  this.rating.average = Math.round(newAverage * 10) / 10;
  
  // Update distribution (simplified)
  const ratingKey = Math.floor(newRating) as keyof typeof this.rating.distribution;
  this.rating.distribution[ratingKey] = (this.rating.distribution[ratingKey] || 0) + 1;
  
  return this.save();
};

volunteerSchema.methods.addVolunteerHours = function(hours: number) {
  this.volunteerHours += hours;
  return this.save();
};

volunteerSchema.methods.addCertification = function(certification: Partial<Certification>) {
  this.certifications.push({
    ...certification,
    verified: false,
  });
  return this.save();
};

volunteerSchema.methods.updateAIMatchScore = function(score: number) {
  this.aiMatchScore = score;
  return this.save();
};

// Export model
export const Volunteer = mongoose.models.Volunteer || mongoose.model<IVolunteer>('Volunteer', volunteerSchema);

// Validation helper
export const validateVolunteer = (data: unknown) => {
  return volunteerValidationSchema.safeParse(data);
};
