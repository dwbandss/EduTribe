import mongoose, { Document, Schema } from 'mongoose';

// Activity Log Interface
export interface IActivityLog extends Document {
  userType: string;
  userUid: string;
  action: string;
  details: string;
  createdAt: Date;
}

// Activity Log Schema
const ActivityLogSchema = new Schema<IActivityLog>({
  userType: {
    type: String,
    required: true,
    enum: ['admin', 'ngo', 'school', 'volunteer']
  },
  
  userUid: {
    type: String,
    required: true
  },
  
  action: {
    type: String,
    required: true
  },
  
  details: {
    type: String,
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
ActivityLogSchema.index({ userType: 1 });
ActivityLogSchema.index({ userUid: 1 });
ActivityLogSchema.index({ createdAt: 1 });
ActivityLogSchema.index({ action: 1 });

// Export the model
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
