import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Match Interface
export interface IVolunteerMatch extends Document {
  volunteerUid: string;
  requestId: string;
  schoolUid: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Match Schema
const VolunteerMatchSchema = new Schema<IVolunteerMatch>({
  volunteerUid: { 
    type: String, 
    required: true, 
    index: true 
  },
  requestId: { 
    type: String, 
    required: true, 
    index: true 
  },
  schoolUid: { 
    type: String, 
    required: true, 
    index: true 
  },
  matchScore: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  matchReasons: [{ 
    type: String, 
    required: true 
  }],
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound indexes
VolunteerMatchSchema.index({ volunteerUid: 1, requestId: 1 });
VolunteerMatchSchema.index({ schoolUid: 1, status: 1 });

// Export Volunteer Match model
export const VolunteerMatch = mongoose.models.VolunteerMatch || mongoose.model('VolunteerMatch', VolunteerMatchSchema);
export default VolunteerMatch;
