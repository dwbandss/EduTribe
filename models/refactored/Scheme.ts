import mongoose, { Document, Schema } from 'mongoose';

// Scheme document interface
export interface IScheme extends Document {
  name: string;
  type: 'scholarship' | 'admission' | 'reservation' | 'financial_aid';
  category: 'general' | 'sc' | 'st' | 'obc' | 'minority' | 'ews' | 'other';
  state: string;
  class: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  requiredDocuments: string[];
  deadline?: Date;
  officialWebsite?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  lastUpdated: Date;
}

// Scheme schema
const schemeSchema = new Schema<IScheme>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['scholarship', 'admission', 'reservation', 'financial_aid'],
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'sc', 'st', 'obc', 'minority', 'ews', 'other'],
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  class: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  benefits: {
    type: String,
    required: true
  },
  applicationProcess: {
    type: String,
    required: true
  },
  requiredDocuments: [{
    type: String
  }],
  deadline: Date,
  officialWebsite: String,
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search
schemeSchema.index({
  name: 'text',
  type: 'text',
  category: 'text',
  state: 'text',
  description: 'text',
  eligibility: 'text',
  benefits: 'text'
});

export const Scheme = mongoose.models.Scheme || mongoose.model<IScheme>('Scheme', schemeSchema);
