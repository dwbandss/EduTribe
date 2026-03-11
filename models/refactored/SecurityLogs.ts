import mongoose, { Document, Schema } from 'mongoose';

// Security Log Interface
export interface ISecurityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  ipAddress: string;
  metadata?: any;
  createdAt: Date;
}

// Security Log Schema
const SecurityLogSchema = new Schema<ISecurityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true
  },
  
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
SecurityLogSchema.index({ userId: 1 });
SecurityLogSchema.index({ createdAt: 1 });
SecurityLogSchema.index({ action: 1 });
SecurityLogSchema.index({ ipAddress: 1 });

// Export SecurityLog model
export const SecurityLog = mongoose.models.SecurityLog || mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);
