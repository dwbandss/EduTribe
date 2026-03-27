// Debug script to check NGO login issue
// Run with: node debug-ngo-login.js

const mongoose = require('mongoose');

// MongoDB connection string - update if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edutribe';

async function debugNGOLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if NGO model is imported correctly
    const NGO = require('./models/NGO').default;
    const User = require('./models').User;

    const ngoIdentifier = 'EDU-NGO-961933';
    const ngoEmail = 'nmietngo@example.com'; // Update if different

    console.log('\n🔍 CHECKING NGO COLLECTION:');
    const ngoRecord = await NGO.findOne({
      $or: [
        { email: ngoEmail.toLowerCase() },
        { ngoUid: ngoIdentifier.toUpperCase() }
      ]
    }).select('+password');

    console.log('NGO Record:', ngoRecord ? {
      ngoUid: ngoRecord.ngoUid,
      ngoName: ngoRecord.ngoName,
      email: ngoRecord.email,
      hasPassword: !!ngoRecord.password
    } : 'NOT FOUND');

    console.log('\n🔍 CHECKING USER COLLECTION:');
    const userRecord = await User.findOne({
      $or: [
        { email: ngoEmail.toLowerCase() },
        { uid: ngoIdentifier.toUpperCase() }
      ]
    }).select('+password');

    console.log('User Record:', userRecord ? {
      uid: userRecord.uid,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      hasPassword: !!userRecord.password
    } : 'NOT FOUND');

    console.log('\n🎯 DIAGNOSIS:');
    if (ngoRecord && !userRecord) {
      console.log('✅ GOOD: NGO only in NGO collection');
    } else if (!ngoRecord && userRecord) {
      console.log('❌ PROBLEM: NGO only in User collection (needs fixing)');
    } else if (ngoRecord && userRecord) {
      console.log('⚠️  DUPLICATE: NGO in both collections (User record should be removed)');
    } else {
      console.log('❌ MISSING: NGO not found in any collection');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugNGOLogin();
