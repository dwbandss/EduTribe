import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { School } from '@/models/School';

// Sample schools data
const sampleSchools = [
  {
    userId: '64f1a2b3c4d5e6f7g8h9i0j', // Sample user ID
    schoolName: 'Eklavya Model Residential School',
    schoolCode: 'EMRS001',
    type: 'government',
    district: 'Koraput',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [82.7267, 18.8014] // Koraput coordinates
    },
    studentsCount: 500,
    teachersCount: 25,
    facilities: {
      hostel: true,
      sports: true,
      scienceLab: true,
      digitalClassroom: true,
      library: true,
      computerLab: true
    },
    streamsOffered: ['science', 'arts', 'commerce'],
    needs: ['teachers', 'laboratory equipment', 'books'],
    contact: {
      phone: '+91-1234567890',
      email: 'emrs.koraput@edutribe.com',
      address: 'Village: Kunduli, PO: Kunduli',
      city: 'Koraput',
      district: 'Koraput',
      state: 'Odisha',
      pincode: '764021'
    },
    verificationStatus: 'verified'
  },
  {
    userId: '64f1a2b3c4d5e6f7g8h9i0j',
    schoolName: 'Tribal Welfare Residential School',
    schoolCode: 'TWRS002',
    type: 'government',
    district: 'Sundargarh',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [84.9833, 22.1209] // Sundargarh coordinates
    },
    studentsCount: 350,
    teachersCount: 18,
    facilities: {
      hostel: true,
      sports: true,
      scienceLab: false,
      digitalClassroom: false,
      library: true,
      computerLab: true
    },
    streamsOffered: ['arts', 'commerce'],
    needs: ['science teachers', 'laboratory equipment'],
    contact: {
      phone: '+91-0987654321',
      email: 'twrs.sundargarh@edutribe.com',
      address: 'Village: Bargaon, PO: Bargaon',
      city: 'Sundargarh',
      district: 'Sundargarh',
      state: 'Odisha',
      pincode: '770017'
    },
    verificationStatus: 'pending'
  },
  {
    userId: '64f1a2b3c4d5e6f7g8h9i0j',
    schoolName: 'Kalinga Institute of Social Sciences',
    schoolCode: 'KISS003',
    type: 'private',
    district: 'Khordha',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [85.8245, 20.2961] // Bhubaneswar coordinates
    },
    studentsCount: 2000,
    teachersCount: 120,
    facilities: {
      hostel: true,
      sports: true,
      scienceLab: true,
      digitalClassroom: true,
      library: true,
      computerLab: true
    },
    streamsOffered: ['science', 'arts', 'commerce'],
    needs: ['scholarships', 'career counseling'],
    contact: {
      phone: '+91-0674-2350111',
      email: 'info@kiss.ac.in',
      address: 'Kalinga Institute of Social Sciences',
      city: 'Bhubaneswar',
      district: 'Khordha',
      state: 'Odisha',
      pincode: '751029'
    },
    verificationStatus: 'verified'
  }
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    console.log('=== 🏫 SEEDING SAMPLE SCHOOLS ===');

    // Check if schools already exist
    const existingCount = await School.countDocuments();
    console.log(`Existing schools: ${existingCount}`);

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Schools already exist (${existingCount} found). No seeding needed.`,
        count: existingCount
      });
    }

    // Insert sample schools
    const insertedSchools = await School.insertMany(sampleSchools);
    
    console.log(`✅ Inserted ${insertedSchools.length} sample schools`);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedSchools.length} sample schools`,
      count: insertedSchools.length,
      schools: insertedSchools.map(school => ({
        id: school._id,
        name: school.schoolName,
        district: school.district,
        state: school.state,
        type: school.type,
        verificationStatus: school.verificationStatus
      }))
    });

  } catch (error) {
    console.error('Seed schools error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed sample schools',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
