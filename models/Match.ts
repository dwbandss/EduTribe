import mongoose, { Document, Schema } from 'mongoose';

// Match Interface
export interface IMatch extends Document {
  volunteerUid: string;
  schoolUid: string;
  requestId: string;
  assignedBy: string;
  status: {
    type: string;
    enum: ["pending", "active", "completed"];
    default: "pending";
  };
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

// Match Schema
const MatchSchema = new Schema<IMatch>({
  volunteerUid: {
    type: String,
    required: true,
    index: true
  },
  
  schoolUid: {
    type: String,
    required: true,
    index: true
  },
  
  requestId: {
    type: String,
    required: true,
    index: true
  },
  
  assignedBy: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  
  startDate: {
    type: Date
  },
  
  endDate: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
MatchSchema.index({ volunteerUid: 1 });
MatchSchema.index({ schoolUid: 1 });
MatchSchema.index({ requestId: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ createdAt: 1 });

// Export the model
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);
export default Match;
