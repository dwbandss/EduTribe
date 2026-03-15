'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, MapPin, Clock, Star, Check, X, MessageCircle, Plus, LogOut, User, Edit2, Save, Phone, Mail, Calendar } from 'lucide-react';

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
  status: 'pending' | 'applied' | 'accepted' | 'declined';
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
  const [activeTab, setActiveTab] = useState<'requests' | 'profile'>('requests');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<VolunteerProfile>({
    userId: '',
    name: '',
    email: '',
    phone: '',
    skills: [],
    languages: [],
    availability: [],
    rating: 0,
    bio: '',
    education: '',
    experience: '',
    profileVisibility: 'public',
    isActive: true
  });

  // Load profile and matches
  useEffect(() => {
    checkProfileAndLoad();
  }, []);

  const checkProfileAndLoad = async () => {
    try {
      // Get volunteer UID from localStorage
      const uid = localStorage.getItem('uid');
      
      if (!uid) {
        window.location.href = '/login';
        return;
      }
      
      // Check if profile is complete
      const checkResponse = await fetch(`/api/volunteer/profile-completion?volunteerUid=${uid}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success && !checkData.data.profileCompleted) {
        // Redirect to profile completion page
        window.location.href = '/volunteer/complete-profile';
        return;
      }
      
      // Profile is complete, load data
      loadProfile(uid);
      loadMatches(uid);
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const loadProfile = async (uid: string) => {
    try {
      // Fetch real profile from API
      const response = await fetch(`/api/profile?uid=${uid}&role=volunteer`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const profile = data.data;
          setProfile({
            userId: profile.uid,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            skills: profile.skills || [],
            languages: [], // Not in new schema
            availability: profile.availability || [],
            rating: profile.ratingAverage || 0,
            bio: profile.bio || '',
            education: '', // Not in new schema
            experience: profile.experience || '',
            profileVisibility: 'public',
            isActive: profile.isActive !== false
          });
          setProfileForm({
            userId: profile.uid,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            skills: profile.skills || [],
            languages: [],
            availability: profile.availability || [],
            rating: profile.ratingAverage || 0,
            bio: profile.bio || '',
            education: '',
            experience: profile.experience || '',
            profileVisibility: 'public',
            isActive: profile.isActive !== false
          });
        } else {
          // Profile not found, initialize with empty values
          initializeEmptyProfile(uid);
        }
      } else {
        // API error, initialize with empty values
        initializeEmptyProfile(uid);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      initializeEmptyProfile(uid);
    }
  };

  const initializeEmptyProfile = (uid: string) => {
    const emptyProfile: VolunteerProfile = {
      userId: uid,
      name: '',
      email: '',
      phone: '',
      skills: [],
      languages: [],
      availability: [],
      rating: 0,
      bio: '',
      education: '',
      experience: '',
      profileVisibility: 'public',
      isActive: true
    };
    setProfile(emptyProfile);
    setProfileForm(emptyProfile);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async () => {
    try {
      // This would update the volunteer profile in the database
      setProfile(profileForm);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const loadMatches = async (volunteerUid: string) => {
    try {
      // Use new matching API
      const response = await fetch(`/api/volunteer/matching-requests?volunteerUid=${volunteerUid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the data to match the interface expected by the dashboard
          const transformedMatches = (data.data || []).map((request: any) => ({
            requestId: request.requestId,
            schoolName: request.schoolName || 'School',
            subject: request.subjectsRequired?.join(', ') || '',
            gradeLevel: request.classesRequired?.join(', ') || '',
            requiredSkills: request.subjectsRequired || [],
            description: `Looking for volunteers for ${request.subjectsRequired?.join(' and ') || ''} in ${request.classesRequired?.join(', ') || ''}`,
            urgency: 'medium',
            duration: 'As per school schedule',
            schedule: request.classesRequired || [],
            score: 85,
            explanation: `Your skills match the school's requirements.`,
            status: 'pending',
            createdAt: request.createdAt
          }));
          setMatches(transformedMatches);
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const applyToRequest = async (requestId: string) => {
    setLoading(true);
    try {
      // Call volunteer applications API
      const response = await fetch('/api/volunteer-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestId,
          volunteerId: 'VOL-001'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state to show applied status
          setMatches(matches.map(match => 
            match.requestId === requestId 
              ? { ...match, status: 'applied' as const }
              : match
          ));
        }
      }
    } catch (error) {
      console.error('Error applying to request:', error);
      // Fallback to local state update
      setMatches(matches.map(match => 
        match.requestId === requestId 
          ? { ...match, status: 'applied' as const }
          : match
      ));
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Volunteer Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              School Requests
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Volunteer Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'requests' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Matching School Requests</h2>
            
            {matches.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching requests</h3>
                    <p className="text-gray-500">No school requests match your profile yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.requestId}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{match.schoolName}</h3>
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
                      
                      <p className="text-gray-700 mb-4">{match.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {match.requiredSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      {match.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          {match.duration}
                        </div>
                      )}
                      
                      {match.schedule && match.schedule.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Calendar className="w-4 h-4" />
                          {match.schedule.join(', ')}
                        </div>
                      )}
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Match Explanation:</strong> {match.explanation}
                        </p>
                      </div>
                      
                      {match.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => applyToRequest(match.requestId)}
                            disabled={loading}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Apply
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Contact School
                          </Button>
                        </div>
                      )}
                      
                      {match.status === 'applied' && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Check className="w-4 h-4" />
                          <span className="font-medium">Application Submitted</span>
                        </div>
                      )}
                      
                      {match.status === 'accepted' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="font-medium">You have accepted this request</span>
                        </div>
                      )}
                      
                      {match.status === 'declined' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <X className="w-4 h-4" />
                          <span className="font-medium">You have declined this request</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Profile Section */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Volunteer Profile</h2>
              <Button
                onClick={() => setEditingProfile(!editingProfile)}
                variant={editingProfile ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {editingProfile ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editingProfile ? 'Save Profile' : 'Edit Profile'}
              </Button>
            </div>

            {profile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      {editingProfile ? (
                        <Input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                      {editingProfile ? (
                        <Select 
                          value={profileForm.profileVisibility} 
                          onValueChange={(value: 'public' | 'private') => setProfileForm({...profileForm, profileVisibility: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={profile.profileVisibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {profile.profileVisibility}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Skills</label>
                      {editingProfile ? (
                        <Input
                          placeholder="Enter skills (comma-separated)"
                          value={profileForm.skills.join(', ')}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Languages</label>
                      {editingProfile ? (
                        <Input
                          placeholder="Enter languages (comma-separated)"
                          value={profileForm.languages.join(', ')}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
                            <Badge key={index} variant="secondary">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Education</label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.education}
                          onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.education}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience</label>
                      {editingProfile ? (
                        <Textarea
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.experience}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <div className="space-y-4">
                        {profileForm.availability.map((avail, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Select
                              value={avail.day}
                              onValueChange={(value) => {
                                const newAvailability = [...profileForm.availability];
                                newAvailability[index].day = value;
                                setProfileForm({...profileForm, availability: newAvailability});
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Time slots (comma-separated)"
                              value={avail.timeSlots.join(', ')}
                              onChange={(e) => {
                                const newAvailability = [...profileForm.availability];
                                newAvailability[index].timeSlots = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setProfileForm({...profileForm, availability: newAvailability});
                              }}
                            />
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setProfileForm({
                            ...profileForm,
                            availability: [...profileForm.availability, { day: 'Monday', timeSlots: [] }]
                          })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Availability
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile.availability.map((avail, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline">{avail.day}</Badge>
                            <span className="text-sm text-gray-600">{avail.timeSlots.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <Textarea
                        placeholder="Tell us about yourself..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Rating */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-semibold">{profile.rating}</span>
                      <span className="text-gray-600">/ 5.0</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Based on completed volunteer assignments</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {editingProfile && (
              <div className="flex gap-2">
                <Button onClick={updateProfile} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingProfile(false);
                  setProfileForm(profile!);
                }}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
