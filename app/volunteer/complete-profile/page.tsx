'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)'];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [volunteerUid, setVolunteerUid] = useState<string>('');
  
  const [formData, setFormData] = useState({
    skills: [] as string[],
    preferredSubjects: [] as string[],
    preferredClasses: [] as string[],
    preferredDistrict: '',
    preferredLocality: '',
    experience: '',
    bio: '',
    availability: [] as Array<{ day: string; timeSlots: string[] }>,
    ngoUid: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');

  useEffect(() => {
    // Get volunteer UID from localStorage
    const uid = localStorage.getItem('uid');
    if (uid) {
      setVolunteerUid(uid);
      checkProfileCompletion(uid);
    } else {
      router.push('/login');
    }
  }, [router]);

  const checkProfileCompletion = async (uid: string) => {
    try {
      const response = await fetch(`/api/volunteer/profile-completion?volunteerUid=${uid}`);
      const data = await response.json();
      
      if (data.success && data.data.profileCompleted) {
        // Profile is complete, redirect to dashboard
        router.push('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleAddSubject = () => {
    if (newSubject && !formData.preferredSubjects.includes(newSubject)) {
      setFormData({ ...formData, preferredSubjects: [...formData.preferredSubjects, newSubject] });
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({ ...formData, preferredSubjects: formData.preferredSubjects.filter(s => s !== subject) });
  };

  const handleAddClass = () => {
    if (newClass && !formData.preferredClasses.includes(newClass)) {
      setFormData({ ...formData, preferredClasses: [...formData.preferredClasses, newClass] });
      setNewClass('');
    }
  };

  const handleRemoveClass = (cls: string) => {
    setFormData({ ...formData, preferredClasses: formData.preferredClasses.filter(c => c !== cls) });
  };

  const toggleDayAvailability = (day: string, timeSlot: string) => {
    const existingDayIndex = formData.availability.findIndex(a => a.day === day);
    
    if (existingDayIndex >= 0) {
      const dayAvailability = formData.availability[existingDayIndex];
      const hasTimeSlot = dayAvailability.timeSlots.includes(timeSlot);
      
      let updatedAvailability;
      if (hasTimeSlot) {
        // Remove time slot
        const updatedTimeSlots = dayAvailability.timeSlots.filter(t => t !== timeSlot);
        if (updatedTimeSlots.length === 0) {
          // Remove day entirely if no time slots
          updatedAvailability = formData.availability.filter(a => a.day !== day);
        } else {
          updatedAvailability = [...formData.availability];
          updatedAvailability[existingDayIndex] = { ...dayAvailability, timeSlots: updatedTimeSlots };
        }
      } else {
        // Add time slot
        updatedAvailability = [...formData.availability];
        updatedAvailability[existingDayIndex] = { ...dayAvailability, timeSlots: [...dayAvailability.timeSlots, timeSlot] };
      }
      
      setFormData({ ...formData, availability: updatedAvailability });
    } else {
      // Add new day with time slot
      setFormData({
        ...formData,
        availability: [...formData.availability, { day, timeSlots: [timeSlot] }]
      });
    }
  };

  const isTimeSlotSelected = (day: string, timeSlot: string) => {
    const dayAvailability = formData.availability.find(a => a.day === day);
    return dayAvailability?.timeSlots.includes(timeSlot) || false;
  };

  const handleSubmit = async () => {
    if (!volunteerUid) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/volunteer/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: volunteerUid,
          ...formData,
          profileCompleted: true
        })
      });

      if (response.ok) {
        router.push('/volunteer/dashboard');
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Complete Your Volunteer Profile
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please complete your profile to start receiving volunteer requests from schools.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div>
              <Label>Your Skills (e.g., Mathematics, Science, English)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Subjects */}
            <div>
              <Label>Subjects You Want to Teach</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add a subject"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                />
                <Button type="button" onClick={handleAddSubject} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferredSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSubject(subject)}>
                    {subject} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Classes */}
            <div>
              <Label>Classes You Can Teach (e.g., Class 6, Class 7, Class 8)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder="Add a class"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
                />
                <Button type="button" onClick={handleAddClass} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferredClasses.map((cls) => (
                  <Badge key={cls} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveClass(cls)}>
                    {cls} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location Preferences */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred District</Label>
                <Input
                  value={formData.preferredDistrict}
                  onChange={(e) => setFormData({ ...formData, preferredDistrict: e.target.value })}
                  placeholder="e.g., Khurda"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Preferred Locality</Label>
                <Input
                  value={formData.preferredLocality}
                  onChange={(e) => setFormData({ ...formData, preferredLocality: e.target.value })}
                  placeholder="e.g., Bhubaneswar"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label>Your Availability</Label>
              <div className="mt-2 space-y-3">
                {DAYS.map((day) => (
                  <div key={day} className="border rounded-lg p-3">
                    <p className="font-medium mb-2">{day}</p>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <Badge
                          key={slot}
                          variant={isTimeSlotSelected(day, slot) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleDayAvailability(day, slot)}
                        >
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <Label>Teaching Experience</Label>
              <Textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Describe your teaching experience..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Bio */}
            <div>
              <Label>Bio / About You</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* NGO Affiliation (Optional) */}
            <div>
              <Label>NGO Affiliation (Optional)</Label>
              <Input
                value={formData.ngoUid}
                onChange={(e) => setFormData({ ...formData, ngoUid: e.target.value })}
                placeholder="Enter NGO UID if applicable"
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
