// Import all refactored models and types
import { User, type IUser, type UserRole } from './User';
import { Student, type IStudent, type TribeCategory } from './Student';
import { School, type ISchool, type VerificationStatus } from './SchoolSimple';
import { Volunteer, type IVolunteer, type Skill, type Subject } from './Volunteer';
import { NGO, type INGO, type FocusArea } from './NGOSimple';
import { Donor, type IDonor, type DonorType } from './DonorSimple';
import { Admin, type IAdmin, type Permission } from './AdminSimple';

// Supporting Models
import { Scholarship, type IScholarship, type Category } from './Scholarship';
import { VolunteerRequest, type IVolunteerRequest, type RequestStatus } from './VolunteerRequest';
import { DistrictAnalytics, type IDistrictAnalytics } from './DistrictAnalytics';
import { SecurityLog, type ISecurityLog } from './SecurityLogs';

// Re-export all models and types
export { User, type IUser, type UserRole };
export { Student, type IStudent, type TribeCategory };
export { School, type ISchool, type VerificationStatus };
export { Volunteer, type IVolunteer, type Skill, type Subject };
export { NGO, type INGO, type FocusArea };
export { Donor, type IDonor, type DonorType };
export { Admin, type IAdmin, type Permission };

// Supporting Models
export { Scholarship, type IScholarship, type Category };
export { VolunteerRequest, type IVolunteerRequest, type RequestStatus };
export { DistrictAnalytics, type IDistrictAnalytics };
export { SecurityLog, type ISecurityLog };

// Model relationships and utilities
export interface ModelRelations {
  // User relationships
  user: {
    student?: IStudent;
    volunteer?: IVolunteer;
    school?: ISchool;
    ngo?: INGO;
    donor?: IDonor;
    admin?: IAdmin;
  };
  
  // Cross-model relationships
  student: {
    user: IUser;
    school?: ISchool;
  };
  
  volunteer: {
    user: IUser;
  };
  
  school: {
    user: IUser;
    students: IStudent[];
  };
  
  ngo: {
    user: IUser;
  };
  
  donor: {
    user: IUser;
  };
  
  admin: {
    user: IUser;
  };
}

// Helper functions for model operations
export class ModelOperations {
  /**
   * Get role-specific profile for a user
   */
  static async getRoleProfile(userId: string, role: UserRole) {
    switch (role) {
      case 'student':
        return await Student.findOne({ userId }).populate('user');
      case 'volunteer':
        return await Volunteer.findOne({ userId }).populate('user');
      case 'school':
        return await School.findOne({ userId }).populate('user');
      case 'ngo':
        return await NGO.findOne({ userId }).populate('user');
      case 'donor':
        return await Donor.findOne({ userId }).populate('user');
      case 'admin':
        return await Admin.findOne({ userId }).populate('user');
      default:
        return null;
    }
  }

  /**
   * Create role-specific profile
   */
  static async createRoleProfile(userId: string, role: UserRole, profileData: any) {
    switch (role) {
      case 'student':
        return await Student.create({ userId, ...profileData });
      case 'volunteer':
        return await Volunteer.create({ userId, ...profileData });
      case 'school':
        return await School.create({ userId, ...profileData });
      case 'ngo':
        return await NGO.create({ userId, ...profileData });
      case 'donor':
        return await Donor.create({ userId, ...profileData });
      case 'admin':
        return await Admin.create({ userId, ...profileData });
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Update role-specific profile
   */
  static async updateRoleProfile(userId: string, role: UserRole, updateData: any) {
    switch (role) {
      case 'student':
        return await Student.findOneAndUpdate({ userId }, updateData, { new: true });
      case 'volunteer':
        return await Volunteer.findOneAndUpdate({ userId }, updateData, { new: true });
      case 'school':
        return await School.findOneAndUpdate({ userId }, updateData, { new: true });
      case 'ngo':
        return await NGO.findOneAndUpdate({ userId }, updateData, { new: true });
      case 'donor':
        return await Donor.findOneAndUpdate({ userId }, updateData, { new: true });
      case 'admin':
        return await Admin.findOneAndUpdate({ userId }, updateData, { new: true });
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Delete role-specific profile
   */
  static async deleteRoleProfile(userId: string, role: UserRole) {
    switch (role) {
      case 'student':
        return await Student.findOneAndDelete({ userId });
      case 'volunteer':
        return await Volunteer.findOneAndDelete({ userId });
      case 'school':
        return await School.findOneAndDelete({ userId });
      case 'ngo':
        return await NGO.findOneAndDelete({ userId });
      case 'donor':
        return await Donor.findOneAndDelete({ userId });
      case 'admin':
        return await Admin.findOneAndDelete({ userId });
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Get analytics data for a role
   */
  static async getRoleAnalytics(role: UserRole) {
    switch (role) {
      case 'student':
        return {
          total: await Student.countDocuments(),
          byState: await Student.aggregate([
            { $group: { _id: '$state', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          byTribeCategory: await Student.aggregate([
            { $group: { _id: '$tribeCategory', count: { $sum: 1 } } }
          ]),
        };
      case 'volunteer':
        return {
          total: await Volunteer.countDocuments(),
          verified: await Volunteer.countDocuments({ verified: true }),
          bySkills: await Volunteer.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
        };
      case 'school':
        return {
          total: await School.countDocuments(),
          verified: await School.countDocuments({ verificationStatus: 'verified' }),
          byState: await School.aggregate([
            { $group: { _id: '$state', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
        };
      case 'ngo':
        return {
          total: await NGO.countDocuments(),
          verified: await NGO.countDocuments({ verificationStatus: 'verified' }),
          byFocusArea: await NGO.aggregate([
            { $unwind: '$focusAreas' },
            { $group: { _id: '$focusAreas', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
        };
      case 'donor':
        return {
          total: await Donor.countDocuments(),
          verified: await Donor.countDocuments({ verificationStatus: 'verified' }),
          totalDonated: await Donor.aggregate([
            { $group: { _id: null, total: { $sum: '$totalDonated' } } }
          ]),
        };
      case 'admin':
        return {
          total: await Admin.countDocuments(),
          active: await Admin.countDocuments({ isActive: true }),
          byRole: await Admin.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ]),
        };
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }
}

// Default export with all models
export default {
  User,
  Student,
  School,
  Volunteer,
  NGO,
  Donor,
  Admin,
  ModelOperations,
};
