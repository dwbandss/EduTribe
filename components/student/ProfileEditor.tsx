'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { User, Save, Edit } from 'lucide-react';

interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  state?: string;
  category?: string;
  currentInstitution?: string;
  targetCourses?: string;
  income?: number;
  marks?: number;
  phone?: string;
  schoolData?: any;
  [key: string]: any;
}

interface ProfileEditorProps {
  student?: StudentProfile;
  onUpdate?: (updatedProfile: StudentProfile | undefined) => void;
}

const defaultProfile: StudentProfile = {
  uid: '',
  name: '',
  email: '',
  role: 'student',
  class: '',
  state: '',
  category: '',
  currentInstitution: '',
  targetCourses: '',
};

export default function ProfileEditor({ student, onUpdate }: ProfileEditorProps) {
  const [profile, setProfile] = useState<StudentProfile>(student || defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update local profile when prop changes
  useEffect(() => {
    if (student) {
      setProfile({
        ...defaultProfile,
        ...student
      });
    }
  }, [student]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Saving profile data:', profile);
      // Save to database
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Save response:', result);
        if (result.success) {
          console.log('Setting profile to:', result.data);
          setProfile(result.data);
          setIsEditing(false);
          setHasChanges(false);
          
          // Create the complete updated profile to pass to parent
          const updatedProfile = {
            ...student,
            ...profile, // Use the local profile state which has the latest changes
            ...result.data, // Merge with any server response data
          };
          
          console.log('Calling onUpdate with complete updated profile:', updatedProfile);
          onUpdate?.(updatedProfile);
          
          // Show success message
          alert('Profile saved successfully!');
        } else {
          alert('Error saving profile: ' + (result.message || 'Unknown error'));
        }
      } else {
        alert('Error saving profile: Server error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile((prev) => prev);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(student));
      return updated;
    });
  };

  const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
    'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
    'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ];

  const categories = ['General','OBC','SC','ST','EWS','PWD'];

  const classes = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Student Profile

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {isEditing ? (

          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Class */}
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={profile.class || ''}
                  onValueChange={(value) => handleInputChange('class', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>

                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label>State</Label>

                <Select
                  value={profile.state || ''}
                  onValueChange={(value) => handleInputChange('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>

                  <SelectContent>
                    {states.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>

                <Select
                  value={profile.category || ''}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label>Current Institution</Label>
                <Input
                  value={profile.currentInstitution || ''}
                  onChange={(e) =>
                    handleInputChange('currentInstitution', e.target.value)
                  }
                  placeholder="Your current school or college"
                />
              </div>

              {/* Target Courses */}
              <div className="space-y-2">
                <Label>Target Courses / Careers</Label>
                <Input
                  value={profile.targetCourses || ''}
                  onChange={(e) =>
                    handleInputChange('targetCourses', e.target.value)
                  }
                  placeholder="What courses or careers are you interested in?"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>

              <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

          </>

        ) : (

          <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Basic Information
                </h4>

                <div className="space-y-2">
                  <div><span className="font-medium">Name:</span> {profile.name}</div>
                  <div><span className="font-medium">Email:</span> {profile.email}</div>
                  <div><span className="font-medium">Class:</span> {profile.class || 'Not specified'}</div>
                  <div><span className="font-medium">State:</span> {profile.state || 'Not specified'}</div>
                  <div><span className="font-medium">Category:</span> {profile.category || 'Not specified'}</div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Academic Information
                </h4>

                <div className="space-y-2">
                  <div><span className="font-medium">Current Institution:</span> {profile.currentInstitution || 'Not specified'}</div>
                  <div><span className="font-medium">Target Courses:</span> {profile.targetCourses || 'Not specified'}</div>
                </div>
              </div>

            </div>

          </div>

        )}

      </CardContent>
    </Card>
  );
}