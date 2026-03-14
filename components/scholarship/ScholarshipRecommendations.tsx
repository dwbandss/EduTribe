'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ExternalLink, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface Scholarship {
  scholarshipId: string;
  name: string;
  score: number;
  explanation: string;
  requiredDocs: string[];
  link: string;
  deadline: string;
  sponsoringOrg?: string;
  source?: {
    name: string;
    link: string;
    type: string;
  };
}

interface ScholarshipRecommendationsProps {
  studentProfile: {
    class: string;
    state: string;
    category?: string;
    income?: number;
    marks?: number;
  };
}

export default function ScholarshipRecommendations({ studentProfile }: ScholarshipRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if profile is complete enough for personalized recommendations
  const isProfileComplete = () => {
    return !!(studentProfile.class && studentProfile.state);
  };

  const getProfileCompletenessWarning = () => {
    const missingFields = [];
    if (!studentProfile.class) missingFields.push('class');
    if (!studentProfile.state) missingFields.push('state');
    if (!studentProfile.category) missingFields.push('category');
    
    return missingFields.length > 0 ? (
      <div className="bg-yellow-50 border border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        <div>
          <h4 className="font-semibold mb-2">Complete Your Profile for Better Recommendations</h4>
          <p className="text-sm">Add your <strong>{missingFields.join(', ')}</strong> to get personalized scholarship recommendations.</p>
          <p className="text-sm mt-2">Go to the <strong>Profile</strong> tab to update your information.</p>
        </div>
      </div>
    ) : null;
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/scholarships/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentProfile }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.data);
        } else {
          setError('Failed to get recommendations');
        }
      } else {
        setError('Server error');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (): Scholarship[] => {
    if (!studentProfile.class || !studentProfile.state) {
      return [];
    }

    const baseScholarships = [
      {
        scholarshipId: 'scholarship-1',
        name: 'National Merit Scholarship',
        score: 85,
        explanation: `Based on your ${studentProfile.class} studies in ${studentProfile.state}, you qualify for merit-based scholarships.`,
        requiredDocs: ['Mark sheets', 'Income certificate', 'Residence proof'],
        link: '#',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        scholarshipId: 'scholarship-2',
        name: 'State Scholarship for ${studentProfile.category} Students',
        score: 90,
        explanation: `${studentProfile.state} government scholarship specifically for ${studentProfile.category} category students in ${studentProfile.class}.`,
        requiredDocs: ['Domicile certificate', 'Category certificate', 'Academic records'],
        link: '#',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        scholarshipId: 'scholarship-3',
        name: 'Central Sector Scholarship',
        score: 75,
        explanation: 'All-India scholarship scheme for meritorious students based on ${studentProfile.class} performance.',
        requiredDocs: ['Aadhaar card', 'Bank account', 'Photograph'],
        link: '#',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return baseScholarships;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUrgencyColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 7) return 'text-red-600';
    if (daysUntilDeadline <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Profile Completeness Warning */}
      {getProfileCompletenessWarning()}
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <BookOpen className="w-8 h-8 inline-block mr-2" />
          Scholarship Recommendations
        </h2>
        <p className="text-gray-600 mb-4">
          Personalized scholarship suggestions based on your profile
        </p>
      </div>
      
      {/* Get Recommendations Button */}
      <div className="text-center mb-6">
        <Button 
          onClick={getRecommendations}
          disabled={loading || !isProfileComplete()}
          className="px-6 py-3"
        >
          {loading ? 'Getting Recommendations...' : 
           !isProfileComplete() ? 'Complete Profile First' : 'Get My Recommendations'}
        </Button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((scholarship) => (
            <Card key={scholarship.scholarshipId} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                  <Badge className={`${getScoreColor(scholarship.score)} text-white`}>
                    {scholarship.score}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-gray-600 mb-3">
                  {scholarship.explanation}
                </CardDescription>
                
                {/* Required Documents */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Required Documents:</h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.requiredDocs.map((doc, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className={getUrgencyColor(scholarship.deadline)}>
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Source Information */}
                {scholarship.source?.name && (
                  <div className="bg-blue-50 border border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Source: {scholarship.source.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(scholarship.source?.link || '#', '_blank')}
                        className="text-xs"
                      >
                        Visit Source
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(scholarship.link, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* No Recommendations - Only show if truly no recommendations and profile is complete */}
      {!loading && recommendations.length === 0 && isProfileComplete() && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
            <p>Our scholarship database is being updated. Please check back later for personalized recommendations.</p>
          </div>
        </div>
      )}
      
      {/* Profile Incomplete - Show warning message */}
      {!loading && !isProfileComplete() && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile First</h3>
            <p>Please complete your profile information to get personalized scholarship recommendations.</p>
          </div>
        </div>
      )}
    </div>
  );
}
