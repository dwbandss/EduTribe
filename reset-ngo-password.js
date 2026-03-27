// Reset NGO password script
// Run with: node reset-ngo-password.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Update this with your actual NGO UID
const NGO_UID = 'EDU-NGO-961933';
const NEW_PASSWORD = '1234567890';

async function resetNGOPassword() {
  try {
    // Connect to MongoDB - update with your connection string
    await mongoose.connect('mongodb://localhost:27017/edutribe');
    console.log('✅ Connected to MongoDB');

    // Import NGO model
    const NGO = require('./models/NGO').default;

    // Find NGO
    const ngo = await NGO.findOne({ ngoUid: NGO_UID });
    
    if (!ngo) {
      console.log('❌ NGO not found with UID:', NGO_UID);
      return;
    }

    console.log('✅ NGO found:', ngo.ngoName);
    console.log('Current password exists:', !!ngo.password);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update password
    await NGO.updateOne(
      { ngoUid: NGO_UID },
      { $set: { password: hashedPassword } }
    );

    console.log('✅ Password reset successfully for:', NGO_UID);
    console.log('New password:', NEW_PASSWORD);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetNGOPassword();
