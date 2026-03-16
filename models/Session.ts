import mongoose, { Document, Schema } from 'mongoose';

// Teaching Session Interface
export interface ISession extends Document {
  sessionId: string;
  schoolUid: string;
  volunteerUid: string;
  subject: string;
  classes: string[]; // Array of classes (e.g., ["Class 7", "Class 8"])
  schedule: {
    day: string;
    time: string;
  };
  mode: "offline"; // Always offline for this system
  location: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  ngoUid?: string; // Optional for NGO volunteers
  feedback?: {
    rating: number;
    comments: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Teaching Session Schema
const SessionSchema = new Schema<ISession>({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  schoolUid: { 
    type: String, 
    required: true,
    index: true
  },
  volunteerUid: { 
    type: String, 
    required: true,
    index: true
  },
  subject: { 
    type: String, 
    required: true,
    index: true
  },
  classes: [{ 
    type: String, 
    required: true 
  }],
  schedule: {
    day: { 
      type: String, 
      required: true 
    },
    time: { 
      type: String, 
      required: true 
    }
  },
  mode: { 
    type: String, 
    required: true, 
    enum: ['offline'],
    default: 'offline'
  },
  location: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  ngoUid: { 
    type: String, 
    required: false,
    index: true
  },
  feedback: {
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    comments: { 
      type: String, 
      maxlength: 500 
    }
  }
}, {
  timestamps: true
});

// Compound indexes for session management
SessionSchema.index({ schoolUid: 1, status: 1 });
SessionSchema.index({ volunteerUid: 1, status: 1 });
SessionSchema.index({ subject: 1, status: 1 });
SessionSchema.index({ 'schedule.day': 1, 'schedule.time': 1 });

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export default Session;
