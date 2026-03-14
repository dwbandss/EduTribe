// Global scholarship store that persists across module reloads
const globalScholarshipStore = new Map();

// Initialize immediately
const sampleScholarships = [
  {
    _id: 'scholarship-1',
    name: 'Jharkhand State Merit Scholarship',
    description: 'Merit-based scholarship for students from Jharkhand state pursuing higher education.',
    eligibilityRules: {
      class: '12th',
      state: 'Jharkhand',
      category: 'ST',
      incomeLimit: 800000,
      minimumMarks: 60
    },
    documentsRequired: ['Mark sheets', 'Domicile certificate', 'Income certificate', 'Category certificate'],
    deadline: new Date('2024-12-31'),
    sponsoringOrg: 'Jharkhand Education Department',
    link: 'https://scholarships.gov.in/',
    isActive: true
  },
  {
    _id: 'scholarship-2',
    name: 'National Scholarship for ST Students',
    description: 'Central government scholarship for Scheduled Tribe students pursuing professional courses.',
    eligibilityRules: {
      class: 'Graduate',
      state: 'Jharkhand',
      category: 'ST',
      incomeLimit: 600000,
      minimumMarks: 50
    },
    documentsRequired: ['Aadhaar card', 'Bank account', 'Category certificate', 'Academic records'],
    deadline: new Date('2024-11-30'),
    sponsoringOrg: 'Ministry of Education',
    link: 'https://www.nsfdc.gov.in/',
    isActive: true
  },
  {
    _id: 'scholarship-3',
    name: 'Post-Matric Scholarship for Girls',
    description: 'Scholarship scheme for girl students who have passed 10th class.',
    eligibilityRules: {
      class: '10th',
      state: 'Jharkhand',
      category: 'General',
      incomeLimit: 500000,
      minimumMarks: 40
    },
    documentsRequired: ['10th mark sheet', 'Domicile certificate', 'Income certificate', 'Bank account'],
    deadline: new Date('2024-10-31'),
    sponsoringOrg: 'State Education Department',
    link: 'https://www.education.gov.in/',
    isActive: true
  },
  {
    _id: 'scholarship-4',
    name: 'Engineering Scholarship Scheme',
    description: 'Scholarship for students pursuing engineering courses in Jharkhand.',
    eligibilityRules: {
      class: '12th',
      state: 'Jharkhand',
      category: 'OBC',
      incomeLimit: 1000000,
      minimumMarks: 70
    },
    documentsRequired: ['12th mark sheet', 'JEE score card', 'Domicile certificate', 'Category certificate'],
    deadline: new Date('2024-12-15'),
    sponsoringOrg: 'Technical Education Department',
    link: 'https://scholarships.gov.in/',
    isActive: true
  }
];

// Initialize immediately
sampleScholarships.forEach(scholarship => {
  globalScholarshipStore.set(scholarship._id, scholarship);
});

console.log('🎓 Global scholarship store initialized with', globalScholarshipStore.size, 'scholarships');

// Export for use in API
module.exports = { globalScholarshipStore };
