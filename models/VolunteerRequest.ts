import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Request Interface
export interface IVolunteerRequest extends Document {
  requestId: string;
  schoolUid: string;
  subjectsRequired: string[];
  classesRequired: string[];
  volunteersNeeded: number;
  district: string;
  state: string;
  status: 'open' | 'closed' | 'filled';
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Request Schema
const VolunteerRequestSchema = new Schema<IVolunteerRequest>({
  requestId: { 
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
  district: { 
    type: String, 
    required: true,
    index: true
  },
  state: { 
    type: String, 
    required: true,
    index: true
  },
  subjectsRequired: [{ 
    type: String, 
    required: true 
  }],
  classesRequired: [{ 
    type: String, 
    required: true 
  }],
  volunteersNeeded: { 
    type: Number, 
    required: true,
    min: 1
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['open', 'closed', 'filled'],
    default: 'open',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for location-based queries
VolunteerRequestSchema.index({ state: 1, district: 1, status: 1 });
VolunteerRequestSchema.index({ schoolUid: 1, status: 1 });

export const VolunteerRequest = mongoose.models.VolunteerRequest || mongoose.model('VolunteerRequest', VolunteerRequestSchema);
export default VolunteerRequest;
