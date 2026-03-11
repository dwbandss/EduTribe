import { connectDB } from '../lib/mongodb';
import { School } from '../models/refactored/SchoolSimple';
import { Scheme } from '../models/refactored/Scheme';

async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing data
    await School.deleteMany({});
    await Scheme.deleteMany({});
    
    // Sample schools data
    const schools = [
      {
        schoolName: "Eklavya Model Residential School (EMRS) - Koraput",
        type: "government",
        board: "CBSE",
        state: "Odisha",
        district: "Koraput",
        classesOffered: ["6th", "7th", "8th", "9th", "10th", "11th", "12th"],
        admissionProcess: "Entrance examination followed by interview. Selection based on merit and tribal status.",
        requiredDocuments: [
          "Birth certificate",
          "Residential proof",
          "Tribal certificate",
          "Previous school marksheets",
          "Aadhar card",
          "Income certificate",
          "Passport size photographs (4)"
        ],
        eligibilityCriteria: "Must belong to ST category with annual family income less than 2.5 lakhs. Age between 10-18 years.",
        contactInfo: {
          phone: "06852-234567",
          email: "emrs.koraput@odisha.gov.in",
          address: "EMRS Campus, Koraput, Odisha - 764020"
        },
        website: "https://emrs-koraput.odisha.gov.in"
      },
      {
        schoolName: "Jawahar Navodaya Vidyalaya - Rayagada",
        type: "government",
        board: "CBSE",
        state: "Odisha",
        district: "Rayagada",
        classesOffered: ["6th", "7th", "8th", "9th", "10th", "11th", "12th"],
        admissionProcess: "JNVST entrance examination in February/March. Selected based on merit and rural background.",
        requiredDocuments: [
          "Birth certificate",
          "Residential proof (rural area)",
          "Previous school marksheets",
          "Aadhar card",
          "Caste certificate (if applicable)",
          "Passport size photographs (2)"
        ],
        eligibilityCriteria: "Must be from rural area, studying in class 5 for class 6 admission. 75% seats for rural, 25% for urban.",
        contactInfo: {
          phone: "06856-234123",
          email: "jnv.rayagada@navodaya.gov.in",
          address: "JNV Campus, Rayagada, Odisha - 765001"
        },
        website: "https://navodaya.gov.in"
      },
      {
        name: "Kalinga Institute of Social Sciences (KISS) - Bhubaneswar",
        type: "private",
        board: "CBSE",
        state: "Odisha",
        district: "Khordha",
        classesOffered: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
        admissionProcess: "Application form verification followed by written test and interview. Priority to tribal students.",
        requiredDocuments: [
          "Birth certificate",
          "Tribal certificate",
          "Income certificate",
          "Previous school records",
          "Aadhar card",
          "Passport size photographs",
          "Medical fitness certificate"
        ],
        eligibilityCriteria: "Tribal students with poor economic background. Free education with hostel facilities.",
        contactInfo: {
          phone: "0674-2742087",
          email: "admission@kiss.ac.in",
          address: "KISS Campus, Patia, Bhubaneswar, Odisha - 751024"
        },
        website: "https://kiss.ac.in"
      }
    ];

    // Sample schemes data
    const schemes = [
      {
        name: "Eklavya Model Residential School (EMRS) Scholarship",
        type: "scholarship",
        category: "st",
        state: "Odisha",
        class: "6th-12th",
        description: "Complete free education including tuition, hostel, books, and uniform for ST students in EMRS.",
        eligibility: "ST students with annual family income less than 2.5 lakhs. Must clear EMRS entrance exam.",
        benefits: "Free education, accommodation, food, books, uniforms, and medical facilities. Monthly stipend for selected students.",
        applicationProcess: "Apply during EMRS admission window. Submit income and tribal certificates with application form.",
        requiredDocuments: [
          "Tribal certificate",
          "Income certificate",
          "Birth certificate",
          "Residential proof",
          "Previous academic records"
        ],
        deadline: new Date("2024-05-31"),
        officialWebsite: "https://tribal.nic.in",
        contactInfo: {
          email: "emrs-scholarship@tribal.gov.in",
          phone: "011-23382456"
        }
      },
      {
        name: "National Means Cum Merit Scholarship (NMMS)",
        type: "scholarship",
        category: "general",
        state: "Odisha",
        class: "9th",
        description: "Scholarship for economically weaker students to continue their education at secondary level.",
        eligibility: "Students in class 9 with 55% marks in class 8 and annual family income less than 1.5 lakhs.",
        benefits: "Rs. 12,000 per annum (Rs. 1000 per month) for 4 years.",
        applicationProcess: "Apply through State Nodal Officer website. Appear for NMMS examination.",
        requiredDocuments: [
          "Income certificate",
          "Caste certificate (if applicable)",
          "Class 8 marksheet",
          "Bank account details",
          "Residential proof"
        ],
        deadline: new Date("2024-10-15"),
        officialWebsite: "https://nmms.samagra.gov.in",
        contactInfo: {
          email: "nmms@education.gov.in"
        }
      },
      {
        name: "Post Matric Scholarship for ST Students",
        type: "scholarship",
        category: "st",
        state: "Odisha",
        class: "11th-12th",
        description: "Financial assistance for ST students pursuing post-matriculation studies.",
        eligibility: "ST students with family income less than 2.5 lakhs per annum. Must have minimum attendance.",
        benefits: "Complete reimbursement of tuition fees, maintenance allowance, and other allowances.",
        applicationProcess: "Apply online through National Scholarship Portal. Submit required documents for verification.",
        requiredDocuments: [
          "Tribal certificate",
          "Income certificate",
          "Previous year marksheet",
          "Bank account details",
          "Aadhar card",
          "College admission proof"
        ],
        deadline: new Date("2024-12-31"),
        officialWebsite: "https://scholarships.gov.in",
        contactInfo: {
          email: "st-scholarship@odisha.gov.in",
          phone: "0674-2530011"
        }
      },
      {
        name: "Odisha Tribal Development Agency (OTDA) Hostel Facilities",
        type: "financial_aid",
        category: "st",
        state: "Odisha",
        class: "6th-12th",
        description: "Free hostel facilities for tribal students studying in government schools.",
        eligibility: "ST students studying in government schools outside their native district.",
        benefits: "Free accommodation, food, and study materials. Monthly stipend for personal expenses.",
        applicationProcess: "Apply through OTDA office. Submit school admission proof and tribal certificate.",
        requiredDocuments: [
          "Tribal certificate",
          "School admission proof",
          "Residential proof",
          "Income certificate",
          "Parent's consent letter"
        ],
        officialWebsite: "https://otda.odisha.gov.in",
        contactInfo: {
          email: "info@otda.odisha.gov.in",
          phone: "0674-2392135"
        }
      }
    ];

    // Insert sample data
    await School.insertMany(schools);
    await Scheme.insertMany(schemes);

    console.log(`✅ Seeded ${schools.length} schools and ${schemes.length} schemes`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
