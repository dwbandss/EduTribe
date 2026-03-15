import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Interface
export interface IVolunteer extends Document {
  uid: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  preferredSubjects: string[];
  preferredClasses: string[];
  preferredDistrict: string;
  preferredLocality: string;
  availability: Array<{
    day: string;
    timeSlots: string[];
  }>;
  ngoUid?: string;
  experience: string;
  bio: string;
  ratingAverage: number;
  profileCompleted: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Schema
const VolunteerSchema = new Schema<IVolunteer>({
  uid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  skills: [{ 
    type: String, 
    required: true 
  }],
  preferredSubjects: [{ 
    type: String, 
    required: true 
  }],
  preferredClasses: [{ 
    type: String, 
    required: true 
  }],
  preferredLocality: { 
    type: String, 
    required: true,
    index: true
  },
  preferredDistrict: { 
    type: String, 
    required: true,
    index: true
  },
  availability: [{
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true 
    },
    timeSlots: [{ 
      type: String, 
      required: true 
    }]
  }],
  ngoUid: { 
    type: String, 
    required: false,
    index: true 
  },
  experience: { 
    type: String, 
    required: false 
  },
  bio: { 
    type: String, 
    required: false 
  },
  ratingAverage: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0,
    max: 5
  },
  profileCompleted: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  isActive: { 
    type: Boolean, 
    required: true,
    default: true 
  },
  verificationStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for location queries
VolunteerSchema.index({ preferredLocality: 1, preferredDistrict: 1 });

// Export Volunteer model
export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', VolunteerSchema);
export default Volunteer;
