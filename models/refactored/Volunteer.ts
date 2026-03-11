import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Types
export type Skill = 'teaching' | 'mentoring' | 'coding' | 'careerGuidance';
export type Subject = 'math' | 'science' | 'english' | 'history';

// Location Interface
export interface VolunteerLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

// Volunteer Interface
export interface IVolunteer extends Document {
  userId: mongoose.Types.ObjectId;
  skills: Skill[];
  subjects: Subject[];
  languages: string[];
  location?: VolunteerLocation;
  availability?: string;
  experienceYears?: number;
  rating?: number;
  volunteerHours?: number;
  preferredRegions?: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Schema
const VolunteerSchema = new Schema<IVolunteer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: 1
  },
  
  skills: [{
    type: String,
    enum: ['teaching', 'mentoring', 'coding', 'careerGuidance'],
    index: 1
  }],
  
  subjects: [{
    type: String,
    enum: ['math', 'science', 'english', 'history'],
    index: 1
  }],
  
  languages: [{
    type: String,
    trim: true
  }],
  
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;   // latitude
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]'
      }
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  
  availability: {
    type: String,
    trim: true
  },
  
  experienceYears: {
    type: Number,
    min: [0, 'Experience years cannot be less than 0'],
    max: [50, 'Experience years cannot exceed 50']
  },
  
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  volunteerHours: {
    type: Number,
    min: [0, 'Volunteer hours cannot be less than 0']
  },
  
  preferredRegions: [{
    type: String,
    trim: true
  }],
  
  verified: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Export Volunteer model
export const Volunteer = mongoose.models.Volunteer || mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);
