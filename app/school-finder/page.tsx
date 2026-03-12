'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import SmartSchoolFinder from '@/components/school/SmartSchoolFinder';
import 'leaflet/dist/leaflet.css';

export default function SchoolFinderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/student/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <Home className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-sm font-medium">EduTribe</div>
                  <div className="text-sm text-muted-foreground">School Finder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* School Finder Component */}
      <SmartSchoolFinder />
    </div>
  );
}
