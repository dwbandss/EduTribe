const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe';

async function createTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test data
    console.log('Clearing existing test data...');
    await mongoose.connection.collection('schools').deleteMany({ uid: { $in: ['TEST-SCH-001', 'EDU-SCH-876450'] } });
    await mongoose.connection.collection('volunteers').deleteMany({ uid: { $in: ['TEST-VOL-001', 'EDU-VOL-836766'] } });
    await mongoose.connection.collection('students').deleteMany({ uid: { $in: ['TEST-STU-001', 'EDU-STU-375299'] } });
    await mongoose.connection.collection('volunteerrequests').deleteMany({ schoolUid: { $in: ['TEST-SCH-001', 'EDU-SCH-876450'] } });
    await mongoose.connection.collection('volunteerapplications').deleteMany({});
    await mongoose.connection.collection('volunteerassignments').deleteMany({});

    console.log('Creating test school...');
    const school = await mongoose.connection.collection('schools').insertOne({
      uid: 'EDU-SCH-876450',
      schoolName: 'Test High School',
      email: 'school@test.com',
      phone: '+91 9876543210',
      district: 'Khurda',
      locality: 'Bhubaneswar',
      address: 'Test Address, Bhubaneswar',
      classesAvailable: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      subjectsNeeded: ['Mathematics', 'Science', 'English'],
      totalStudents: 150,
      verificationStatus: 'verified',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('School created:', school.insertedId);

    console.log('Creating test volunteer...');
    const volunteer = await mongoose.connection.collection('volunteers').insertOne({
      uid: 'EDU-VOL-836766',
      name: 'Test Volunteer',
      email: 'volunteer@test.com',
      phone: '+91 9876543211',
      skills: ['Mathematics', 'Science', 'English'],
      preferredSubjects: ['Mathematics', 'Science'],
      preferredClasses: ['Class 8', 'Class 9', 'Class 10'],
      preferredDistrict: 'Khurda',
      preferredLocality: 'Bhubaneswar',
      availability: [
        { day: 'Monday', timeSlots: ['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)'] },
        { day: 'Wednesday', timeSlots: ['Afternoon (12PM-4PM)'] }
      ],
      experience: '3 years teaching experience',
      bio: 'Passionate about education',
      ratingAverage: 4.5,
      profileCompleted: true,
      isActive: true,
      verificationStatus: 'verified',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Volunteer created:', volunteer.insertedId);

    console.log('Creating test student...');
    const student = await mongoose.connection.collection('students').insertOne({
      uid: 'EDU-STU-375299',
      name: 'Test Student',
      email: 'student@test.com',
      schoolUid: 'EDU-SCH-876450',
      class: 'Class 8',
      subjects: ['Mathematics', 'Science', 'English'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Student created:', student.insertedId);

    console.log('Creating test volunteer request...');
    const request = await mongoose.connection.collection('volunteerrequests').insertOne({
      requestId: 'REQ-TEST-001',
      schoolUid: 'EDU-SCH-876450',
      subjectsRequired: ['Mathematics', 'Science'],
      classesRequired: ['Class 8', 'Class 9'],
      volunteersNeeded: 2,
      district: 'Khurda',
      locality: 'Bhubaneswar',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Volunteer request created:', request.insertedId);

    console.log('\n✅ Test data created successfully!');
    console.log('\nTest Credentials:');
    console.log('School UID: EDU-SCH-876450');
    console.log('Volunteer UID: EDU-VOL-836766');
    console.log('Student UID: EDU-STU-375299');
    console.log('Password for all: Use existing password from your system');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
