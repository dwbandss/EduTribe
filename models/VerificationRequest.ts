import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationRequest extends Document {
  requestId: string;
  requesterType: 'ngo' | 'school' | 'volunteer';
  requesterUid: string;
  requesterName: string;
  targetUid: string;
  targetType: 'ngo' | 'school' | 'volunteer';
  targetName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
}

const VerificationRequestSchema = new Schema<IVerificationRequest>({
  requestId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `VR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  },
  requesterType: { 
    type: String, 
    required: true, 
    enum: ['ngo', 'school', 'volunteer']
  },
  requesterUid: { 
    type: String, 
    required: true 
  },
  requesterName: { 
    type: String, 
    required: true 
  },
  targetUid: { 
    type: String, 
    required: true 
  },
  targetType: { 
    type: String, 
    required: true, 
    enum: ['ngo', 'school', 'volunteer']
  },
  targetName: { 
    type: String, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedBy: { 
    type: String 
  },
  reviewedAt: { 
    type: Date 
  },
  adminNotes: { 
    type: String 
  }
});

export const VerificationRequest = mongoose.models.VerificationRequest || mongoose.model('VerificationRequest', VerificationRequestSchema);
export default VerificationRequest;
