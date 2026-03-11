// Load environment variables
require('dotenv').config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { School } from '../models/refactored/SchoolSimple';
import { User } from '../models/refactored/User';

// Simple UID generator
function generateUID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uid = 'USR-';
  for (let i = 0; i < 6; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUID = generateUID();
    const salt = await bcrypt.genSalt(12);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@edutribe.com',
      password: hashedAdminPassword,
      uid: adminUID,
      role: 'admin',
      permissions: ['manage_users', 'manage_schools', 'manage_content']
    });
    await admin.save();
    console.log(`Created admin user with UID: ${adminUID}`);

    // Create sample schools
    const schools = [
      {
        schoolName: 'Tribal Primary School - Hazaribagh',
        schoolCode: 'TPS-HZB-001',
        type: 'government',
        board: 'CBSE',
        state: 'Jharkhand',
        studentsCount: 150,
        teachersCount: 5,
        needs: ['Books', 'Computers', 'Playground Equipment'],
        contact: {
          phone: '06852-234567',
          email: 'tps.hazaribagh@edutribe.com',
          address: 'Village: Hazaribagh, Block: Hazaribagh',
          city: 'Hazaribagh',
          district: 'Hazaribagh',
          state: 'Jharkhand',
          pincode: '825405'
        },
        academics: {
          streams: ['science', 'arts'],
          classes: ['1', '2', '3', '4', '5'],
          board: 'CBSE',
          medium: ['Hindi', 'English'],
          establishedYear: 1995
        },
        facilities: ['hostel', 'library', 'playground'],
        tribalInfo: {
          tribalCategory: 'ST',
          tribalPercentage: 85
        },
        affiliation: {
          type: 'government',
          established: 1990,
          board: 'CBSE',
          recognitionNumber: 'CBSE-1995-001'
        },
        academicDetails: {
          classesOffered: ['1', '2', '3', '4', '5'],
          medium: ['Hindi', 'English'],
          studentTeacherRatio: 30,
          passRate: 75,
          lastAcademicYear: '2023-24'
        }
      },
      {
        schoolName: 'Government School - Ranchi',
        schoolCode: 'GS-RCH-002',
        type: 'government',
        board: 'CBSE',
        state: 'Jharkhand',
        studentsCount: 200,
        teachersCount: 12,
        needs: ['Books', 'Computers', 'Playground Equipment'],
        contact: {
          phone: '0651-2215432',
          email: 'gps.ranchi@edutribe.com',
          address: 'Main Road, Ranchi',
          city: 'Ranchi',
          district: 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001'
        },
        academics: {
          streams: ['science', 'commerce'],
          classes: ['6', '7', '8', '9', '10', '11', '12'],
          board: 'CBSE',
          medium: ['Hindi', 'English'],
          establishedYear: 1980
        },
        facilities: ['library', 'laboratory', 'computerLab', 'sports'],
        tribalInfo: {
          tribalCategory: 'ST',
          tribalPercentage: 75
        },
        affiliation: {
          type: 'government',
          established: 1980,
          board: 'CBSE',
          recognitionNumber: 'CBSE-1980-002'
        },
        academicDetails: {
          classesOffered: ['6', '7', '8', '9', '10', '11', '12'],
          medium: ['Hindi', 'English'],
          studentTeacherRatio: 17,
          passRate: 82,
          lastAcademicYear: '2023-24'
        }
      },
      {
        schoolName: 'Jawahar Navodaya Vidyalaya - Rayagada',
        schoolCode: 'JNV-RYG-003',
        type: 'government',
        board: 'CBSE',
        state: 'Odisha',
        studentsCount: 200,
        teachersCount: 8,
        needs: ['Science Lab', 'Library Books', 'Sports Equipment'],
        contact: {
          phone: '06852-245678',
          email: 'jnv.rayagada@odisha.gov.in',
          address: 'JNV Campus, Rayagada',
          city: 'Rayagada',
          district: 'Rayagada',
          state: 'Odisha',
          pincode: '765001'
        },
        academics: {
          streams: ['science', 'commerce', 'arts'],
          classes: ['6', '7', '8', '9', '10', '11', '12'],
          board: 'CBSE',
          medium: ['English', 'Odia'],
          establishedYear: 1992
        },
        facilities: ['hostel', 'library', 'laboratory', 'computerLab', 'sports', 'medical'],
        tribalInfo: {
          tribalCategory: 'ST',
          tribalPercentage: 78
        },
        affiliation: {
          type: 'government',
          established: 1992,
          board: 'CBSE',
          recognitionNumber: 'JNV-1992-003'
        },
        academicDetails: {
          classesOffered: ['6', '7', '8', '9', '10', '11', '12'],
          medium: ['English', 'Odia'],
          studentTeacherRatio: 25,
          passRate: 88,
          lastAcademicYear: '2023-24'
        }
      }
    ];

    for (const schoolData of schools) {
      const schoolUID = generateUID();
      const hashedPassword = await bcrypt.hash('default123', 12);
      
      const school = new School({
        ...schoolData,
        password: hashedPassword,
        uid: schoolUID,
        verificationStatus: 'verified'
      });
      await school.save();
      console.log(`Created school: ${schoolData.schoolName} with UID: ${schoolUID}`);
    }

    // Create sample volunteers
    const volunteers = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@volunteer.com',
        password: 'volunteer123',
        role: 'volunteer',
        phone: '+91-9876543210'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@volunteer.com',
        password: 'volunteer123',
        role: 'volunteer',
        phone: '+91-9876543211'
      }
    ];

    for (const volunteerData of volunteers) {
      const volunteerUID = generateUID();
      const hashedPassword = await bcrypt.hash(volunteerData.password, 12);
      
      const volunteer = new User({
        ...volunteerData,
        password: hashedPassword,
        uid: volunteerUID
      });
      await volunteer.save();
      console.log(`Created volunteer: ${volunteerData.name} with UID: ${volunteerUID}`);
    }

    // Create sample NGOs
    const ngos = [
      {
        name: 'Education First Foundation',
        email: 'info@educationfirst.org',
        password: 'ngo123',
        role: 'ngo',
        organizationName: 'Education First Foundation',
        phone: '+91-9876543212'
      },
      {
        name: 'Tribal Welfare Society',
        email: 'contact@tribalwelfare.org',
        password: 'ngo123',
        role: 'ngo',
        organizationName: 'Tribal Welfare Society',
        phone: '+91-9876543213'
      }
    ];

    for (const ngoData of ngos) {
      const ngoUID = generateUID();
      const hashedPassword = await bcrypt.hash(ngoData.password, 12);
      
      const ngo = new User({
        ...ngoData,
        password: hashedPassword,
        uid: ngoUID
      });
      await ngo.save();
      console.log(`Created NGO: ${ngoData.name} with UID: ${ngoUID}`);
    }

    // Create sample donors
    const donors = [
      {
        name: 'Anita Corporation',
        email: 'donations@anitacorp.com',
        password: 'donor123',
        role: 'donor',
        organizationName: 'Anita Corporation',
        phone: '+91-9876543214'
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul.mehta@donor.com',
        password: 'donor123',
        role: 'donor',
        phone: '+91-9876543215'
      }
    ];

    for (const donorData of donors) {
      const donorUID = generateUID();
      const hashedPassword = await bcrypt.hash(donorData.password, 12);
      
      const donor = new User({
        ...donorData,
        password: hashedPassword,
        uid: donorUID
      });
      await donor.save();
      console.log(`Created donor: ${donorData.name} with UID: ${donorUID}`);
    }

    // Create sample students
    const students = [
      {
        name: 'Lakshmi Devi',
        email: 'lakshmi@student.com',
        password: 'student123',
        role: 'student',
        phone: '+91-9876543216'
      },
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@student.com',
        password: 'student123',
        role: 'student',
        phone: '+91-9876543217'
      }
    ];

    for (const studentData of students) {
      const studentUID = generateUID();
      const hashedPassword = await bcrypt.hash(studentData.password, 12);
      
      const student = new User({
        ...studentData,
        password: hashedPassword,
        uid: studentUID
      });
      await student.save();
      console.log(`Created student: ${studentData.name} with UID: ${studentUID}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('====================');
    console.log('Admin: admin@edutribe.com / admin123');
    console.log('School 1: tps.hazaribagh@edutribe.com / school123');
    console.log('School 2: gs.ranchi@edutribe.com / school123');
    console.log('Volunteer 1: priya.sharma@volunteer.com / volunteer123');
    console.log('Volunteer 2: rajesh.kumar@volunteer.com / volunteer123');
    console.log('NGO 1: info@educationfirst.org / ngo123');
    console.log('NGO 2: contact@tribalwelfare.org / ngo123');
    console.log('Donor 1: donations@anitacorp.com / donor123');
    console.log('Donor 2: rahul.mehta@donor.com / donor123');
    console.log('Student 1: lakshmi@student.com / student123');
    console.log('Student 2: ramesh@student.com / student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();
