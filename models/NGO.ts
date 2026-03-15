import mongoose, { Document, Schema } from 'mongoose';

export interface INGO extends Document {
  ngoUid: string;
  ngoName: string;
  email: string;
  phone: string;
  district: string;
  locality: string;
  address: string;
  description: string;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const NGOSchema = new Schema<INGO>({
  ngoUid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  ngoName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true,
    index: true 
  },
  locality: { 
    type: String, 
    required: true,
    index: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  verifiedStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for location queries
NGOSchema.index({ locality: 1, district: 1 });

export const NGO = mongoose.models.NGO || mongoose.model('NGO', NGOSchema);
export default NGO;
