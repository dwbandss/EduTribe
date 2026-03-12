// Initialize document store with sample data
import { documentStore } from '../lib/document-store';
import { sampleSchools, sampleSchemes } from '../data/sample-data';

console.log('🎓 INITIALIZING DOCUMENT STORE WITH SAMPLE DATA...');

// Clear existing documents
documentStore.clear();

// Add sample schools
sampleSchools.forEach(school => {
  documentStore.addDocument({
    id: school.id,
    text: school.text,
    type: 'school',
    title: school.name
  });
});

// Add sample schemes
sampleSchemes.forEach(scheme => {
  documentStore.addDocument({
    id: scheme.id,
    text: scheme.text,
    type: 'scheme',
    title: scheme.name
  });
});

console.log(`✅ Added ${sampleSchools.length} schools and ${sampleSchemes.length} schemes to document store`);
console.log('📚 Document store is ready for AI Admission Assistant!');
console.log('🌐 Access: http://localhost:3000/student/dashboard');
console.log('📋 Click "AI Assistant" tab to test the system');
