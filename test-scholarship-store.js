// Test scholarship store directly
console.log('🎓 TESTING SCHOLARSHIP STORE DIRECTLY');

// Import the API module to test
const scholarshipAPI = require('./app/api/scholarships/recommend/route.ts');

// Test with a complete profile
const testProfile = {
  class: '12th',
  state: 'Jharkhand',
  category: 'ST',
  income: 500000,
  marks: 85,
  uid: 'test-user-final'
};

console.log('Testing with profile:', testProfile);

// Simulate API call
const mockRequest = {
  json: async () => Promise.resolve({ studentProfile: testProfile })
};

// Call the POST function
scholarshipAPI.POST(mockRequest).then(response => {
  console.log('🎓 API Response:', response);
}).catch(error => {
  console.log('🎓 API Error:', error);
});
