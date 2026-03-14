import mongoose, { Document, Schema } from 'mongoose';

// Student Profile Schema
const StudentProfileSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: 'student' },
  
  // Academic Information
  class: { type: String, required: false }, // 8th, 9th, 10th, 11th, 12th, Graduate, Post Graduate
  state: { type: String, required: false }, // Student's state
  category: { type: String, required: false }, // General, OBC, SC, ST, EWS
  studying: { type: String, required: false }, // Field of study
  currentInstitution: { type: String, required: false }, // Current school/college
  targetCourses: { type: String, required: false }, // Courses they want to pursue
  
  // Additional Information
  income: { type: Number, required: false }, // Family income
  marks: { type: Number, required: false }, // Academic marks/percentage
  phone: { type: String, required: false },
  address: { type: String, required: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
StudentProfileSchema.index({ uid: 1 });
StudentProfileSchema.index({ email: 1 });

export const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);
export default StudentProfile;
