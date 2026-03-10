import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// TypeScript interfaces
export interface IAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  permissions: AdminPermission[];
  role: AdminRole;
  department?: string;
  accessLevel: AccessLevel;
  lastLogin?: Date;
  loginHistory: LoginRecord[];
  auditLogs: AuditLog[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminPermission = 'verifySchools' | 'verifyNGOs' | 'manageUsers' | 'viewAnalytics' | 'manageContent' | 'systemAdmin' | 'financialAccess' | 'dataExport' | 'userSupport' | 'partnerManagement';

export type AdminRole = 'superAdmin' | 'regionalAdmin' | 'contentAdmin' | 'supportAdmin' | 'financeAdmin' | 'auditAdmin';

export type AccessLevel = 'full' | 'regional' | 'limited' | 'readonly';

export interface LoginRecord {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  failureReason?: string;
}

export interface AuditLog {
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: any;
  success: boolean;
}

// Zod validation schema
export const adminValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permissions: z.array(z.enum(['verifySchools', 'verifyNGOs', 'manageUsers', 'viewAnalytics', 'manageContent', 'systemAdmin', 'financialAccess', 'dataExport', 'userSupport', 'partnerManagement'])),
  role: z.enum(['superAdmin', 'regionalAdmin', 'contentAdmin', 'supportAdmin', 'financeAdmin', 'auditAdmin']),
  department: z.string().min(2, 'Department must be at least 2 characters').max(50, 'Department must be less than 50 characters').optional(),
  accessLevel: z.enum(['full', 'regional', 'limited', 'readonly']),
  isActive: z.boolean().default(true),
});

// Mongoose schema
const adminSchema = new Schema<IAdmin>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  permissions: [{
    type: String,
    enum: ['verifySchools', 'verifyNGOs', 'manageUsers', 'viewAnalytics', 'manageContent', 'systemAdmin', 'financialAccess', 'dataExport', 'userSupport', 'partnerManagement'],
    required: true,
  }],
  role: {
    type: String,
    required: [true, 'Admin role is required'],
    enum: ['superAdmin', 'regionalAdmin', 'contentAdmin', 'supportAdmin', 'financeAdmin', 'auditAdmin'],
  },
  department: {
    type: String,
    trim: true,
    minlength: [2, 'Department must be at least 2 characters'],
    maxlength: [50, 'Department must be less than 50 characters'],
  },
  accessLevel: {
    type: String,
    required: [true, 'Access level is required'],
    enum: ['full', 'regional', 'limited', 'readonly'],
  },
  lastLogin: {
    type: Date,
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    userAgent: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
    failureReason: {
      type: String,
      trim: true,
    },
  }],
  auditLogs: [{
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    userAgent: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
  }],
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for security and analytics
adminSchema.index({ role: 1 });
adminSchema.index({ permissions: 1 });
adminSchema.index({ accessLevel: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastLogin: -1 });
adminSchema.index({ 'loginHistory.timestamp': -1 });
adminSchema.index({ 'auditLogs.timestamp': -1 });
adminSchema.index({ 'auditLogs.action': 1 });
adminSchema.index({ 'auditLogs.resource': 1 });
adminSchema.index({ createdAt: -1 });

// Compound indexes
adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ permissions: 1, isActive: 1 });
adminSchema.index({ 'loginHistory.timestamp': -1, 'loginHistory.success': 1 });
adminSchema.index({ 'auditLogs.timestamp': -1, 'auditLogs.action': 1 });

// Virtual population
adminSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Static methods
adminSchema.statics.findByRole = function(role: AdminRole) {
  return this.find({ role, isActive: true }).populate('user');
};

adminSchema.statics.findByPermission = function(permission: AdminPermission) {
  return this.find({ permissions: permission, isActive: true }).populate('user');
};

adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('user');
};

adminSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department, isActive: true }).populate('user');
};

adminSchema.statics.findRecentLogins = function(hours: number = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ lastLogin: { $gte: cutoff }, isActive: true }).populate('user');
};

adminSchema.statics.findFailedLogins = function(hours: number = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    'loginHistory.timestamp': { $gte: cutoff },
    'loginHistory.success': false,
    isActive: true
  }).populate('user');
};

