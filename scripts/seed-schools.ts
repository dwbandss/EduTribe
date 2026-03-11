import mongoose from 'mongoose';
import { School } from '../models/refactored/SchoolSimple';
import dotenv from 'dotenv';

dotenv.config();

// Sample school data with geospatial coordinates
const sampleSchools = [
  {
    schoolName: 'Eklavya Model Residential School, Koraput',
    schoolCode: 'EMRS-KRP-001',
    type: 'EMRS',
    locationCoordinates: {
      type: 'Point',
      coordinates: [82.7167, 18.8158] // [longitude, latitude]
    },
    contact: {
      phone: '+91-6852-234567',
      email: 'principal@emrskoraput.edu.in',
      website: 'www.emrskoraput.edu.in',
      principal: 'Dr. R.K. Patel',
      address: 'Semiliguda, Koraput District',
      city: 'Koraput',
      district: 'Koraput',
      state: 'Odisha',
      pincode: '764012'
    },
    academics: {
      streams: ['science', 'commerce'],
      classes: ['6', '7', '8', '9', '10', '11', '12'],
      board: 'CBSE',
      medium: ['English', 'Hindi'],
      establishedYear: 2007,
      affiliationNumber: '1530056'
    },
    facilities: {
      hostel: true,
      science: true,
      sports: true,
      library: true,
      laboratory: true,
      computerLab: true,
      transport: true,
      playground: true,
      medical: true,
      cafeteria: true
    },
    tribalInfo: {
      tribalCategory: 'ST',
      tribalPercentage: 85,
      specialSchemes: ['National Scholarship', 'Post Matric Scholarship'],
      reservationQuota: 75,
      tribalWelfareSchemes: ['ST Welfare Fund', 'Tribal Development Program']
    },
    studentsCount: 420,
    teachersCount: 35,
    verificationStatus: 'verified',
    description: 'Premier Eklavya Model Residential School providing quality education to tribal students in Koraput district with modern facilities and experienced faculty.',
    rating: 4.2,
    reviewCount: 89
  },
  {
    schoolName: 'Government Tribal High School, Malkangiri',
    schoolCode: 'GTHS-MLK-002',
    type: 'Government',
    locationCoordinates: {
      type: 'Point',
      coordinates: [83.5167, 19.2667]
    },
    contact: {
      phone: '+91-6861-223344',
      email: 'gths Malkangiri@gmail.com',
      principal: 'Smt. L. Devi',
      address: 'Village: Khairaput, Block: Chitrakonda',
      city: 'Malkangiri',
      district: 'Malkangiri',
      state: 'Odisha',
      pincode: '764043'
    },
    academics: {
      streams: ['arts'],
      classes: ['6', '7', '8', '9', '10'],
      board: 'State Board',
      medium: ['Odia', 'English'],
      establishedYear: 1985
    },
    facilities: {
      hostel: false,
      science: false,
      sports: true,
      library: true,
      laboratory: false,
      computerLab: false,
      transport: false,
      playground: true,
      medical: false,
      cafeteria: false
    },
    tribalInfo: {
      tribalCategory: 'ST',
      tribalPercentage: 92,
      specialSchemes: ['Free Education', 'Mid-Day Meal'],
      reservationQuota: 100
    },
    studentsCount: 156,
    teachersCount: 8,
    verificationStatus: 'verified',
    description: 'Government tribal high school focused on providing basic education to tribal children in remote Malkangiri district.',
    rating: 3.8,
    reviewCount: 45
  },
  {
    schoolName: 'Jawahar Navodaya Vidyalaya, Rayagada',
    schoolCode: 'JNV-RYG-003',
    type: 'Government-Aided',
    locationCoordinates: {
      type: 'Point',
      coordinates: [83.4167, 19.1667]
    },
    contact: {
      phone: '+91-6856-245678',
      email: 'principal@jnvrayagada.gov.in',
      website: 'www.jnvrayagada.gov.in',
      principal: 'Shri P.K. Mishra',
      address: 'Near Collectorate, Rayagada',
      city: 'Rayagada',
      district: 'Rayagada',
      state: 'Odisha',
      pincode: '765001'
    },
    academics: {
      streams: ['science', 'commerce', 'arts'],
      classes: ['6', '7', '8', '9', '10', '11', '12'],
      board: 'CBSE',
      medium: ['English'],
      establishedYear: 1992,
      affiliationNumber: '1530089'
    },
    facilities: {
      hostel: true,
      science: true,
      sports: true,
      library: true,
      laboratory: true,
      computerLab: true,
      transport: true,
      playground: true,
      medical: true,
      cafeteria: true
    },
    tribalInfo: {
      tribalCategory: 'ST',
      tribalPercentage: 78,
      specialSchemes: ['Navodaya Scholarship', 'Merit-based Awards'],
      reservationQuota: 75
    },
    studentsCount: 520,
    teachersCount: 42,
    verificationStatus: 'verified',
    description: 'Jawahar Navodaya Vidyalaya providing quality residential education to rural talented children with focus on holistic development.',
    rating: 4.5,
    reviewCount: 156
  },
  {
    schoolName: 'Tribal Welfare Residential School, Nabarangpur',
    schoolCode: 'TWRS-NBR-004',
    type: 'Government',
    locationCoordinates: {
      type: 'Point',
      coordinates: [85.1167, 19.9167]
    },
    contact: {
      phone: '+91-6836-267890',
      email: 'twrsnabarangpur@gmail.com',
      principal: 'Dr. S.N. Rao',
      address: 'Nabarangpur, Ganjam District',
      city: 'Nabarangpur',
      district: 'Ganjam',
      state: 'Odisha',
      pincode: '761104'
    },
    academics: {
      streams: ['science'],
      classes: ['6', '7', '8', '9', '10'],
      board: 'State Board',
      medium: ['Odia', 'English'],
      establishedYear: 1995
    },
    facilities: {
      hostel: true,
      science: true,
      sports: true,
      library: true,
      laboratory: true,
      computerLab: false,
      transport: false,
      playground: true,
      medical: true,
      cafeteria: true
    },
    tribalInfo: {
      tribalCategory: 'ST',
      tribalPercentage: 88,
      specialSchemes: ['Free Hostel', 'Stipend for ST Students'],
      reservationQuota: 100
    },
    studentsCount: 280,
    teachersCount: 18,
    verificationStatus: 'verified',
    description: 'Residential school dedicated to tribal welfare with focus on science education and overall development of tribal children.',
    rating: 4.0,
    reviewCount: 67
  },
  {
    schoolName: 'Ashram School, Kandhamal',
    schoolCode: 'AS-KDM-005',
    type: 'Ashram',
    locationCoordinates: {
      type: 'Point',
      coordinates: [84.0167, 19.8667]
    },
    contact: {
      phone: '+91-6842-234567',
      principal: 'Swami Jnanananda',
      address: 'Kandhamal, Boudh District',
      city: 'Boudh',
      district: 'Boudh',
      state: 'Odisha',
      pincode: '762014'
    },
    academics: {
      streams: ['arts'],
      classes: ['1', '2', '3', '4', '5', '6', '7', '8'],
      board: 'State Board',
      medium: ['Odia', 'Sanskrit'],
      establishedYear: 1980
    },
    facilities: {
      hostel: true,
      science: false,
      sports: true,
      library: true,
      laboratory: false,
      computerLab: false,
      transport: false,
      playground: true,
      medical: false,
      cafeteria: true
    },
    tribalInfo: {
      tribalCategory: 'ST',
      tribalPercentage: 95,
      specialSchemes: ['Free Education', 'Vedic Learning'],
      reservationQuota: 100
    },
    studentsCount: 120,
    teachersCount: 6,
    verificationStatus: 'verified',
    description: 'Traditional ashram school providing value-based education along with modern curriculum to tribal children.',
    rating: 3.6,
    reviewCount: 34
  }
];

async function seedSchools() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe');
    console.log('Connected to MongoDB');

    // Clear existing schools
    await School.deleteMany({});
    console.log('Cleared existing schools');

    // Insert sample schools
    const insertedSchools = await School.insertMany(sampleSchools);
    console.log(`Inserted ${insertedSchools.length} schools`);

    // Create geospatial index
    await School.collection.createIndex({ locationCoordinates: '2dsphere' });
    console.log('Created geospatial index');

    // Create other indexes for performance
    await School.collection.createIndex({ 'contact.state': 1, 'contact.district': 1 });
    await School.collection.createIndex({ 'facilities.hostel': 1, 'academics.streams': 1 });
    await School.collection.createIndex({ type: 1, 'tribalInfo.tribalCategory': 1 });
    await School.collection.createIndex({ isActive: 1, isVerified: 1, rating: -1 });
    
    console.log('Created performance indexes');

    console.log('School seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding schools:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedSchools();
