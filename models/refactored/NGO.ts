import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface INGO extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  registrationNumber: string;
  focusAreas: NGOFocusArea[];
  operatingRegions: OperatingRegion[];
  projectsCompleted: number;
  studentsSupported: number;
  schoolsSupported: number;
  verificationStatus: VerificationStatus;
  financialDetails: FinancialDetails;
  teamDetails: TeamDetails;
  impactMetrics: ImpactMetrics;
  partnerships: Partnership[];
  createdAt: Date;
  updatedAt: Date;
}

export type NGOFocusArea = 'education' | 'digitalLiteracy' | 'girlsEducation' | 'teacherTraining' | 'healthcare' | 'environment' | 'skillDevelopment' | 'ruralDevelopment';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface OperatingRegion {
  state: string;
  district?: string[];
  priority: 'high' | 'medium' | 'low';
  activeSince: Date;
}

export interface FinancialDetails {
  annualBudget: number;
  fundingSources: string[];
  lastAuditDate?: Date;
  financialTransparency: 'public' | 'private' | 'partial';
  taxExempt: boolean;
  panNumber?: string;
}

export interface TeamDetails {
  totalEmployees: number;
  fullTimeVolunteers: number;
  boardMembers: BoardMember[];
  keyPersonnel: KeyPersonnel[];
}

export interface BoardMember {
  name: string;
  position: string;
  experience: string;
  verified: boolean;
}

export interface KeyPersonnel {
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
}

export interface ImpactMetrics {
  studentsReached: number;
  schoolsPartnered: number;
  teachersTrained: number;
  communitiesServed: number;
  projectsCompleted: number;
  lastUpdated: Date;
}

export interface Partnership {
  organizationType: 'government' | 'corporate' | 'foundation' | 'ngo' | 'international';
  organizationName: string;
  partnershipType: 'funding' | 'implementation' | 'technical' | 'strategic';
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

// Zod validation schema
export const ngoValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(200, 'Organization name must be less than 200 characters'),
  registrationNumber: z.string().min(5, 'Registration number must be at least 5 characters').max(50, 'Registration number must be less than 50 characters'),
  focusAreas: z.array(z.enum(['education', 'digitalLiteracy', 'girlsEducation', 'teacherTraining', 'healthcare', 'environment', 'skillDevelopment', 'ruralDevelopment'])),
  operatingRegions: z.array(z.object({
    state: z.string().min(2, 'State must be at least 2 characters'),
    district: z.array(z.string()).optional(),
    priority: z.enum(['high', 'medium', 'low']),
    activeSince: z.date(),
  })),
  projectsCompleted: z.number().min(0, 'Projects completed must be at least 0'),
  studentsSupported: z.number().min(0, 'Students supported must be at least 0'),
  schoolsSupported: z.number().min(0, 'Schools supported must be at least 0'),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'suspended']).default('pending'),
  financialDetails: z.object({
    annualBudget: z.number().min(0),
    fundingSources: z.array(z.string()),
    lastAuditDate: z.date().optional(),
    financialTransparency: z.enum(['public', 'private', 'partial']),
    taxExempt: z.boolean(),
    panNumber: z.string().optional(),
  }),
  teamDetails: z.object({
    totalEmployees: z.number().min(0),
    fullTimeVolunteers: z.number().min(0),
    boardMembers: z.array(z.object({
      name: z.string(),
      position: z.string(),
      experience: z.string(),
      verified: z.boolean(),
    })),
    keyPersonnel: z.array(z.object({
      name: z.string(),
      role: z.string(),
      email: z.string().email(),
      phone: z.string(),
      department: z.string(),
    })),
  }),
  impactMetrics: z.object({
    studentsReached: z.number().min(0),
    schoolsPartnered: z.number().min(0),
    teachersTrained: z.number().min(0),
    communitiesServed: z.number().min(0),
    projectsCompleted: z.number().min(0),
    lastUpdated: z.date(),
  }),
  partnerships: z.array(z.object({
    organizationType: z.enum(['government', 'corporate', 'foundation', 'ngo', 'international']),
    organizationName: z.string(),
    partnershipType: z.enum(['funding', 'implementation', 'technical', 'strategic']),
    startDate: z.date(),
    endDate: z.date().optional(),
    active: z.boolean(),
  })),
});

