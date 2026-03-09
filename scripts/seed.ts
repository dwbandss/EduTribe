// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const { generateUID } = require('../lib/generateUID');
const bcrypt = require('bcryptjs');

// Define schemas inline for CommonJS compatibility
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  uid: { type: String, unique: true, required: true },
  role: { type: String, enum: ["volunteer","ngo","donor","student","admin"], required: true },
  organizationName: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const SchoolSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  schoolCode: { type: String, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  uid: { type: String, unique: true, required: true },
  district: String,
  state: String,
  studentsCount: Number,
  teachersCount: Number,
  needs: [String],
  verificationStatus: { type: String, enum: ["pending","verified","rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const School = mongoose.model('School', SchoolSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUID = generateUID();
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    
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
        email: 'tps.hazaribagh@edutribe.com',
        password: 'school123',
        district: 'Hazaribagh',
        state: 'Jharkhand',
        studentsCount: 150,
        teachersCount: 5,
        needs: ['Books', 'Computers', 'Playground Equipment']
      },
      {
        schoolName: 'Government School - Ranchi',
        schoolCode: 'GS-RCH-002',
        email: 'gs.ranchi@edutribe.com',
        password: 'school123',
        district: 'Ranchi',
        state: 'Jharkhand',
        studentsCount: 200,
        teachersCount: 8,
        needs: ['Science Lab', 'Library Books', 'Sports Equipment']
      }
    ];

    for (const schoolData of schools) {
      const schoolUID = generateUID();
      const hashedPassword = await bcrypt.hash(schoolData.password, 12);
      
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
