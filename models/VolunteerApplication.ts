 import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Application Interface
export interface IVolunteerApplication extends Document {
  applicationId: string;
  requestId: string;
  volunteerUid: string;
  schoolUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Application Schema
const VolunteerApplicationSchema = new Schema<IVolunteerApplication>({
  applicationId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  requestId: { 
    type: String, 
    required: true,
    index: true
  },
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
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for queries
VolunteerApplicationSchema.index({ requestId: 1, status: 1 });
VolunteerApplicationSchema.index({ volunteerUid: 1, status: 1 });
VolunteerApplicationSchema.index({ schoolUid: 1, status: 1 });

export const VolunteerApplication = mongoose.models.VolunteerApplication || mongoose.model('VolunteerApplication', VolunteerApplicationSchema);
export default VolunteerApplication;
