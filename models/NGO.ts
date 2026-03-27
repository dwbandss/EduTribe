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
  password: string;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  registrationNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  volunteers?: string[]; // Array of volunteer UIDs
  schools?: string[]; // Array of school UIDs
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  password: {
    type: String,
    required: true
  },
  volunteers: [{ 
    type: String, 
    default: [] 
  }],
  schools: [{ 
    type: String, 
    default: [] 
  }],
  verifiedStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  registrationNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Handle stale index
  }
}, {
  timestamps: true
});

// Compound index for location queries
NGOSchema.index({ locality: 1, district: 1 });

// Password hashing middleware
NGOSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Password comparison method
NGOSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const NGO = mongoose.models.NGO || mongoose.model('NGO', NGOSchema);
export default NGO;
