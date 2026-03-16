"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, BookOpen, Users, Building2, Heart, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get('role') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: preselectedRole || 'student', // Default to student if not preselected
    organizationName: '',
    schoolName: '',
    schoolUid: '', // Add schoolUid to form state
    district: '',
    state: '',
    phone: '',
    locality: '',
    address: '',
    description: '',
    ngoUid: '', // Add NGO UID for NGO volunteers
    aadhaarNumber: '' // Add Aadhaar for independent volunteers
  });

  const [volunteerType, setVolunteerType] = useState<'independent' | 'ngo'>('independent');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedUID, setGeneratedUID] = useState('');

  const roles = [
    { value: 'volunteer', label: 'Volunteer', icon: Users, description: 'Teach and mentor tribal students' },
    { value: 'ngo', label: 'NGO', icon: Heart, description: 'Partner with tribal schools' },
    { value: 'donor', label: 'Donor', icon: Building2, description: 'Support education initiatives' },
    { value: 'student', label: 'Student', icon: GraduationCap, description: 'Access educational resources' },
    { value: 'school', label: 'School', icon: BookOpen, description: 'Register your tribal school' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      // Route volunteer registration to volunteer-register API
      if (formData.role === 'volunteer') {
        const volunteerData = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          type: volunteerType, // Add volunteer type
          // Include volunteer-specific fields based on type
          ...(volunteerType === 'ngo' && { ngoUid: formData.ngoUid }),
          ...(volunteerType === 'independent' && { aadhaarNumber: formData.aadhaarNumber })
        };
        
        response = await fetch('/api/auth/volunteer-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(volunteerData),
        });
      } else {
        // Other roles go to general register API
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setGeneratedUID(data.uid);
        // Don't clear form or auto-redirect - let user see the UID
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">EduTribe</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join EduTribe</h1>
          <p className="text-muted-foreground">Create your account and start making a difference</p>
        </div>

        {/* Success Message */}
        {success && generatedUID && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-green-600 mb-4">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Registration Successful!</h3>
                <p className="text-green-700 mb-4">{success}</p>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800 mb-1">Your Login UID:</p>
                  <p className="text-2xl font-bold text-green-900">{generatedUID}</p>
                  <p className="text-xs text-green-600 mt-2">Please save this UID for future logins</p>
                </div>
                <Link
                  href="/login"
                  className="inline-block mt-4 text-green-600 hover:text-green-800 font-medium"
                >
                  Go to Login →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Form */}
        {!success && (
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join our community dedicated to tribal education
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">I want to join as:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <div
                          key={role.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border p-3 transition-all hover:border-primary",
                            formData.role === role.value
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          )}
                          onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <Icon className="w-5 h-5 mb-2 text-primary" />
                          <div className="text-sm font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Volunteer Type Selection - Only show when role is volunteer */}
                {formData.role === 'volunteer' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Volunteer Type</label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={volunteerType === 'independent' ? 'default' : 'outline'}
                        onClick={() => setVolunteerType('independent')}
                        className="flex-1"
                      >
                        Independent Volunteer
                      </Button>
                      <Button
                        type="button"
                        variant={volunteerType === 'ngo' ? 'default' : 'outline'}
                        onClick={() => setVolunteerType('ngo')}
                        className="flex-1"
                      >
                        NGO Volunteer
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {volunteerType === 'independent' 
                        ? 'Register independently. Requires admin verification.'
                        : 'Register under an NGO organization.'}
                    </p>
                  </div>
                )}

                {/* NGO UID Field - Only show for NGO volunteers */}
                {formData.role === 'volunteer' && volunteerType === 'ngo' && (
                  <div className="space-y-2">
                    <label htmlFor="ngoUid" className="text-sm font-medium text-foreground">
                      NGO UID *
                    </label>
                    <Input
                      id="ngoUid"
                      name="ngoUid"
                      type="text"
                      placeholder="Enter NGO UID provided by your organization"
                      value={formData.ngoUid}
                      onChange={handleChange}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                )}

                {/* Aadhaar Field - Only show for independent volunteers */}
                {formData.role === 'volunteer' && volunteerType === 'independent' && (
                  <div className="space-y-2">
                    <label htmlFor="aadhaarNumber" className="text-sm font-medium text-foreground">
                      Aadhaar Number *
                    </label>
                    <Input
                      id="aadhaarNumber"
                      name="aadhaarNumber"
                      type="text"
                      placeholder="Enter 12-digit Aadhaar number"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                )}

                {/* Basic Information - Full Name hidden for schools, uses schoolName instead */}
                {formData.role !== 'school' && (
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={formData.role !== 'school'}
                      className="bg-background border-border"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>

                {/* Role-specific fields */}
                {formData.role === 'student' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Required for Student:</strong> Full Name, School UID (ask your school for this)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="schoolUid" className="text-sm font-medium text-foreground">
                        School UID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="schoolUid"
                        name="schoolUid"
                        type="text"
                        placeholder="Enter your school UID (get this from your school)"
                        value={formData.schoolUid}
                        onChange={handleChange}
                        className="bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'volunteer' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Required for Volunteer:</strong> Full Name
                      </p>
                    </div>
                  </div>
                )}

                {formData.role === 'ngo' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Required for NGO:</strong> Organization Name, District, Locality, Address, Description
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="organizationName" className="text-sm font-medium text-foreground">
                        Organization Name *
                      </label>
                      <Input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        placeholder="NGO name"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="district" className="text-sm font-medium text-foreground">
                          District *
                        </label>
                        <Input
                          id="district"
                          name="district"
                          type="text"
                          placeholder="District"
                          value={formData.district}
                          onChange={handleChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="locality" className="text-sm font-medium text-foreground">
                          Locality/Area *
                        </label>
                        <Input
                          id="locality"
                          name="locality"
                          type="text"
                          placeholder="Locality or area"
                          value={formData.locality}
                          onChange={handleChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-foreground">
                        Address *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Full address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-foreground">
                        Description * <span className="text-xs text-muted-foreground">(min 10 characters)</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Describe your NGO's mission and activities..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                        minLength={10}
                        className="w-full min-h-[100px] p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'school' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Required for School:</strong> School Name, District, State
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="schoolName" className="text-sm font-medium text-foreground">
                        School Name *
                      </label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        type="text"
                        placeholder="School name"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="district" className="text-sm font-medium text-foreground">
                        District *
                      </label>
                      <Input
                        id="district"
                        name="district"
                        type="text"
                        placeholder="District"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium text-foreground">
                        State *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="bg-background border-border"
                      />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground">Loading...</div></div>}>
      <SignupContent />
    </Suspense>
  );
}
