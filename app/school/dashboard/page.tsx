'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Clock, Star, Send, Plus, LogOut, School, Phone, Mail, Edit2, Save } from 'lucide-react';

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
  schoolUid: string;
  schoolName: string;
  district: string;
  locality: string;
  subjectsRequired: string[];
  classesRequired: string[];
  volunteersNeeded: number;
  status: 'open' | 'pending' | 'filled';
  createdAt: string;
}

interface Student {
  uid: string;
  name: string;
  email: string;
  class?: string;
  verified: boolean;
}

interface SchoolProfile {
  uid: string;
  schoolName: string;
  schoolCode: string;
  district: string;
  state: string;
  phone: string;
  email: string;
  address: string;
  facilities: {
    hostel: boolean;
    sports: boolean;
    scienceLab: boolean;
    digitalClassroom: boolean;
    library: boolean;
    computerLab: boolean;
  };
  streamsOffered: string[];
  verificationStatus: string;
}

export default function SchoolDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SchoolRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'requests' | 'profile'>('students');
  const [editingProfile, setEditingProfile] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profileForm, setProfileForm] = useState<SchoolProfile>({
    uid: '',
    schoolName: '',
    schoolCode: '',
    district: '',
    state: '',
    phone: '',
    email: '',
    address: '',
    facilities: {
      hostel: false,
      sports: false,
      scienceLab: false,
      digitalClassroom: false,
      library: false,
      computerLab: false
    },
    streamsOffered: [],
    verificationStatus: 'pending'
  });
  const [formData, setFormData] = useState({
    schoolName: '',
    subjectsRequired: '',
    classesRequired: '',
    volunteersNeeded: 1,
    description: ''
  });

  // Load existing requests and profile
