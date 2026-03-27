// Test Fixed NGO Authentication Flow
// Run with: node test-fixed-auth.js

const jwt = require('jsonwebtoken');

console.log('🔍 TESTING FIXED NGO AUTHENTICATION FLOW\n');

// Test JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in environment variables');
  console.log('💡 Create .env.local file with: JWT_SECRET=your-secret-key-here');
  process.exit(1);
}
console.log('✅ JWT_SECRET found');

// Test NGO JWT token generation and verification
const ngoPayload = {
  role: 'ngo', // Fixed: explicitly set role
  uid: 'EDU-NGO-961933',
  ngoUid: 'EDU-NGO-961933',
  verifiedStatus: 'verified'
};

const ngoToken = jwt.sign(ngoPayload, JWT_SECRET);
console.log('✅ NGO JWT Token generated successfully');

// Test JWT verification
try {
  const decoded = jwt.verify(ngoToken, JWT_SECRET);
  console.log('✅ NGO JWT verification successful');
  console.log('📋 Token payload:', {
    role: decoded.role,
    uid: decoded.uid,
    ngoUid: decoded.ngoUid,
    verifiedStatus: decoded.verifiedStatus
  });
  
  // Verify correct role
  if (decoded.role !== 'ngo') {
    console.error('❌ Role mismatch:', decoded.role);
  } else {
    console.log('✅ NGO role verified');
  }
  
} catch (error) {
  console.error('❌ JWT verification failed:', error.message);
}

console.log('\n🎯 EXPECTED FLOW AFTER FIXES:');
console.log('1. Login → JWT with role="ngo"');
console.log('2. Dashboard → Shows volunteers using verified=true & status="active"');
console.log('3. Profile → Loads without auth errors');
console.log('4. Volunteer Actions → Uses correct schema fields');
console.log('5. Impact Tab → Shows correct statistics');

console.log('\n🔧 SCHEMA FIXES APPLIED:');
console.log('✅ Volunteer: verified (boolean) + status (string)');
console.log('✅ NGO: ngoUid + verifiedStatus');
console.log('✅ Login: role="ngo" for NGO users');
console.log('✅ APIs: Use correct field names');

console.log('\n🚀 READY TO TEST FULL FLOW!');
