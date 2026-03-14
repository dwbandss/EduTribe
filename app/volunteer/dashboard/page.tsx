'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, MapPin, Clock, Star, Check, X, MessageCircle, Plus } from 'lucide-react';

interface SchoolMatch {
  requestId: string;
  schoolName: string;
  subject: string;
  gradeLevel: string;
  requiredSkills: string[];
  description: string;
  urgency: 'low' | 'medium' | 'high';
  duration?: string;
  schedule?: string[];
  score: number;
  explanation: string;
  status: 'pending' | 'invited' | 'accepted' | 'declined';
  createdAt: string;
}

interface VolunteerProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  languages: string[];
  availability: Array<{
    day: string;
    timeSlots: string[];
  }>;
  rating: number;
  bio: string;
  education: string;
  experience: string;
  profileVisibility: 'public' | 'private';
  isActive: boolean;
}

export default function VolunteerDashboard() {
  const [matches, setMatches] = useState<SchoolMatch[]>([]);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    languages: '',
    bio: '',
    education: '',
    experience: '',
    profileVisibility: 'public',
    isActive: true
  });

  // Load volunteer profile and matches
  useEffect(() => {
    loadProfile();
    loadMatches();
  }, []);

  const loadProfile = async () => {
    try {
      // This would fetch from /api/volunteer/profile
      const mockProfile: VolunteerProfile = {
        userId: 'VOL-001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        skills: ['Mathematics', 'Physics', 'Chemistry'],
        languages: ['English', 'Hindi', 'Odia'],
        availability: [
          { day: 'Monday', timeSlots: ['9:00-12:00', '14:00-17:00'] },
          { day: 'Wednesday', timeSlots: ['9:00-12:00'] }
        ],
        rating: 4.5,
        bio: 'Passionate educator with 5 years of teaching experience',
        education: 'M.Sc. Physics',
        experience: '5 years teaching high school science',
        profileVisibility: 'public',
        isActive: true
      };
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        skills: mockProfile.skills.join(', '),
        languages: mockProfile.languages.join(', '),
        bio: mockProfile.bio,
        education: mockProfile.education,
        experience: mockProfile.experience,
        profileVisibility: mockProfile.profileVisibility,
        isActive: mockProfile.isActive
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMatches = async () => {
    try {
      // This would fetch from /api/volunteer/matches
      const mockMatches: SchoolMatch[] = [
        {
          requestId: 'REQ-001',
          schoolName: 'Tribal School Koraput',
          subject: 'Science',
          gradeLevel: '8th Grade',
          requiredSkills: ['Physics', 'Chemistry'],
          description: 'Need volunteer to teach science concepts to tribal students',
          urgency: 'high',
          duration: '3 hours/week',
          schedule: ['Monday', 'Wednesday'],
          score: 92,
          explanation: 'Your expertise in Physics and Chemistry matches perfectly with the school\'s requirements. Your high rating and experience make you an ideal candidate.',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          requestId: 'REQ-002',
          schoolName: 'Rural Primary School',
          subject: 'Mathematics',
          gradeLevel: '5th Grade',
          requiredSkills: ['Mathematics'],
          description: 'Looking for volunteer to help with basic mathematics',
          urgency: 'medium',
          duration: '2 hours/week',
          schedule: ['Tuesday', 'Thursday'],
          score: 78,
          explanation: 'Your mathematics skills and teaching experience align well with this position.',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profilePayload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()),
        languages: formData.languages.split(',').map(s => s.trim()),
        profileVisibility: formData.profileVisibility as 'public' | 'private'
      };

      // This would update via /api/volunteer/profile
      console.log('Updating profile:', profilePayload);
      
      const updatedProfile: VolunteerProfile = {
        userId: profile?.userId || 'VOL-001',
        name: profilePayload.name,
        email: profilePayload.email,
        phone: profilePayload.phone,
        skills: profilePayload.skills,
        languages: profilePayload.languages,
        bio: profilePayload.bio,
        education: profilePayload.education,
        experience: profilePayload.experience,
        profileVisibility: profilePayload.profileVisibility,
        isActive: profilePayload.isActive,
        availability: profile?.availability || [
          { day: 'Monday', timeSlots: ['9:00-12:00'] }
        ],
        rating: profile?.rating || 0
      };
      
      setProfile(updatedProfile);
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToMatch = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      // This would update via /api/volunteer/matches/{requestId}
      setMatches(matches.map(match => 
        match.requestId === requestId 
          ? { ...match, status: action === 'accept' ? 'accepted' : 'declined' }
          : match
      ));
    } catch (error) {
      console.error('Error responding to match:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'invited': return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <Button onClick={() => setShowProfileForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-600">{profile.phone}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{profile.rating}/5</span>
                </div>
                <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm">{profile.bio}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Form */}
      {showProfileForm && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
              <Input
                placeholder="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                required
              />
              <Input
                placeholder="Languages (comma-separated)"
                value={formData.languages}
                onChange={(e) => setFormData({...formData, languages: e.target.value})}
                required
              />
              <Textarea
                placeholder="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                required
              />
              <Input
                placeholder="Education"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
              />
              <Textarea
                placeholder="Experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              />
              <Select value={formData.profileVisibility} onValueChange={(value: any) => setFormData({...formData, profileVisibility: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Profile visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowProfileForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Suggested Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-gray-500">No school matches found yet.</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.requestId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <School className="w-4 h-4" />
                        {match.schoolName}
                      </h3>
                      <p className="text-sm text-gray-600">{match.subject} - {match.gradeLevel}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(match.urgency)}>
                        {match.urgency}
                      </Badge>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                      <div className={`px-2 py-1 rounded text-white text-xs ${getScoreColor(match.score)}`}>
                        {match.score}% Match
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{match.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {match.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {match.duration} • {match.schedule?.join(', ')}
                  </p>
                  <p className="text-sm mb-3">{match.explanation}</p>
                  
                  {match.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respondToMatch(match.requestId, 'accept')}>
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => respondToMatch(match.requestId, 'decline')}>
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message School
                      </Button>
                    </div>
                  )}
                  
                  {match.status === 'accepted' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact School
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
