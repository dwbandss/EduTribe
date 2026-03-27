// Quick authentication test script
// Run with: node test-auth.js

const jwt = require('jsonwebtoken');

// Test JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in environment variables');
  process.exit(1);
}
console.log('✅ JWT_SECRET found');

// Test JWT token generation and verification
const testPayload = {
  role: 'ngo',
  uid: 'EDU-NGO-961933',
  ngoUid: 'EDU-NGO-961933',
  verifiedStatus: 'verified'
};

const token = jwt.sign(testPayload, JWT_SECRET);
console.log('✅ JWT Token generated:', token.substring(0, 50) + '...');

// Test JWT verification
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ JWT verification successful:', decoded);
  
  if (decoded.role !== 'ngo') {
    console.error('❌ Role mismatch:', decoded.role);
  }
  
  if (decoded.uid !== 'EDU-NGO-961933') {
    console.error('❌ UID mismatch:', decoded.uid);
  }
  
} catch (error) {
  console.error('❌ JWT verification failed:', error.message);
}

console.log('\n🔍 Authentication Test Complete');
console.log('📝 Check browser console for any remaining errors');
console.log('🌐 Test the full flow: login → dashboard → profile');
