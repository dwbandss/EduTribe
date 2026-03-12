import mongoose, { Document, Schema } from 'mongoose';

// School Types
export type SchoolType = 'government' | 'private' | 'government-aided';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Facilities Interface
export interface SchoolFacilities {
  hostel: boolean;
  sports: boolean;
  scienceLab: boolean;
  digitalClassroom: boolean;
  library: boolean;
  computerLab: boolean;
}

// Contact Interface
export interface SchoolContact {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

// Facilities Interface
export interface SchoolFacilities {
  hostel: boolean;
  sports: boolean;
  scienceLab: boolean;
  digitalClassroom: boolean;
  library: boolean;
  computerLab: boolean;
}

// Location Interface
export interface SchoolLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// School Interface
export interface ISchool extends Document {
  userId: mongoose.Types.ObjectId;
  schoolName: string;
  schoolCode?: string;
  district: string;
  state: string;
  location?: SchoolLocation;
  studentsCount?: number;
  teachersCount?: number;
  facilities?: SchoolFacilities;
  streamsOffered?: string[];
  needs?: string[];
  contact?: SchoolContact;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// School Schema
const SchoolSchema = new Schema<ISchool>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  schoolName: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [200, 'School name cannot exceed 200 characters']
  },
  
  schoolCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]{3,20}$/, 'School code must be 3-20 characters, uppercase letters, numbers, and hyphens only']
  },
  
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;   // latitude
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]'
      }
    }
  },
  
  studentsCount: {
    type: Number,
    min: [0, 'Students count must be at least 0'],
    max: [10000, 'Students count cannot exceed 10000']
  },
  
  teachersCount: {
    type: Number,
    min: [0, 'Teachers count must be at least 0'],
    max: [500, 'Teachers count cannot exceed 500']
  },
  
  facilities: {
    hostel: { type: Boolean, default: false },
    sports: { type: Boolean, default: false },
    scienceLab: { type: Boolean, default: false },
    digitalClassroom: { type: Boolean, default: false },
    library: { type: Boolean, default: false },
    computerLab: { type: Boolean, default: false }
  },
  
  streamsOffered: [{
    type: String,
    enum: ['science', 'arts', 'commerce']
  }],
  
  needs: [{
    type: String,
    enum: ['volunteerTeachers', 'books', 'computers', 'internet', 'infrastructureSupport']
  }],
  
  contact: {
    phone: { type: String, trim: true, required: false },
    email: { type: String, trim: true, lowercase: true, required: false },
    address: { type: String, trim: true, required: false },
    city: { type: String, trim: true, required: false },
    district: { type: String, trim: true, required: false },
    state: { type: String, trim: true, required: false },
    pincode: { type: String, trim: true, required: false }
  },
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
SchoolSchema.index({ location: '2dsphere' });
SchoolSchema.index({ state: 1 });
SchoolSchema.index({ district: 1 });
SchoolSchema.index({ 'facilities.hostel': 1 });
SchoolSchema.index({ streamsOffered: 1 });
SchoolSchema.index({ verificationStatus: 1 });
SchoolSchema.index({ userId: 1 });

// Export School model
export const School = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);
