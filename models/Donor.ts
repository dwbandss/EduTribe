import mongoose, { Document, Schema } from 'mongoose';

export interface IDonor extends Document {
  uid: string;
  name: string;
  email: string;
  phone: string;
  organizationType: string;
  totalDonations: number;
  totalAmount: number;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>({
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String 
  },
  organizationType: { 
    type: String 
  },
  totalDonations: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    default: 0 
  },
  verifiedStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Donor = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);
export default Donor;
