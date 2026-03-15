import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Roles
export type UserRole = 'school' | 'volunteer' | 'student' | 'ngo' | 'donor' | 'admin';

// User Interface
export interface IUser extends Document {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const UserSchema = new Schema<IUser>({
  uid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['school', 'volunteer', 'student', 'ngo', 'donor', 'admin'],
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: { 
    type: String, 
    required: false 
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export User model
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
