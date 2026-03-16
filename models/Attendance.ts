import mongoose, { Document, Schema } from 'mongoose';

// Attendance Interface
export interface IAttendance extends Document {
  sessionId: string;
  studentUid: string;
  status: 'present' | 'absent';
  markedBy: string; // volunteerUid or schoolUid
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Schema
const AttendanceSchema = new Schema<IAttendance>({
  sessionId: { 
    type: String, 
    required: true,
    index: true
  },
  studentUid: { 
    type: String, 
    required: true,
    index: true
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['present', 'absent'],
    default: 'present'
  },
  markedBy: { 
    type: String, 
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for attendance tracking
AttendanceSchema.index({ sessionId: 1, studentUid: 1 }, { unique: true });
AttendanceSchema.index({ studentUid: 1, status: 1 });
AttendanceSchema.index({ sessionId: 1, status: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
