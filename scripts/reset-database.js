const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe');
    
    console.log("Connected to MongoDB");
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Drop each collection
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await db.dropCollection(collection.name);
    }
    
    console.log("All collections dropped successfully");
    
    // Close connection
    await mongoose.connection.close();
    console.log("Database reset complete");
    
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
