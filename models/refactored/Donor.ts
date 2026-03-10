import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface IDonor extends Document {
  userId: mongoose.Types.ObjectId;
  donorType: DonorType;
  organizationName?: string;
  donationHistory: DonationRecord[];
  totalDonated: number;
  recurringDonations: RecurringDonation[];
  preferences: DonorPreferences;
  impactMetrics: DonorImpactMetrics;
  verificationStatus: VerificationStatus;
  taxInfo: TaxInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type DonorType = 'Individual' | 'Corporate' | 'Foundation';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface DonationRecord {
  amount: number;
  currency: string;
  date: Date;
  type: 'oneTime' | 'recurring';
  purpose: DonationPurpose;
  paymentMethod: string;
  transactionId: string;
  anonymous: boolean;
  taxReceipt: boolean;
  receiptGenerated: boolean;
}

export type DonationPurpose = 'general' | 'education' | 'infrastructure' | 'scholarship' | 'supplies' | 'teacherTraining' | 'healthcare' | 'sports';

export interface RecurringDonation {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  nextDate: Date;
  endDate?: Date;
  active: boolean;
  purpose: DonationPurpose;
  paymentMethod: string;
  autoDebit: boolean;
}

export interface DonorPreferences {
  interests: string[];
  preferredRegions: string[];
  communicationFrequency: 'immediate' | 'weekly' | 'monthly' | 'quarterly';
  anonymousPreference: boolean;
  impactUpdates: boolean;
  taxReceipts: boolean;
}

export interface DonorImpactMetrics {
  studentsSupported: number;
  schoolsSupported: number;
  projectsFunded: number;
  volunteerHoursEnabled: number;
  lastUpdated: Date;
}

export interface TaxInfo {
  panNumber?: string;
  taxExempt: boolean;
  address80G: TaxAddress;
  donationReceipts: TaxReceipt[];
}

export interface TaxAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface TaxReceipt {
  receiptNumber: string;
  amount: number;
  date: Date;
  purpose: string;
  generatedAt: Date;
  sentTo: string;
}

// Zod validation schema
export const donorValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  donorType: z.enum(['Individual', 'Corporate', 'Foundation']),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(200, 'Organization name must be less than 200 characters').optional(),
  donationHistory: z.array(z.object({
    amount: z.number().min(1, 'Donation amount must be at least 1'),
    currency: z.string().length(3, 'Currency must be exactly 3 characters'),
    date: z.date(),
    type: z.enum(['oneTime', 'recurring']),
    purpose: z.enum(['general', 'education', 'infrastructure', 'scholarship', 'supplies', 'teacherTraining', 'healthcare', 'sports']),
    paymentMethod: z.string(),
    transactionId: z.string(),
    anonymous: z.boolean(),
    taxReceipt: z.boolean(),
    receiptGenerated: z.boolean(),
  })),
  totalDonated: z.number().min(0, 'Total donated must be at least 0'),
  recurringDonations: z.array(z.object({
    amount: z.number().min(1),
    frequency: z.enum(['monthly', 'quarterly', 'annually']),
    nextDate: z.date(),
    endDate: z.date().optional(),
    active: z.boolean(),
    purpose: z.enum(['general', 'education', 'infrastructure', 'scholarship', 'supplies', 'teacherTraining', 'healthcare', 'sports']),
    paymentMethod: z.string(),
    autoDebit: z.boolean(),
  })),
  preferences: z.object({
    interests: z.array(z.string().max(50, 'Interest must be less than 50 characters')),
    preferredRegions: z.array(z.string().max(50, 'Region must be less than 50 characters')),
    communicationFrequency: z.enum(['immediate', 'weekly', 'monthly', 'quarterly']),
    anonymousPreference: z.boolean(),
    impactUpdates: z.boolean(),
    taxReceipts: z.boolean(),
  }),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'suspended']).default('pending'),
  taxInfo: z.object({
    panNumber: z.string().optional(),
    taxExempt: z.boolean(),
    address80G: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      pincode: z.string(),
      country: z.string(),
    }),
    donationReceipts: z.array(z.object({
      receiptNumber: z.string(),
      amount: z.number(),
      date: z.date(),
      purpose: z.string(),
      generatedAt: z.date(),
      sentTo: z.string(),
    })),
  }).optional(),
});

// Mongoose schema
const donorSchema = new Schema<IDonor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  donorType: {
    type: String,
    required: [true, 'Donor type is required'],
    enum: ['Individual', 'Corporate', 'Foundation'],
  },
  organizationName: {
    type: String,
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    maxlength: [200, 'Organization name must be less than 200 characters'],
  },
  donationHistory: [{
    amount: {
      type: Number,
      required: true,
      min: [1, 'Donation amount must be at least 1'],
    },
    currency: {
      type: String,
      required: true,
      length: [3, 'Currency must be exactly 3 characters'],
      uppercase: true,
      default: 'INR',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['oneTime', 'recurring'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['general', 'education', 'infrastructure', 'scholarship', 'supplies', 'teacherTraining', 'healthcare', 'sports'],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    taxReceipt: {
      type: Boolean,
      default: true,
    },
    receiptGenerated: {
      type: Boolean,
      default: false,
    },
  }],
  totalDonated: {
    type: Number,
    min: [0, 'Total donated must be at least 0'],
    default: 0,
  },
  recurringDonations: [{
    amount: {
      type: Number,
      required: true,
      min: [1, 'Recurring donation amount must be at least 1'],
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      required: true,
    },
    nextDate: {
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
    purpose: {
      type: String,
      enum: ['general', 'education', 'infrastructure', 'scholarship', 'supplies', 'teacherTraining', 'healthcare', 'sports'],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    autoDebit: {
      type: Boolean,
      required: true,
      default: false,
    },
  }],
  preferences: {
    interests: [{
      type: String,
      trim: true,
      maxlength: [50, 'Interest must be less than 50 characters'],
    }],
    preferredRegions: [{
      type: String,
      trim: true,
      maxlength: [50, 'Region must be less than 50 characters'],
    }],
    communicationFrequency: {
      type: String,
      enum: ['immediate', 'weekly', 'monthly', 'quarterly'],
      required: true,
      default: 'monthly',
    },
    anonymousPreference: {
      type: Boolean,
      required: true,
      default: false,
    },
    impactUpdates: {
      type: Boolean,
      required: true,
      default: true,
    },
    taxReceipts: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
  },
  taxInfo: {
    panNumber: {
      type: String,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN number format'],
    },
    taxExempt: {
      type: Boolean,
      required: true,
      default: false,
    },
    address80G: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'India',
      },
    },
    donationReceipts: [{
      receiptNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      amount: {
        type: Number,
        required: true,
        min: [1, 'Receipt amount must be at least 1'],
      },
      date: {
        type: Date,
        required: true,
      },
      purpose: {
        type: String,
        required: true,
        trim: true,
      },
      generatedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      sentTo: {
        type: String,
        required: true,
        trim: true,
      },
    }],
  },
}, {
  timestamps: true,
});

