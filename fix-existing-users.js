// Script to fix existing users by hashing their plaintext passwords
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutribe';

async function fixExistingUsers() {
  console.log('=== 🔧 FIXING EXISTING USERS ===');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('edutribe');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`📊 Found ${users.length} users to check`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      // Check if password is plaintext (not hashed)
      if (user.password && !user.password.startsWith('$2') && !user.password.startsWith('$2b')) {
        console.log(`🔧 Fixing user: ${user.email}`);
        
        // Hash the password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update user with hashed password
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        fixedCount++;
        console.log(`✅ Fixed: ${user.email}`);
      } else {
        console.log(`✅ Already hashed: ${user.email}`);
      }
    }
    
    await client.close();
    
    console.log(`\n=== 🎉 COMPLETED ===`);
    console.log(`✅ Fixed ${fixedCount} users`);
    console.log(`📊 Total users processed: ${users.length}`);
    console.log('\n🔐 Now all users have properly hashed passwords!');
    console.log('\n🚀 Login system should work correctly now!');
  } catch (error) {
    console.error('❌ Error fixing users:', error);
  }
}

fixExistingUsers();
