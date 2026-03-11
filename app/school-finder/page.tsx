import SmartSchoolFinder from '@/components/school/SmartSchoolFinder';

export default function SchoolFinderPage() {
  return (
    <div className="min-h-screen">
      <SmartSchoolFinder />
    </div>
  );
}

export const metadata = {
  title: 'Smart Tribal School Finder - EduTribe',
  description: 'Find tribal schools using natural language search with AI-powered filters and map visualization.',
  keywords: ['school finder', 'tribal schools', 'education search', 'natural language search'],
};
