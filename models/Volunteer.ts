import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Interface
export interface IVolunteer extends Document {
  volunteerUid: string;
  
  type: {
    type: string;
    enum: ["ngo", "independent"];
  };
  
  name: string;
  email: string;
  phone: string;
  password: string;
  
  aadhaarNumber?: string;
  ngoUid?: string;
  
  verified: {
    type: boolean;
    default: false;
  };
  
  status: {
    type: string;
    enum: ["pending", "active", "suspended"];
    default: "pending";
  };
  
  profileCompleted: {
    type: boolean;
    default: false;
  };
  
  profile: {
    degree?: string;
    location?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: string;
    bio?: string;
    
    skills: string[];
    
    preferredSubjects: string[];
    preferredClasses: string[];
    preferredDistrict?: string;
    
    experience?: string;
    
    availability: Array<{
      day: string;
      timeSlots: string[];
    }>;
  };
  
  createdAt: Date;
  userId?: string; // Add this to handle stale index
  comparePassword(candidatePassword: string): Promise<boolean>; // Add password comparison method
}

// Volunteer Schema
const VolunteerSchema = new Schema<IVolunteer>({
  volunteerUid: { 
    type: String, 
    required: true, 
    unique: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['ngo', 'independent'],
    default: 'independent'
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
  password: {
    type: String,
    required: true
  },
  
  aadhaarNumber: {
    type: String,
    required: false, // Only for independent volunteers
    unique: true,
    sparse: true
  },
  
  ngoUid: { 
    type: String, 
    required: false // Only for NGO volunteers
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  profile: {
    degree: String,
    location: String,
    address: String,
    dateOfBirth: Date,
    gender: String,
    bio: String,
    
    skills: [String],
    
    preferredSubjects: [String],
    preferredClasses: [String],
    preferredDistrict: String,
    
    experience: String,
    
    availability: [{
      day: String,
      timeSlots: [String]
    }]
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  userId: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Handle stale index
  }
});

// Indexes for better performance
VolunteerSchema.index({ volunteerUid: 1 });
VolunteerSchema.index({ email: 1 });
VolunteerSchema.index({ type: 1 });
VolunteerSchema.index({ status: 1 });
VolunteerSchema.index({ ngoUid: 1 });
VolunteerSchema.index({ aadhaarNumber: 1 });

// Password hashing middleware
VolunteerSchema.pre('save', async function(next: any) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    this.password = await bcrypt.default.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
VolunteerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.default.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Export the model
export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', VolunteerSchema);
export default Volunteer;