// Mongoose schema
const ngoSchema = new Schema<INGO>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    maxlength: [200, 'Organization name must be less than 200 characters'],
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    minlength: [5, 'Registration number must be at least 5 characters'],
    maxlength: [50, 'Registration number must be less than 50 characters'],
  },
  focusAreas: [{
    type: String,
    enum: ['education', 'digitalLiteracy', 'girlsEducation', 'teacherTraining', 'healthcare', 'environment', 'skillDevelopment', 'ruralDevelopment'],
  }],
  operatingRegions: [{
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'State must be at least 2 characters'],
      maxlength: [50, 'State must be less than 50 characters'],
    },
    district: [{
      type: String,
      trim: true,
      maxlength: [50, 'District must be less than 50 characters'],
    }],
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    activeSince: {
      type: Date,
      required: true,
    },
  }],
  projectsCompleted: {
    type: Number,
    min: [0, 'Projects completed must be at least 0'],
    default: 0,
  },
  studentsSupported: {
    type: Number,
    min: [0, 'Students supported must be at least 0'],
    default: 0,
  },
  schoolsSupported: {
    type: Number,
    min: [0, 'Schools supported must be at least 0'],
    default: 0,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
  },
  financialDetails: {
    annualBudget: {
      type: Number,
      required: true,
      min: [0, 'Annual budget must be at least 0'],
    },
    fundingSources: [{
      type: String,
      trim: true,
    }],
    lastAuditDate: {
      type: Date,
    },
    financialTransparency: {
      type: String,
      enum: ['public', 'private', 'partial'],
      required: true,
    },
    taxExempt: {
      type: Boolean,
      required: true,
    },
    panNumber: {
      type: String,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN number format'],
    },
  },
  teamDetails: {
    totalEmployees: {
      type: Number,
      required: true,
      min: [0, 'Total employees must be at least 0'],
    },
    fullTimeVolunteers: {
      type: Number,
      required: true,
      min: [0, 'Full-time volunteers must be at least 0'],
    },
    boardMembers: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      position: {
        type: String,
        required: true,
        trim: true,
      },
      experience: {
        type: String,
        required: true,
        trim: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    }],
    keyPersonnel: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      role: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      department: {
        type: String,
        required: true,
        trim: true,
      },
    }],
  },
  impactMetrics: {
    studentsReached: {
      type: Number,
      required: true,
      min: [0, 'Students reached must be at least 0'],
      default: 0,
    },
    schoolsPartnered: {
      type: Number,
      required: true,
      min: [0, 'Schools partnered must be at least 0'],
      default: 0,
    },
    teachersTrained: {
      type: Number,
      required: true,
      min: [0, 'Teachers trained must be at least 0'],
      default: 0,
    },
    communitiesServed: {
      type: Number,
      required: true,
      min: [0, 'Communities served must be at least 0'],
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      required: true,
      min: [0, 'Projects completed must be at least 0'],
      default: 0,
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  partnerships: [{
    organizationType: {
      type: String,
      enum: ['government', 'corporate', 'foundation', 'ngo', 'international'],
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    partnershipType: {
      type: String,
      enum: ['funding', 'implementation', 'technical', 'strategic'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for AI matching and analytics
ngoSchema.index({ organizationName: 1 });
ngoSchema.index({ focusAreas: 1 });
ngoSchema.index({ 'operatingRegions.state': 1 });
ngoSchema.index({ verificationStatus: 1 });
ngoSchema.index({ projectsCompleted: -1 });
ngoSchema.index({ studentsSupported: -1 });
ngoSchema.index({ schoolsSupported: -1 });
ngoSchema.index({ 'financialDetails.annualBudget': -1 });
ngoSchema.index({ 'impactMetrics.studentsReached': -1 });
ngoSchema.index({ createdAt: -1 });

// Compound indexes
ngoSchema.index({ verificationStatus: 1, 'impactMetrics.studentsReached': -1 });
ngoSchema.index({ focusAreas: 1, 'operatingRegions.state': 1 });
ngoSchema.index({ 'operatingRegions.priority': 1, 'impactMetrics.schoolsPartnered': -1 });
ngoSchema.index({ 'partnerships.active': 1, 'partnerships.organizationType': 1 });

// Virtual population
ngoSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Static methods
ngoSchema.statics.findByFocusArea = function(focusArea: NGOFocusArea) {
  return this.find({ focusAreas: focusArea }).populate('user');
};

ngoSchema.statics.findByRegion = function(state: string) {
  return this.find({ 'operatingRegions.state': state }).populate('user');
};

ngoSchema.statics.findVerified = function() {
  return this.find({ verificationStatus: 'verified' }).populate('user');
};

ngoSchema.statics.findByBudget = function(minBudget: number, maxBudget?: number) {
  const query: any = { 'financialDetails.annualBudget': { $gte: minBudget } };
  if (maxBudget) {
    query['financialDetails.annualBudget'].$lte = maxBudget;
  }
  return this.find(query).populate('user');
};

ngoSchema.statics.findHighImpact = function(minStudentsReached: number = 1000) {
  return this.find({
    verificationStatus: 'verified',
    'impactMetrics.studentsReached': { $gte: minStudentsReached }
  }).populate('user');
};

ngoSchema.statics.findForPartnership = function(focusArea: NGOFocusArea, region: string) {
  return this.find({
    verificationStatus: 'verified',
    focusAreas: { $in: [focusArea] },
    'operatingRegions.state': region,
    'partnerships.active': true
  }).populate('user');
};

// Instance methods
ngoSchema.methods.updateImpactMetrics = function(metrics: Partial<ImpactMetrics>) {
  if (metrics.studentsReached !== undefined) this.impactMetrics.studentsReached = metrics.studentsReached;
  if (metrics.schoolsPartnered !== undefined) this.impactMetrics.schoolsPartnered = metrics.schoolsPartnered;
  if (metrics.teachersTrained !== undefined) this.impactMetrics.teachersTrained = metrics.teachersTrained;
  if (metrics.communitiesServed !== undefined) this.impactMetrics.communitiesServed = metrics.communitiesServed;
  if (metrics.projectsCompleted !== undefined) this.impactMetrics.projectsCompleted = metrics.projectsCompleted;
  this.impactMetrics.lastUpdated = new Date();
  return this.save();
};

ngoSchema.methods.addPartnership = function(partnership: Partial<Partnership>) {
  this.partnerships.push({
    ...partnership,
    active: true,
  });
  return this.save();
};

ngoSchema.methods.updateVerificationStatus = function(status: VerificationStatus) {
  this.verificationStatus = status;
  return this.save();
};

ngoSchema.methods.incrementProjectCount = function() {
  this.projectsCompleted += 1;
  this.impactMetrics.projectsCompleted += 1;
  return this.save();
};

// Export model
export const NGO = mongoose.models.NGO || mongoose.model<INGO>('NGO', ngoSchema);

// Validation helper
export const validateNGO = (data: unknown) => {
  return ngoValidationSchema.safeParse(data);
};
