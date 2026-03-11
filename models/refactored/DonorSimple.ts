import mongoose, { Document, Schema } from 'mongoose';

// Donor Types
export type DonorType = 'Individual' | 'Corporate' | 'Foundation';

// Donation History Interface
export interface DonationHistory {
  amount: number;
  schoolId?: mongoose.Types.ObjectId;
  projectId?: string;
  date: Date;
}

// Donor Interface
export interface IDonor extends Document {
  userId: mongoose.Types.ObjectId;
  donorType: DonorType;
  organizationName?: string;
  donationHistory: DonationHistory[];
  totalDonated: number;
  createdAt: Date;
  updatedAt: Date;
}

// Donor Schema
const DonorSchema = new Schema<IDonor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  donorType: {
    type: String,
    enum: ['Individual', 'Corporate', 'Foundation'],
    required: [true, 'Donor type is required']
  },
  
  organizationName: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  
  donationHistory: [{
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least 1']
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School'
    },
    projectId: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  totalDonated: {
    type: Number,
    default: 0,
    min: [0, 'Total donated cannot be less than 0']
  }
}, {
  timestamps: true
});

// Indexes
DonorSchema.index({ userId: 1 });
DonorSchema.index({ donorType: 1 });

// Export Donor model
export const Donor = mongoose.models.Donor || mongoose.model<IDonor>('Donor', DonorSchema);