// Indexes for analytics and reporting
donorSchema.index({ donorType: 1 });
donorSchema.index({ organizationName: 1 });
donorSchema.index({ verificationStatus: 1 });
donorSchema.index({ totalDonated: -1 });
donorSchema.index({ 'donationHistory.date': -1 });
donorSchema.index({ 'donationHistory.purpose': 1 });
donorSchema.index({ 'recurringDonations.active': 1 });
donorSchema.index({ 'preferences.preferredRegions': 1 });
donorSchema.index({ createdAt: -1 });

// Compound indexes
donorSchema.index({ donorType: 1, totalDonated: -1 });
donorSchema.index({ verificationStatus: 1, totalDonated: -1 });
donorSchema.index({ 'donationHistory.purpose': 1, 'donationHistory.date': -1 });
donorSchema.index({ 'recurringDonations.active': 1, 'recurringDonations.frequency': 1 });

// Virtual population
donorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Static methods
donorSchema.statics.findByDonorType = function(donorType: DonorType) {
  return this.find({ donorType }).populate('user');
};

donorSchema.statics.findVerified = function() {
  return this.find({ verificationStatus: 'verified' }).populate('user');
};

donorSchema.statics.findTopDonors = function(limit: number = 10) {
  return this.find({ verificationStatus: 'verified' })
    .sort({ totalDonated: -1 })
    .limit(limit)
    .populate('user');
};

donorSchema.statics.findByDonationRange = function(minAmount: number, maxAmount?: number) {
  const query: any = { totalDonated: { $gte: minAmount } };
  if (maxAmount) {
    query.totalDonated.$lte = maxAmount;
  }
  return this.find(query).populate('user');
};

donorSchema.statics.findByPurpose = function(purpose: DonationPurpose) {
  return this.find({ 'donationHistory.purpose': purpose }).populate('user');
};

donorSchema.statics.findRecurringDonors = function() {
  return this.find({ 'recurringDonations.active': true }).populate('user');
};

donorSchema.statics.findTaxExempt = function() {
  return this.find({ 'taxInfo.taxExempt': true }).populate('user');
};

// Instance methods
donorSchema.methods.addDonation = function(donation: Partial<DonationRecord>) {
  this.donationHistory.push({
    ...donation,
    date: new Date(),
    receiptGenerated: false,
  });
  
  // Update total donated
  if (donation.amount) {
    this.totalDonated += donation.amount;
  }
  
  return this.save();
};

donorSchema.methods.addRecurringDonation = function(recurring: Partial<RecurringDonation>) {
  this.recurringDonations.push({
    ...recurring,
    active: true,
  });
  return this.save();
};

donorSchema.methods.updateTotalDonated = function() {
  // Recalculate total from donation history
  this.totalDonated = this.donationHistory.reduce((total: number, donation: any) => total + donation.amount, 0);
  return this.save();
};

donorSchema.methods.generateTaxReceipt = function(receiptData: Partial<TaxReceipt>) {
  const receipt: TaxReceipt = {
    receiptNumber: `EDU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amount: receiptData.amount || 0,
    date: receiptData.date || new Date(),
    purpose: receiptData.purpose || 'general',
    generatedAt: new Date(),
    sentTo: receiptData.sentTo || '',
  };
  
  this.taxInfo?.donationReceipts.push(receipt);
  return this.save();
};

donorSchema.methods.updateImpactMetrics = function(metrics: Partial<DonorImpactMetrics>) {
  if (metrics.studentsSupported !== undefined) this.impactMetrics.studentsSupported = metrics.studentsSupported;
  if (metrics.schoolsSupported !== undefined) this.impactMetrics.schoolsSupported = metrics.schoolsSupported;
  if (metrics.projectsFunded !== undefined) this.impactMetrics.projectsFunded = metrics.projectsFunded;
  if (metrics.volunteerHoursEnabled !== undefined) this.impactMetrics.volunteerHoursEnabled = metrics.volunteerHoursEnabled;
  this.impactMetrics.lastUpdated = new Date();
  return this.save();
};

donorSchema.methods.deactivateRecurringDonation = function(recurringId: string) {
  const recurring = this.recurringDonations.id(recurringId);
  if (recurring) {
    recurring.active = false;
  }
  return this.save();
};

// Export model
export const Donor = mongoose.models.Donor || mongoose.model<IDonor>('Donor', donorSchema);

// Validation helper
export const validateDonor = (data: unknown) => {
  return donorValidationSchema.safeParse(data);
};
