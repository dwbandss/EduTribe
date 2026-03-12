// Test school finder functionality
const testSchoolFinder = async () => {
  console.log('=== 🏫 TESTING SCHOOL FINDER FUNCTIONALITY ===');
  
  try {
    // Test 1: Check if school finder page loads
    const schoolFinderPage = await fetch('http://localhost:3000/school-finder');
    console.log('School Finder Page Status:', schoolFinderPage.status);
    
    // Test 2: Check if search API works
    const searchAPI = await fetch('http://localhost:3000/api/schools/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'schools',
        page: 1
      })
    });
    console.log('Search API Status:', searchAPI.status);
    
    if (searchAPI.status === 200) {
      const searchData = await searchAPI.json();
      console.log('Search Results:', searchData.success ? '✅ Working' : '❌ Failed');
      console.log('Schools Found:', searchData.data?.length || 0);
    }
    
    // Test 3: Check if AI chat API works
    const aiAPI = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Find schools near me',
        context: 'School finder'
      })
    });
    console.log('AI Chat API Status:', aiAPI.status);
    
  } catch (error) {
    console.log('Error:', error.message);
  }
};

testSchoolFinder();
