'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Clock, Star, Send, Plus } from 'lucide-react';

interface VolunteerMatch {
  volunteerId: string;
  name: string;
  skills: string[];
  languages: string[];
  rating: number;
  score: number;
  explanation: string;
  matchId: string;
}

interface SchoolRequest {
  requestId: string;
  schoolName: string;
  subject: string;
  gradeLevel: string;
  requiredSkills: string[];
  description: string;
  urgency: 'low' | 'medium' | 'high';
  duration?: string;
  schedule?: string[];
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
}

export default function SchoolDashboard() {
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SchoolRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    subject: '',
    gradeLevel: '',
    requiredSkills: '',
    description: '',
    urgency: 'medium',
    duration: '',
    schedule: ''
  });

  // Load existing requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const createRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestPayload = {
        schoolId: 'SCHOOL-001', // This should come from auth
        schoolName: formData.schoolName,
        location: { coordinates: [85.8234, 22.7956] }, // Default location (should be from school profile)
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
        description: formData.description,
        urgency: formData.urgency,
        duration: formData.duration || undefined,
        schedule: formData.schedule ? formData.schedule.split(',').map(s => s.trim()) : undefined
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          schoolName: '',
          subject: '',
          gradeLevel: '',
          requiredSkills: '',
          description: '',
          urgency: 'medium',
          duration: '',
          schedule: ''
        });
        loadRequests();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  const findVolunteers = async (requestId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/match/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.data || []);
      }
    } catch (error) {
      console.error('Error finding volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteVolunteer = async (volunteerId: string, matchId: string) => {
    try {
      // This would update the match status to 'invited'
      console.log('Inviting volunteer:', volunteerId);
      // Implementation would go here
    } catch (error) {
      console.error('Error inviting volunteer:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">School Dashboard</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Request
        </Button>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Volunteer Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="School Name"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                  required
                />
                <Input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Grade Level"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                  required
                />
                <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Required Skills (comma-separated)"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                required
              />
              <Textarea
                placeholder="Description of the volunteer need"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <Input
                placeholder="Duration (e.g., 2 hours/week)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
              <Input
                placeholder="Schedule (comma-separated, e.g., Monday, Wednesday)"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Your Volunteer Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests created yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.requestId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{request.subject} - {request.gradeLevel}</h3>
                      <p className="text-sm text-gray-600">{request.schoolName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{request.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {request.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedRequest(request);
                      findVolunteers(request.requestId);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Volunteers
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volunteer Matches */}
      {selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Matches for {selectedRequest.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Finding volunteers...</p>
            ) : matches.length === 0 ? (
              <p>No volunteers found matching your requirements.</p>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.volunteerId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{match.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {match.rating}/5
                          <div className={`px-2 py-1 rounded text-white text-xs ${getScoreColor(match.score)}`}>
                            {match.score}% Match
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{match.explanation}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {match.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => inviteVolunteer(match.volunteerId, match.matchId)}>
                        <Send className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
