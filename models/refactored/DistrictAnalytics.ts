import mongoose, { Document, Schema } from 'mongoose';

// District Analytics Interface
export interface IDistrictAnalytics extends Document {
  state: string;
  district: string;
  schoolsCount: number;
  teachersCount: number;
  dropoutRate?: number;
  literacyRate?: number;
  riskScore?: number;
  insight?: string; // AI generated explanation
  createdAt: Date;
  updatedAt: Date;
}

// District Analytics Schema
const DistrictAnalyticsSchema = new Schema<IDistrictAnalytics>({
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  
  schoolsCount: {
    type: Number,
    required: [true, 'Schools count is required'],
    min: [0, 'Schools count cannot be less than 0']
  },
  
  teachersCount: {
    type: Number,
    required: [true, 'Teachers count is required'],
    min: [0, 'Teachers count cannot be less than 0']
  },
  
  dropoutRate: {
    type: Number,
    min: [0, 'Dropout rate cannot be less than 0'],
    max: [100, 'Dropout rate cannot exceed 100']
  },
  
  literacyRate: {
    type: Number,
    min: [0, 'Literacy rate cannot be less than 0'],
    max: [100, 'Literacy rate cannot exceed 100']
  },
  
  riskScore: {
    type: Number,
    min: [0, 'Risk score cannot be less than 0'],
    max: [100, 'Risk score cannot exceed 100']
  },
  
  insight: {
    type: String,
    trim: true,
    maxlength: [1000, 'Insight cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
DistrictAnalyticsSchema.index({ state: 1 });
DistrictAnalyticsSchema.index({ district: 1 });
DistrictAnalyticsSchema.index({ state: 1, district: 1 });
DistrictAnalyticsSchema.index({ riskScore: 1 });

// Export DistrictAnalytics model
export const DistrictAnalytics = mongoose.models.DistrictAnalytics || mongoose.model<IDistrictAnalytics>('DistrictAnalytics', DistrictAnalyticsSchema);
