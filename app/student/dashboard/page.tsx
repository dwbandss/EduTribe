'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, FileText, Users, Bot, LogOut, Home, User, Bell, Search } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import CompactAIAssistant from '@/components/ui/CompactAIAssistant';

interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
}

const TabButton: React.FC<{ tab: { label: string; icon: React.ReactNode }; isActive: boolean; onClick: () => void }> = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-muted-foreground'
    }`}
  >
    {tab.icon}
    <span>{tab.label}</span>
  </button>
);

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentProfile>({
    uid: 'EDU-STU-123456',
    name: 'Loading...',
    email: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const getUserFromAuth = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.success) {
            setStudent(userData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setStudent({
          uid: 'EDU-STU-123456',
          name: 'Demo Student',
          email: 'demo@edutribe.com',
          role: 'student'
        });
      } finally {
        setLoading(false);
      }
    };

    getUserFromAuth();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  };

  const tabs = [
    { label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { label: 'Admission', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Scholarships', icon: <FileText className="w-4 h-4" /> },
    { label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <div className="text-sm font-medium">EduTribe</div>
                <div className="text-sm text-muted-foreground">Student Dashboard</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/school-finder')}>
                <Search className="w-4 h-4 mr-2" />
                School Finder
              </Button>
              <div className="text-right">
                <div className="text-sm font-medium">{student.name}</div>
                <div className="text-xs text-muted-foreground">UID: {student.uid}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.label}
                      tab={tab}
                      isActive={activeTab === tab.label.toLowerCase()}
                      onClick={() => setActiveTab(tab.label.toLowerCase())}
                    />
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Back Button */}
              <BackButton />

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome Back, {student.name}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <h3 className="font-semibold">Quick Stats</h3>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <h3 className="font-semibold">Active Schemes</h3>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <h3 className="font-semibold">Applications</h3>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'admission' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">AI Admission Assistant</h3>
                      <p className="text-muted-foreground">Get help with school admissions and applications</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <CompactAIAssistant />
    </div>
  );
}
