const mongoose = require('mongoose');

// Simple UID generator
function generateUID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uid = 'USR-';
  for (let i = 0; i < 6; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

async function migrateUserUIDs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe');
    console.log("Connected to MongoDB");

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users without UID
    const usersWithoutUID = await usersCollection.find({ uid: { $exists: false } }).toArray();
    console.log(`Found ${usersWithoutUID.length} users without UID`);

    for (const user of usersWithoutUID) {
      const newUID = generateUID();
      console.log(`Assigning UID ${newUID} to user ${user.email}`);
      
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { uid: newUID } }
      );
    }

    console.log("Migration completed successfully");
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

// Run the migration
migrateUserUIDs();
