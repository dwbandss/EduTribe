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
          disabled={loading}
          className="px-6 py-3"
        >
          {loading ? 'Getting Recommendations...' : 'Get My Recommendations'}
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

      {/* No Recommendations */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p>Complete your profile and click "Get My Recommendations" to see personalized scholarships.</p>
          </div>
        </div>
      )}
    </div>
  );
}
