import mongoose from 'mongoose';

// Volunteer Schema
const VolunteerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  skills: [{ type: String, required: true }],
  languages: [{ type: String, required: true }],
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    timeSlots: [{ type: String }] // e.g., ["9:00-12:00", "14:00-17:00"]
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
  bio: { type: String },
  education: { type: String },
  experience: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// School Request Schema
const SchoolRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true },
  schoolName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  requiredSkills: [{ type: String, required: true }],
  description: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  duration: { type: String }, // e.g., "2 hours/week", "3 months"
  schedule: [{ type: String }], // preferred days/times
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Volunteer Match Schema
const VolunteerMatchSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  volunteerId: { type: String, required: true },
  score: { type: Number, required: true },
  explanation: { type: String, required: true },
  status: { type: String, enum: ['pending', 'invited', 'accepted', 'declined'], default: 'pending' },
  invitedAt: { type: Date },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes
VolunteerSchema.index({ location: '2dsphere' });
VolunteerSchema.index({ skills: 1 });
VolunteerSchema.index({ languages: 1 });
VolunteerSchema.index({ isActive: 1 });
VolunteerSchema.index({ 'availability.day': 1 });

SchoolRequestSchema.index({ location: '2dsphere' });
SchoolRequestSchema.index({ subject: 1 });
SchoolRequestSchema.index({ status: 1 });

VolunteerMatchSchema.index({ requestId: 1 });
VolunteerMatchSchema.index({ volunteerId: 1 });
VolunteerMatchSchema.index({ status: 1 });

export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', VolunteerSchema);
export const SchoolRequest = mongoose.models.SchoolRequest || mongoose.model('SchoolRequest', SchoolRequestSchema);
export const VolunteerMatch = mongoose.models.VolunteerMatch || mongoose.model('VolunteerMatch', VolunteerMatchSchema);
