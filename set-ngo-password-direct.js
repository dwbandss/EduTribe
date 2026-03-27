// Direct script to set NGO password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Update these with your actual values
const MONGO_URI = 'mongodb://localhost:27017/edutribe';
const NGO_UID = 'EDU-NGO-961933';
const NEW_PASSWORD = '1234567890';

async function setNGOPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the NGO collection directly
    const db = mongoose.connection.db;
    const ngoCollection = db.collection('ngos');

    // Find the NGO
    const ngo = await ngoCollection.findOne({ ngoUid: NGO_UID });
    
    if (!ngo) {
      console.log('❌ NGO not found with UID:', NGO_UID);
      return;
    }

    console.log('✅ NGO found:', ngo.ngoName);
    console.log('Current password exists:', !!ngo.password);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update the NGO with password
    const result = await ngoCollection.updateOne(
      { ngoUid: NGO_UID },
      { $set: { password: hashedPassword } }
    );

    console.log('✅ Password set successfully');
    console.log('Modified count:', result.modifiedCount);

    // Verify the password was set
    const updatedNGO = await ngoCollection.findOne({ ngoUid: NGO_UID });
    console.log('Password exists after update:', !!updatedNGO.password);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setNGOPassword();