adminSchema.statics.getAuditLogs = function(action?: string, resourceId?: string, limit: number = 100) {
  const query: any = {};
  if (action) query['auditLogs.action'] = action;
  if (resourceId) query['auditLogs.resourceId'] = resourceId;
  
  return this.find(query)
    .sort({ 'auditLogs.timestamp': -1 })
    .limit(limit)
    .populate('user');
};

// Instance methods
adminSchema.methods.hasPermission = function(permission: AdminPermission): boolean {
  return this.permissions.includes(permission);
};

adminSchema.methods.hasAnyPermission = function(permissions: AdminPermission[]): boolean {
  return permissions.some(permission => this.permissions.includes(permission));
};

adminSchema.methods.hasAllPermissions = function(permissions: AdminPermission[]): boolean {
  return permissions.every(permission => this.permissions.includes(permission));
};

adminSchema.methods.addPermission = function(permission: AdminPermission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

adminSchema.methods.removePermission = function(permission: AdminPermission) {
  this.permissions = this.permissions.filter((p: AdminPermission) => p !== permission);
  return this.save();
};

adminSchema.methods.logLogin = function(loginData: Partial<LoginRecord>) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    ...loginData,
    timestamp: new Date(),
    success: loginData.success ?? true,
  });
  
  // Keep only last 100 login records
  if (this.loginHistory.length > 100) {
    this.loginHistory = this.loginHistory.slice(-100);
  }
  
  return this.save();
};

adminSchema.methods.logAudit = function(action: string, resource: string, details?: any, success: boolean = true) {
  this.auditLogs.push({
    action,
    resource,
    details,
    success,
    timestamp: new Date(),
    ipAddress: details?.ipAddress || '',
    userAgent: details?.userAgent || '',
  });
  
  // Keep only last 1000 audit records
  if (this.auditLogs.length > 1000) {
    this.auditLogs = this.auditLogs.slice(-1000);
  }
  
  return this.save();
};

adminSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

adminSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

adminSchema.methods.updateRole = function(newRole: AdminRole, newPermissions?: AdminPermission[]) {
  this.role = newRole;
  if (newPermissions) {
    this.permissions = newPermissions;
  }
  return this.save();
};

adminSchema.methods.getLoginStats = function() {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLogins = this.loginHistory.filter((login: any) => login.timestamp >= last30Days);
  
  return {
    totalLogins: this.loginHistory.length,
    successfulLogins: this.loginHistory.filter((login: any) => login.success).length,
    failedLogins: this.loginHistory.filter((login: any) => !login.success).length,
    recentLogins: recentLogins.length,
    lastLogin: this.lastLogin,
    averageLoginsPerDay: recentLogins.length / 30,
  };
};

adminSchema.methods.getAuditStats = function() {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAudits = this.auditLogs.filter((audit: any) => audit.timestamp >= last30Days);
  
  const actionCounts = recentAudits.reduce((counts: any, audit: any) => {
    counts[audit.action] = (counts[audit.action] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  return {
    totalAudits: this.auditLogs.length,
    recentAudits: recentAudits.length,
    successfulAudits: recentAudits.filter((audit: any) => audit.success).length,
    failedAudits: recentAudits.filter((audit: any) => !audit.success).length,
    actionCounts,
    mostCommonAction: Object.keys(actionCounts).reduce((a: string, b: string) => actionCounts[a] > actionCounts[b] ? a : b, ''),
  };
};

// Pre-save middleware
adminSchema.pre('save', function(next: any) {
  // Ensure superAdmin has all permissions
  if (this.role === 'superAdmin') {
    const allPermissions: AdminPermission[] = [
      'verifySchools', 'verifyNGOs', 'manageUsers', 'viewAnalytics', 
      'manageContent', 'systemAdmin', 'financialAccess', 'dataExport', 
      'userSupport', 'partnerManagement'
    ];
    this.permissions = allPermissions;
    this.accessLevel = 'full';
  }
  
  next();
});

// Export model
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

// Validation helper
export const validateAdmin = (data: unknown) => {
  return adminValidationSchema.safeParse(data);
};
