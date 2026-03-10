import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface ISchool extends Document {
  userId: mongoose.Types.ObjectId;
  schoolName: string;
  schoolCode: string;
  district: string;
  state: string;
  locationCoordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  studentsCount: number;
  teachersCount: number;
  facilities: SchoolFacility[];
  needs: SchoolNeed[];
  verificationStatus: VerificationStatus;
  affiliation: SchoolAffiliation;
  academicDetails: AcademicDetails;
  infrastructure: Infrastructure;
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type SchoolFacility = 'hostel' | 'sports' | 'scienceLab' | 'digitalClassroom' | 'library' | 'computerLab' | 'playground' | 'medicalRoom';

export type SchoolNeed = 'volunteerTeachers' | 'books' | 'computers' | 'infrastructure' | 'sportsEquipment' | 'teachingMaterials' | 'furniture' | 'internet';

export interface SchoolAffiliation {
  board: string; // CBSE, State Board, etc.
  established: number;
  type: 'government' | 'private' | 'aided';
  recognitionNumber?: string;
}

export interface AcademicDetails {
  classesOffered: string[];
  medium: string[];
  studentTeacherRatio: number;
  passRate: number;
  lastAcademicYear: string;
}

export interface Infrastructure {
  totalArea: number; // in square meters
  buildingArea: number;
  playgroundArea: number;
  hasElectricity: boolean;
  hasWaterSupply: boolean;
  hasInternet: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

// Zod validation schema
export const schoolValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  schoolName: z.string().min(2, 'School name must be at least 2 characters').max(200, 'School name must be less than 200 characters'),
  schoolCode: z.string().min(3, 'School code must be at least 3 characters').max(20, 'School code must be less than 20 characters'),
  district: z.string().min(2, 'District must be at least 2 characters').max(50, 'District must be less than 50 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  locationCoordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
  }),
  studentsCount: z.number().min(0, 'Students count must be at least 0'),
  teachersCount: z.number().min(0, 'Teachers count must be at least 0'),
  facilities: z.array(z.enum(['hostel', 'sports', 'scienceLab', 'digitalClassroom', 'library', 'computerLab', 'playground', 'medicalRoom'])),
  needs: z.array(z.enum(['volunteerTeachers', 'books', 'computers', 'infrastructure', 'sportsEquipment', 'teachingMaterials', 'furniture', 'internet'])),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'suspended']).default('pending'),
  affiliation: z.object({
    board: z.string(),
    established: z.number().min(1800).max(new Date().getFullYear()),
    type: z.enum(['government', 'private', 'aided']),
    recognitionNumber: z.string().optional(),
  }),
  academicDetails: z.object({
    classesOffered: z.array(z.string()),
    medium: z.array(z.string()),
    studentTeacherRatio: z.number().min(0),
    passRate: z.number().min(0).max(100),
    lastAcademicYear: z.string(),
  }),
  infrastructure: z.object({
    totalArea: z.number().min(0),
    buildingArea: z.number().min(0),
    playgroundArea: z.number().min(0),
    hasElectricity: z.boolean(),
    hasWaterSupply: z.boolean(),
    hasInternet: z.boolean(),
    condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
});

