import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Request Types
export type RequestStatus = 'open' | 'matched' | 'closed';

// Volunteer Request Interface
export interface IVolunteerRequest extends Document {
  schoolId: mongoose.Types.ObjectId;
  subjectsRequired: string[];
  skillsRequired: string[];
  schedule?: string;
  location?: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Request Schema
const VolunteerRequestSchema = new Schema<IVolunteerRequest>({
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required']
  },
  
  subjectsRequired: [{
    type: String,
    trim: true
  }],
  
  skillsRequired: [{
    type: String,
    trim: true
  }],
  
  schedule: {
    type: String,
    trim: true
  },
  
  location: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['open', 'matched', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

// Indexes
VolunteerRequestSchema.index({ schoolId: 1 });
VolunteerRequestSchema.index({ status: 1 });
VolunteerRequestSchema.index({ subjectsRequired: 1 });
VolunteerRequestSchema.index({ skillsRequired: 1 });

// Export VolunteerRequest model
export const VolunteerRequest = mongoose.models.VolunteerRequest || mongoose.model<IVolunteerRequest>('VolunteerRequest', VolunteerRequestSchema);
