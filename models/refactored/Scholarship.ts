import mongoose, { Document, Schema } from 'mongoose';

// Scholarship Types
export type Category = 'ST' | 'SC' | 'OBC' | 'General';

// Eligibility Rules Interface
export interface EligibilityRules {
  class?: string;
  state?: string;
  category?: Category;
  incomeLimit?: number;
  minimumMarks?: number;
}

// Scholarship Interface
export interface IScholarship extends Document {
  name: string;
  description: string;
  eligibilityRules: EligibilityRules;
  documentsRequired: string[];
  deadline: Date;
  sponsoringOrg: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Scholarship Schema
const ScholarshipSchema = new Schema<IScholarship>({
  name: {
    type: String,
    required: [true, 'Scholarship name is required'],
    trim: true,
    maxlength: [200, 'Scholarship name cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  eligibilityRules: {
    class: { type: String, trim: true },
    state: { type: String, trim: true },
    category: { 
      type: String, 
      enum: ['ST', 'SC', 'OBC', 'General'] 
    },
    incomeLimit: { 
      type: Number, 
      min: [0, 'Income limit cannot be less than 0'] 
    },
    minimumMarks: { 
      type: Number, 
      min: [0, 'Minimum marks cannot be less than 0'],
      max: [100, 'Minimum marks cannot exceed 100']
    }
  },
  
  documentsRequired: [{
    type: String,
    trim: true
  }],
  
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  
  sponsoringOrg: {
    type: String,
    required: [true, 'Sponsoring organization is required'],
    trim: true
  },
  
  link: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
ScholarshipSchema.index({ state: 1 });
ScholarshipSchema.index({ 'eligibilityRules.category': 1 });
ScholarshipSchema.index({ deadline: 1 });
ScholarshipSchema.index({ sponsoringOrg: 1 });

// Export Scholarship model
export const Scholarship = mongoose.models.Scholarship || mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);
