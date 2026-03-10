"use client";

import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, FileText, Users, Bot, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpandableAdmissionChat } from '@/components/ai/ExpandableAdmissionChat';

interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get student info from localStorage or API
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    
    if (token && uid) {
      // In a real app, you'd fetch student profile from API
      setStudent({
        uid,
        name: 'Student Name', // This would come from API
        email: 'student@example.com', // This would come from API
        role: 'student'
      });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl">EduTribe</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Student Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {student.name}!</h1>
          <p className="text-muted-foreground">
            Get personalized help with your educational journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admission Queries</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">Per hour limit</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Schools</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50+</div>
              <p className="text-xs text-muted-foreground">In your region</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schemes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20+</div>
              <p className="text-xs text-muted-foreground">For your category</p>
            </CardContent>
          </Card>
        </div>

        {/* Expandable Chat Component */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-primary" />
              <CardTitle className="text-xl">AI Admission Assistant</CardTitle>
            </div>
            <CardDescription>
              Click the chat bubble in the bottom-right corner to get instant help with admissions, scholarships, and educational schemes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ExpandableAdmissionChat />
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• What documents are required for EMRS admission?</li>
                  <li>• How to apply for ST scholarship?</li>
                  <li>• Eligibility criteria for Navodaya schools</li>
                  <li>• Best schools for tribal students</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Links</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• National Scholarship Portal</li>
                  <li>• Tribal Welfare Department</li>
                  <li>• School Education Portal</li>
                  <li>• Admission Helpline</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
