fetch('http://localhost:3000/student/dashboard').then(r => console.log('Dashboard Status:', r.status)).catch(e => console.log('Error:', e.message));
fetch('http://localhost:3000/school-finder').then(r => console.log('School Finder Status:', r.status)).catch(e => console.log('Error:', e.message));
