import mongoose, { Document, Schema } from 'mongoose';

// Volunteer Assignment Interface
export interface IVolunteerAssignment extends Document {
  volunteerUid: string;
  schoolUid: string;
  subjects: string[];
  assignedClasses: string[];
  startDate: Date;
  status: 'active' | 'completed' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

// Volunteer Assignment Schema
const VolunteerAssignmentSchema = new Schema<IVolunteerAssignment>({
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
  subjects: [{ 
    type: String, 
    required: true 
  }],
  assignedClasses: [{ 
    type: String, 
    required: true 
  }],
  startDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'completed', 'terminated'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
VolunteerAssignmentSchema.index({ volunteerUid: 1, status: 1 });
VolunteerAssignmentSchema.index({ schoolUid: 1, status: 1 });
VolunteerAssignmentSchema.index({ assignedClasses: 1, status: 1 });

export const VolunteerAssignment = mongoose.models.VolunteerAssignment || mongoose.model('VolunteerAssignment', VolunteerAssignmentSchema);
export default VolunteerAssignment;
