import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Rating Interface
export interface IVolunteerRating extends Document {
  volunteerUid: string;
  schoolUid: string;
  studentUid?: string;
  rating: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Rating Schema
const VolunteerRatingSchema = new Schema<IVolunteerRating>({
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
  studentUid: { 
    type: String, 
    required: false,
    index: true
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  feedback: { 
    type: String, 
    required: false 
  }
}, {
  timestamps: true
});

// Compound index for volunteer rating queries
VolunteerRatingSchema.index({ volunteerUid: 1, createdAt: -1 });

export const VolunteerRating = mongoose.models.VolunteerRating || mongoose.model('VolunteerRating', VolunteerRatingSchema);
export default VolunteerRating;