useEffect(() => {
  loadRequests();
  loadSchoolProfile();
}, []);

  // Load students when school profile is loaded
  useEffect(() => {
    if (schoolProfile && activeTab === 'students') {
      loadStudents();
    }
  }, [schoolProfile, activeTab]);

  const loadStudents = async () => {
    try {
      console.log('Loading students for school:', schoolProfile?.uid);
      const response = await fetch('/api/students/by-school?schoolUid=' + schoolProfile?.uid);
      console.log('Students API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Students API response:', data);
        if (data.success) {
          console.log('Setting students:', data.data);
          setStudents(data.data);
        } else {
          console.error('Students API error:', data.message);
        }
      } else {
        console.error('Students API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleVerifyStudent = async (studentUid: string) => {
    try {
      console.log('Verifying student:', studentUid);
      const response = await fetch('/api/student/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentUid }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Verification response:', data);
        if (data.success) {
          // Reload students to update the list
          console.log('Reloading students...');
          await loadStudents();
          // Force re-render
          setRefreshKey(prev => prev + 1);
          alert('Student verified successfully!');
        } else {
          alert('Error verifying student: ' + data.message);
        }
      } else {
        alert('Error verifying student');
      }
    } catch (error) {
      console.error('Error verifying student:', error);
      alert('Error verifying student');
    }
  };

  const handleUnverifyStudent = async (studentUid: string) => {
    try {
      const response = await fetch('/api/student/unverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentUid }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reload students to update the list
          loadStudents();
          alert('Student unverified successfully!');
        } else {
          alert('Error unverifying student: ' + data.message);
        }
      } else {
        alert('Error unverifying student');
      }
    } catch (error) {
      console.error('Error unverifying student:', error);
      alert('Error unverifying student');
    }
  };

 const loadSchoolProfile = async () => {
    try {
      // Get current user from /api/auth/me first to get UID
      const authResponse = await fetch('/api/auth/me');
      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.success && authData.data) {
          const schoolUid = authData.data.uid;
          const response = await fetch('/api/profile?role=school&uid=' + schoolUid);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const profile = data.data;
              console.log('Setting school profile:', profile);
              setSchoolProfile({
                uid: profile.uid,
                schoolName: profile.schoolName,
                schoolCode: profile.uid,
                district: profile.district,
                state: profile.state,
                phone: profile.phone,
                email: profile.email,
                address: profile.address || "",
                facilities: profile.facilities || {
                  hostel: false,
                  sports: false,
                  scienceLab: false,
                  digitalClassroom: false,
                  library: false,
                  computerLab: false
                },
                streamsOffered: profile.subjectsNeeded || [],
                verificationStatus: profile.verificationStatus || "pending"
              });
              setProfileForm({
                uid: profile.uid,
                schoolName: profile.schoolName,
                schoolCode: profile.uid,
                district: profile.district,
                state: profile.state,
                phone: profile.phone,
                email: profile.email,
                address: profile.address || "",
                facilities: profile.facilities || {
                  hostel: false,
                  sports: false,
                  scienceLab: false,
                  digitalClassroom: false,
                  library: false,
                  computerLab: false
                },
                streamsOffered: profile.subjectsNeeded || [],
                verificationStatus: profile.verificationStatus || "pending"
              });
            } else {
              console.error('Profile API returned error:', data.message);
            }
          } else {
            console.error('Profile API request failed:', response.statusText);
          }
        } else {
          console.error('Auth API request failed:', authResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Error loading school profile:', error);
    }
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
      // This would update the school profile in the database
      setSchoolProfile(profileForm);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/volunteer-requests?schoolUid=' + schoolProfile?.uid);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRequests(data.data);
        }
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
  schoolUid: schoolProfile?.uid,
  subjectsRequired: formData.subjectsRequired.split(',').map(s => s.trim()),
  classesRequired: formData.classesRequired.split(',').map(s => s.trim()),
  volunteersNeeded: formData.volunteersNeeded,
  description: formData.description
};

      const response = await fetch('/api/volunteer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reset form
          setFormData({
            schoolName: '',
            subjectsRequired: '',
            classesRequired: '',
            volunteersNeeded: 1,
            description: ''
          });
          // Reload requests
          await loadRequests();
        }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <School className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">School Dashboard</h1>
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
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Volunteer Requests
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              School Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'students' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Students Under Your School</h2>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div key={`${student.uid}-${refreshKey}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">UID: {student.uid}</p>
                            <p className="text-sm text-gray-500">Class: {student.class || 'Not specified'}</p>
                            <p className="text-sm text-gray-500">Email: {student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={student.verified ? 'default' : 'secondary'}>
                            {student.verified ? 'Verified' : 'Pending'}
                          </Badge>
                          {student.verified ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnverifyStudent(student.uid)}
                            >
                              Unverify
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyStudent(student.uid)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No students registered under your school yet.</p>
                      <p className="text-sm text-gray-400">Students will appear here once they register with your school UID.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="space-y-6">
            {/* Create Request Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Volunteer Requests</h2>
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
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
                        placeholder="Subjects Required (comma-separated)"
                        value={formData.subjectsRequired}
                        onChange={(e) => setFormData({...formData, subjectsRequired: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Classes Required (comma-separated)"
                        value={formData.classesRequired}
                        onChange={(e) => setFormData({...formData, classesRequired: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Number of Volunteers Needed"
                        type="number"
                        value={formData.volunteersNeeded}
                        onChange={(e) => setFormData({...formData, volunteersNeeded: parseInt(e.target.value) || 1})}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Description of volunteer needs"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                      />
                    </div>
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
                            <h3 className="font-semibold">{request.subjectsRequired.join(', ')} - {request.classesRequired.join(', ')}</h3>
                            <p className="text-sm text-gray-600">{request.schoolName} ({request.locality})</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {request.status}
                            </Badge>
                            <Badge variant="outline">{request.volunteersNeeded} needed</Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">Looking for volunteers for: {request.subjectsRequired.join(' and ')} in classes {request.classesRequired.join(', ')}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.subjectsRequired.map((skill, index) => (
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
                  <CardTitle>Volunteer Matches for {selectedRequest.subjectsRequired?.join(', ') || 'Request'}</CardTitle>
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
        ) : (
          /* Profile Section */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">School Profile</h2>
              <Button
                onClick={() => setEditingProfile(!editingProfile)}
                variant={editingProfile ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {editingProfile ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editingProfile ? 'Save Profile' : 'Edit Profile'}
              </Button>
            </div>

            {schoolProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* School Name - Read Only (collected during signup) */}
                    <div className="bg-gray-50 p-3 rounded">
                      <label className="text-sm font-medium text-gray-700">School Name</label>
                      <p className="text-gray-900 font-medium">{schoolProfile.schoolName}</p>
                      <p className="text-xs text-gray-500">Set during registration</p>
                    </div>
                    {/* School Code - Read Only (collected during signup) */}
                    <div className="bg-gray-50 p-3 rounded">
                      <label className="text-sm font-medium text-gray-700">School Code</label>
                      <p className="text-gray-900 font-medium">{schoolProfile.schoolCode}</p>
                      <p className="text-xs text-gray-500">Set during registration</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    {/* District - Read Only (collected during signup) */}
                    <div className="bg-gray-50 p-3 rounded">
                      <label className="text-sm font-medium text-gray-700">District</label>
                      <p className="text-gray-900 font-medium">{schoolProfile.district}</p>
                      <p className="text-xs text-gray-500">Set during registration</p>
                    </div>
                    {/* State - Read Only (collected during signup) */}
                    <div className="bg-gray-50 p-3 rounded">
                      <label className="text-sm font-medium text-gray-700">State</label>
                      <p className="text-gray-900 font-medium">{schoolProfile.state}</p>
                      <p className="text-xs text-gray-500">Set during registration</p>
                    </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      {editingProfile ? (
                        <Textarea
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{schoolProfile.address}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{schoolProfile.phone}</p>
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
                        <p className="text-gray-900">{schoolProfile.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Verification Status</label>
                     <Badge
  className={
    schoolProfile?.verificationStatus === "verified"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800"
  }
>
  {schoolProfile?.verificationStatus === "verified"
    ? "Verified"
    : "Pending"}
</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Facilities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Facilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(schoolProfile.facilities).map(([facility, available]) => (
                        <div key={facility} className="flex items-center space-x-2">
                          {editingProfile ? (
                            <input
                              type="checkbox"
                              checked={profileForm.facilities[facility as keyof typeof profileForm.facilities]}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                facilities: {
                                  ...profileForm.facilities,
                                  [facility]: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded ${available ? 'bg-green-500' : 'bg-gray-300'}`} />
                          )}
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {facility.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Streams Offered */}
                <Card>
                  <CardHeader>
                    <CardTitle>Streams Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <Input
                        placeholder="Enter streams (comma-separated)"
                        value={profileForm.streamsOffered.join(', ')}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          streamsOffered: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {schoolProfile.streamsOffered.map((stream, index) => (
                          <Badge key={index} variant="secondary">
                            {stream}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Loading profile data...</p>
                  <p className="text-sm text-gray-400 mt-2">If this persists, please try logging out and logging back in.</p>
                </CardContent>
              </Card>
            )}

            {editingProfile && (
              <div className="flex gap-2">
                <Button onClick={updateProfile} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingProfile(false);
                  setProfileForm(schoolProfile!);
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
