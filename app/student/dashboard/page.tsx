'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Home, Award, LogOut, Brain, GraduationCap, Building, Users, Star, RefreshCw } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import ScholarshipRecommendations from '@/components/scholarship/ScholarshipRecommendations';
import ProfileEditor from '@/components/student/ProfileEditor';
import SiteGuideBot from '@/components/ui/SiteGuideBot';
import AdmissionAssistant from '@/components/ai/AdmissionAssistant';
import ProfileCompletionPopup from '@/components/ui/ProfileCompletionPopup';
import AITutor from '@/components/ai/AITutor';

interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  state?: string;
  category?: string;
  studying?: string;
  currentInstitution?: string;
  targetCourses?: string;
  income?: number;
  marks?: number;
  phone?: string;
  schoolData?: any;
  [key: string]: any;
}

interface VolunteerMentor {
  uid: string;
  name: string;
  skills: string[];
  subjects: string[];
  availability: Array<{
    day: string;
    timeSlots: string[];
  }>;
  ratingAverage: number;
  ngo?: {
    ngoUid: string;
    ngoName: string;
    verifiedStatus: string;
  };
}

interface StudentDashboardProps {
  student?: StudentProfile | null;
  onUpdate?: (updatedProfile?: StudentProfile | null) => void;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [volunteerMentor, setVolunteerMentor] = useState<VolunteerMentor | null>(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render

  // Check if profile is complete
  const isProfileComplete = () => {
    return !!(student?.class && student?.state && student?.category);
  };

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        console.log('Profile data received:', data);

        if (!data.success) {
          router.push('/login');
          return;
        }

        console.log('Setting student data:', data.data);
        setStudent(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fetchVolunteerMentor = async (studentUid: string) => {
    try {
      const response = await fetch(`/api/student/volunteer?studentUid=${studentUid}`);
      const data = await response.json();
      if (data.success) {
        setVolunteerMentor(data.data);
      }
    } catch (error) {
      console.error('Error fetching volunteer mentor:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const TabButton: React.FC<{ tab: { label: string; icon: React.ReactNode }; isActive: boolean; onClick: () => void; disabled?: boolean }> = ({ tab, isActive, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {typeof tab.icon === 'string' ? tab.icon : tab.icon}
      <span className="ml-2">{tab.label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check verification status and disable tabs if not verified
  const isVerified = student?.verified;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BackButton />
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/school-finder')}>
                <Search className="w-4 h-4 mr-2" />
                School Finder
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <div className="text-right">
                <div className="text-sm font-medium">{student?.name || 'Student'}</div>
                <div className="text-xs text-muted-foreground">{student?.email || 'email@example.com'}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {student?.state || 'State: Not set'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {student?.category || 'Category: Not set'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* School Info Card - Moved to top */}
      {student?.schoolData && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Your School: {student.schoolData.schoolName}</h3>
                  <p className="text-sm text-blue-700">UID: {student.schoolData.schoolUid} | District: {student.schoolData.district} | State: {student.schoolData.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <TabButton
                    tab={{ label: 'Overview', icon: <Home /> }}
                    isActive={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                  />
                  <TabButton
                    tab={{ label: 'Profile', icon: <User /> }}
                    isActive={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                  />
                  <TabButton
                    tab={{ label: 'AI Admission', icon: <GraduationCap /> }}
                    isActive={activeTab === 'ai admission'}
                    onClick={() => setActiveTab('ai admission')}
                  />
                  <TabButton
                    tab={{ label: 'Volunteer Tutor', icon: <Users /> }}
                    isActive={activeTab === 'volunteer tutor'}
                    onClick={() => setActiveTab('volunteer tutor')}
                    disabled={!isVerified}
                  />
                  <TabButton
                    tab={{ label: 'AI Tutor', icon: <Brain /> }}
                    isActive={activeTab === 'ai tutor'}
                    onClick={() => setActiveTab('ai tutor')}
                    disabled={!isVerified}
                  />
                  <TabButton
                    tab={{ label: 'Scholarships', icon: <Award /> }}
                    isActive={activeTab === 'scholarships'}
                    onClick={() => setActiveTab('scholarships')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {!isVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-yellow-600 mr-2" />
                  <div>
                    <p className="font-medium text-yellow-800">Waiting for School Verification</p>
                    <p className="text-sm text-yellow-600">Your school needs to verify your account before you can access these features.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back, {student?.name || 'Student'}!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your student dashboard is ready! Explore your profile, find volunteer mentors, 
                      and access AI-powered learning tools.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ProfileEditor 
                key={refreshKey}
                student={student || undefined}
                onUpdate={(updatedProfile) => {
                  if (updatedProfile) {
                    console.log('Profile updated in dashboard:', updatedProfile);
                    // Update the student state immediately with complete data
                    setStudent(updatedProfile);
                    console.log('Student state updated with:', updatedProfile);
                  }
                }}
              />
            )}

            {/* AI Admission Tab */}
            {activeTab === 'ai admission' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    AI Admission Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AdmissionAssistant 
                    studentProfile={{
                      class: student?.class || '12th',
                      state: student?.state || 'Not specified',
                      category: student?.category || 'General',
                      uid: student?.uid || ''
                    } as any}
                  />
                </CardContent>
              </Card>
            )}

            {/* Volunteer Tutor Tab */}
            {activeTab === 'volunteer tutor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Volunteer Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {volunteerMentor ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-lg">{volunteerMentor.name}</p>
                            <p className="text-sm text-gray-500">UID: {volunteerMentor.uid}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {volunteerMentor.skills?.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {volunteerMentor.subjects?.map((subject, index) => (
                                <Badge key={index} variant="outline">{subject}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Rating</div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 font-medium">{volunteerMentor.ratingAverage || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Available Subjects</h4>
                        <p className="text-blue-700">Your volunteer tutor can help you with: {volunteerMentor.subjects?.join(', ') || 'Various subjects'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No volunteer tutor assigned yet.</p>
                      <p className="text-sm text-gray-400">Your school will assign a volunteer tutor to help you with your studies.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Tutor Tab */}
            {activeTab === 'ai tutor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AITutor />
                </CardContent>
              </Card>
            )}

            {/* Scholarships Tab */}
            {activeTab === 'scholarships' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Scholarship Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScholarshipRecommendations 
                    studentProfile={{
                      class: student?.class || '12th',
                      state: student?.state || 'Not specified',
                      category: student?.category || 'General',
                      income: student?.income,
                      marks: student?.marks
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Site Guide Bot */}
      <SiteGuideBot />
      
      {/* Profile Completion Popup */}
      <ProfileCompletionPopup 
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        onCompleteProfile={() => setShowProfilePopup(false)}
      />
    </div>
  );
}
