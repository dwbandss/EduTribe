import mongoose, { Document, Schema } from 'mongoose';

// Admin Types
export type Permission = 'verifySchools' | 'verifyNGOs' | 'manageUsers' | 'manageDonations' | 'viewAnalytics';

// Admin Interface
export interface IAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

// Admin Schema
const AdminSchema = new Schema<IAdmin>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  role: {
    type: String,
    required: [true, 'Role is required'],
    default: 'admin'
  },
  
  permissions: [{
    type: String,
    enum: ['verifySchools', 'verifyNGOs', 'manageUsers', 'manageDonations', 'viewAnalytics']
  }]
}, {
  timestamps: true
});

// Indexes
AdminSchema.index({ userId: 1 });

// Export Admin model
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