// Mongoose schema
const schoolSchema = new Schema<ISchool>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  schoolName: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    minlength: [2, 'School name must be at least 2 characters'],
    maxlength: [200, 'School name must be less than 200 characters'],
  },
  schoolCode: {
    type: String,
    required: [true, 'School code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'School code must be at least 3 characters'],
    maxlength: [20, 'School code must be less than 20 characters'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    minlength: [2, 'District must be at least 2 characters'],
    maxlength: [50, 'District must be less than 50 characters'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    minlength: [2, 'State must be at least 2 characters'],
    maxlength: [50, 'State must be less than 50 characters'],
  },
  locationCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
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
    required: [true, 'Students count is required'],
    min: [0, 'Students count must be at least 0'],
  },
  teachersCount: {
    type: Number,
    required: [true, 'Teachers count is required'],
    min: [0, 'Teachers count must be at least 0'],
  },
  facilities: [{
    type: String,
    enum: ['hostel', 'sports', 'scienceLab', 'digitalClassroom', 'library', 'computerLab', 'playground', 'medicalRoom'],
  }],
  needs: [{
    type: String,
    enum: ['volunteerTeachers', 'books', 'computers', 'infrastructure', 'sportsEquipment', 'teachingMaterials', 'furniture', 'internet'],
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
  },
  affiliation: {
    board: {
      type: String,
      required: [true, 'Board is required'],
    },
    established: {
      type: Number,
      required: [true, 'Establishment year is required'],
      min: [1800, 'Invalid establishment year'],
      max: [new Date().getFullYear(), 'Establishment year cannot be in the future'],
    },
    type: {
      type: String,
      enum: ['government', 'private', 'aided'],
      required: [true, 'School type is required'],
    },
    recognitionNumber: {
      type: String,
      trim: true,
    },
  },
  academicDetails: {
    classesOffered: [{
      type: String,
      required: true,
    }],
    medium: [{
      type: String,
      required: true,
    }],
    studentTeacherRatio: {
      type: Number,
      required: true,
      min: [0, 'Student-teacher ratio must be at least 0'],
    },
    passRate: {
      type: Number,
      required: true,
      min: [0, 'Pass rate must be at least 0'],
      max: [100, 'Pass rate cannot exceed 100'],
    },
    lastAcademicYear: {
      type: String,
      required: true,
    },
  },
  infrastructure: {
    totalArea: {
      type: Number,
      required: true,
      min: [0, 'Total area must be at least 0'],
    },
    buildingArea: {
      type: Number,
      required: true,
      min: [0, 'Building area must be at least 0'],
    },
    playgroundArea: {
      type: Number,
      required: true,
      min: [0, 'Playground area must be at least 0'],
    },
    hasElectricity: {
      type: Boolean,
      required: true,
    },
    hasWaterSupply: {
      type: Boolean,
      required: true,
    },
    hasInternet: {
      type: Boolean,
      required: true,
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
  },
}, {
  timestamps: true,
});

// Geospatial index for location-based queries
schoolSchema.index({ locationCoordinates: '2dsphere' });

// Regular indexes
schoolSchema.index({ schoolName: 1 });
schoolSchema.index({ state: 1, district: 1 });
schoolSchema.index({ verificationStatus: 1 });
schoolSchema.index({ studentsCount: 1 });
schoolSchema.index({ 'affiliation.type': 1 });
schoolSchema.index({ facilities: 1 });
schoolSchema.index({ needs: 1 });
schoolSchema.index({ createdAt: -1 });

// Compound indexes
schoolSchema.index({ state: 1, verificationStatus: 1 });
schoolSchema.index({ 'affiliation.type': 1, studentsCount: -1 });
schoolSchema.index({ district: 1, 'academicDetails.passRate': -1 });

// ... (rest of the code remains the same)
// Virtual population
schoolSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

schoolSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'schoolId',
});

// Static methods
schoolSchema.statics.findByState = function(state: string) {
  return this.find({ state }).populate('user');
};

schoolSchema.statics.findByDistrict = function(district: string) {
  return this.find({ district }).populate('user');
};

schoolSchema.statics.findVerified = function() {
  return this.find({ verificationStatus: 'verified' }).populate('user');
};

schoolSchema.statics.findByNeeds = function(need: SchoolNeed) {
  return this.find({ needs: need }).populate('user');
};

schoolSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 10000) {
  return this.find({
    locationCoordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  }).populate('user');
};

schoolSchema.statics.findEligibleForVolunteers = function() {
  return this.find({
    verificationStatus: 'verified',
    needs: { $in: ['volunteerTeachers', 'teachingMaterials'] },
    studentsCount: { $gte: 50 }
  }).populate('user');
};

// Instance methods
schoolSchema.methods.updateVerificationStatus = function(status: VerificationStatus) {
  this.verificationStatus = status;
  return this.save();
};

schoolSchema.methods.addFacility = function(facility: SchoolFacility) {
  if (!this.facilities.includes(facility)) {
    this.facilities.push(facility);
  }
  return this.save();
};

schoolSchema.methods.addNeed = function(need: SchoolNeed) {
  if (!this.needs.includes(need)) {
    this.needs.push(need);
  }
  return this.save();
};

schoolSchema.methods.updateStudentCount = function(count: number) {
  this.studentsCount = count;
  return this.save();
};

// Export model
export const School = mongoose.models.School || mongoose.model<ISchool>('School', schoolSchema);

// Validation helper
export const validateSchool = (data: unknown) => {
  return schoolValidationSchema.safeParse(data);
};
