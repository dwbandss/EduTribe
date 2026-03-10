import mongoose, { Document, Schema } from 'mongoose';

// School document interface
export interface ISchool extends Document {
  name: string;
  type: 'government' | 'private' | 'aided';
  board: string;
  state: string;
  district: string;
  classesOffered: string[];
  admissionProcess: string;
  requiredDocuments: string[];
  eligibilityCriteria: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  website?: string;
  lastUpdated: Date;
}

// School schema
const schoolSchema = new Schema<ISchool>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['government', 'private', 'aided'],
    required: true
  },
  board: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  district: {
    type: String,
    required: true,
    index: true
  },
  classesOffered: [{
    type: String
  }],
  admissionProcess: {
    type: String,
    required: true
  },
  requiredDocuments: [{
    type: String
  }],
  eligibilityCriteria: {
    type: String,
    required: true
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  website: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search
schoolSchema.index({
  name: 'text',
  state: 'text',
  district: 'text',
  admissionProcess: 'text',
  eligibilityCriteria: 'text'
});

export const School = mongoose.models.School || mongoose.model<ISchool>('School', schoolSchema);
