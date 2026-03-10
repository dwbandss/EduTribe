import mongoose from 'mongoose';
import { User, Student, School, Donor, Admin } from '../models/refactored';
import { ModelOperations } from '../models/refactored';

/**
 * Migration script to transition from old model structure to new refactored structure
 * 
 * This script:
 * 1. Creates new User records from existing role-specific models
 * 2. Creates role-specific profiles linked to User records
 * 3. Migrates data while preserving relationships
 * 4. Handles data validation and error logging
 */

interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
  details: any;
}

export class ModelMigration {
  /**
   * Migrate all existing data to new structure
   */
  static async migrateAll(): Promise<MigrationResult> {
    const results = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      console.log('Starting migration from old models to new refactored models...');

      // Migrate each role
      const studentResult = await this.migrateStudents();
      const schoolResult = await this.migrateSchools();
      const donorResult = await this.migrateDonors();
      const adminResult = await this.migrateAdmins();

      results.details = {
        students: studentResult,
        schools: schoolResult,
        donors: donorResult,
        admins: adminResult,
      };

      results.migrated = studentResult.migrated + schoolResult.migrated + donorResult.migrated + adminResult.migrated;
      results.errors = [...studentResult.errors, ...schoolResult.errors, ...donorResult.errors, ...adminResult.errors];

      if (results.errors.length > 0) {
        results.success = false;
      }

      console.log('Migration completed:', results);
      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Migration failed:', error);
      return results;
    }
  }

  /**
   * Migrate old Student model to new User + Student structure
   */
  static async migrateStudents(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      // Import old Student model (assuming it exists)
      const OldStudent = mongoose.models.Student;
      if (!OldStudent) {
        result.errors.push('Old Student model not found');
        return result;
      }

      const oldStudents = await OldStudent.find({});
      console.log(`Found ${oldStudents.length} old student records`);

      for (const oldStudent of oldStudents) {
        try {
          // Create User record
          const user = await User.create({
            name: oldStudent.name || 'Unknown Student',
            email: oldStudent.email,
            password: oldStudent.password, // Will be hashed automatically
            role: 'student',
            phone: oldStudent.phone,
            isVerified: false,
          });

          // Create Student profile
          await Student.create({
            userId: user._id,
            class: oldStudent.class || 'Unknown',
            tribeCategory: 'tribal', // Default, can be updated later
            state: oldStudent.state || 'Unknown',
            district: oldStudent.district || 'Unknown',
            interests: [],
            scholarshipsApplied: [],
          });

          result.migrated++;
          console.log(`Migrated student: ${oldStudent.email} -> User ID: ${user._id}`);

        } catch (error) {
          result.errors.push(`Failed to migrate student ${oldStudent.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error migrating student ${oldStudent.email}:`, error);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Student migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Migrate old School model to new User + School structure
   */
  static async migrateSchools(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      const OldSchool = mongoose.models.School;
      if (!OldSchool) {
        result.errors.push('Old School model not found');
        return result;
      }

      const oldSchools = await OldSchool.find({});
      console.log(`Found ${oldSchools.length} old school records`);

      for (const oldSchool of oldSchools) {
        try {
          // Create User record
          const user = await User.create({
            name: oldSchool.schoolName || 'Unknown School',
            email: oldSchool.email,
            password: oldSchool.password,
            role: 'school',
            phone: oldSchool.phone,
            isVerified: oldSchool.verificationStatus === 'verified',
          });

          // Create School profile
          await School.create({
            userId: user._id,
            schoolName: oldSchool.schoolName,
            schoolCode: oldSchool.schoolCode || `SCH-${Date.now()}`,
            district: oldSchool.district || 'Unknown',
            state: oldSchool.state || 'Unknown',
            locationCoordinates: {
              type: 'Point',
              coordinates: [0, 0], // Default coordinates, should be updated
            },
            studentsCount: oldSchool.studentsCount || 0,
            teachersCount: oldSchool.teachersCount || 0,
            facilities: [],
            needs: [],
            verificationStatus: oldSchool.verificationStatus || 'pending',
            affiliation: {
              board: 'State Board',
              established: 2000,
              type: 'government',
            },
            academicDetails: {
              classesOffered: ['1-10'],
              medium: ['English', 'Regional'],
              studentTeacherRatio: 30,
              passRate: 75,
              lastAcademicYear: '2023-24',
            },
            infrastructure: {
              totalArea: 1000,
              buildingArea: 500,
              playgroundArea: 500,
              hasElectricity: true,
              hasWaterSupply: true,
              hasInternet: false,
              condition: 'fair',
            },
          });

          result.migrated++;
          console.log(`Migrated school: ${oldSchool.schoolName} -> User ID: ${user._id}`);

        } catch (error) {
          result.errors.push(`Failed to migrate school ${oldSchool.schoolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error migrating school ${oldSchool.schoolName}:`, error);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`School migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Migrate old Donor model to new User + Donor structure
   */
  static async migrateDonors(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      const OldDonor = mongoose.models.Donor;
      if (!OldDonor) {
        result.errors.push('Old Donor model not found');
        return result;
      }

      const oldDonors = await OldDonor.find({});
      console.log(`Found ${oldDonors.length} old donor records`);

      for (const oldDonor of oldDonors) {
        try {
          // Create User record
          const user = await User.create({
            name: oldDonor.name || 'Unknown Donor',
            email: oldDonor.email,
            password: oldDonor.password,
            role: 'donor',
            phone: oldDonor.phone,
            isVerified: false,
          });

          // Create Donor profile
          await Donor.create({
            userId: user._id,
            donorType: 'Individual', // Default, can be updated
            organizationName: oldDonor.organizationName,
            donationHistory: [],
            totalDonated: 0,
            recurringDonations: [],
            preferences: {
              interests: [],
              preferredRegions: [],
              communicationFrequency: 'monthly',
              anonymousPreference: false,
              impactUpdates: true,
              taxReceipts: true,
            },
            verificationStatus: 'pending',
          });

          result.migrated++;
          console.log(`Migrated donor: ${oldDonor.name} -> User ID: ${user._id}`);

        } catch (error) {
          result.errors.push(`Failed to migrate donor ${oldDonor.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error migrating donor ${oldDonor.name}:`, error);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Donor migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Migrate old Admin model to new User + Admin structure
   */
  static async migrateAdmins(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      const OldAdmin = mongoose.models.Admin;
      if (!OldAdmin) {
        result.errors.push('Old Admin model not found');
        return result;
      }

      const oldAdmins = await OldAdmin.find({});
      console.log(`Found ${oldAdmins.length} old admin records`);

      for (const oldAdmin of oldAdmins) {
        try {
          // Create User record
          const user = await User.create({
            name: oldAdmin.name || 'Unknown Admin',
            email: oldAdmin.email,
            password: oldAdmin.password,
            role: 'admin',
            phone: oldAdmin.phone,
            isVerified: true, // Admins are auto-verified
          });

          // Create Admin profile
          await Admin.create({
            userId: user._id,
            permissions: ['viewAnalytics', 'manageUsers'], // Default permissions
            role: 'admin',
            accessLevel: 'full',
            isActive: true,
          });

          result.migrated++;
          console.log(`Migrated admin: ${oldAdmin.name} -> User ID: ${user._id}`);

        } catch (error) {
          result.errors.push(`Failed to migrate admin ${oldAdmin.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error migrating admin ${oldAdmin.name}:`, error);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Admin migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Validate migration by checking data integrity
   */
  static async validateMigration(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      // Check User counts by role
      const userCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      // Check role-specific counts
      const studentCount = await Student.countDocuments();
      const schoolCount = await School.countDocuments();
      const donorCount = await Donor.countDocuments();
      const adminCount = await Admin.countDocuments();

      result.details = {
        userCounts,
        roleCounts: {
          students: studentCount,
          schools: schoolCount,
          donors: donorCount,
          admins: adminCount,
        },
      };

      // Validate that each role-specific record has a corresponding User
      const studentUsers = await Student.find({}).populate('userId');
      const orphanedStudents = studentUsers.filter(s => !s.userId);
      if (orphanedStudents.length > 0) {
        result.errors.push(`${orphanedStudents.length} students without corresponding User records`);
      }

      const schoolUsers = await School.find({}).populate('userId');
      const orphanedSchools = schoolUsers.filter(s => !s.userId);
      if (orphanedSchools.length > 0) {
        result.errors.push(`${orphanedSchools.length} schools without corresponding User records`);
      }

      const donorUsers = await Donor.find({}).populate('userId');
      const orphanedDonors = donorUsers.filter(d => !d.userId);
      if (orphanedDonors.length > 0) {
        result.errors.push(`${orphanedDonors.length} donors without corresponding User records`);
      }

      const adminUsers = await Admin.find({}).populate('userId');
      const orphanedAdmins = adminUsers.filter(a => !a.userId);
      if (orphanedAdmins.length > 0) {
        result.errors.push(`${orphanedAdmins.length} admins without corresponding User records`);
      }

      result.migrated = studentCount + schoolCount + donorCount + adminCount;

      if (result.errors.length > 0) {
        result.success = false;
      }

      console.log('Migration validation completed:', result);
      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Rollback migration (for testing purposes)
   */
  static async rollbackMigration(): Promise<MigrationResult> {
    const result = {
      success: true,
      migrated: 0,
      errors: [] as string[],
      details: {} as any,
    };

    try {
      console.log('Rolling back migration...');

      // Delete all role-specific records
      const studentDelete = await Student.deleteMany({});
      const schoolDelete = await School.deleteMany({});
      const donorDelete = await Donor.deleteMany({});
      const adminDelete = await Admin.deleteMany({});

      // Delete all User records with roles other than 'volunteer' or 'ngo'
      // (assuming volunteers and NGOs are handled separately)
      const userDelete = await User.deleteMany({ 
        role: { $in: ['student', 'school', 'donor', 'admin'] }
      });

      result.details = {
        deletedStudents: studentDelete.deletedCount,
        deletedSchools: schoolDelete.deletedCount,
        deletedDonors: donorDelete.deletedCount,
        deletedAdmins: adminDelete.deletedCount,
        deletedUsers: userDelete.deletedCount,
      };

      result.migrated = result.details.deletedUsers;

      console.log('Rollback completed:', result);
      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }
}

// Export for use in scripts
export default ModelMigration;
