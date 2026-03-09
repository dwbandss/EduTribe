"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, BookOpen, Users, Building2, Heart, GraduationCap, Shield } from 'lucide-react';
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
    role: preselectedRole,
    organizationName: '',
    schoolName: '',
    schoolCode: '',
    district: '',
    state: '',
    phone: ''
  });

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
    { value: 'school', label: 'School', icon: BookOpen, description: 'Register your tribal school' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform administration' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setGeneratedUID(data.uid);
        // Clear form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          organizationName: '',
          schoolName: '',
          schoolCode: '',
          district: '',
          state: '',
          phone: ''
        });
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
                  <Shield className="w-12 h-12 mx-auto" />
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

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      required
                      className="bg-background border-border"
                    />
                  </div>

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
                </div>

                {/* Role-specific fields */}
                {formData.role === 'ngo' && (
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
                )}

                {formData.role === 'school' && (
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
                      <label htmlFor="schoolCode" className="text-sm font-medium text-foreground">
                        School Code
                      </label>
                      <Input
                        id="schoolCode"
                        name="schoolCode"
                        type="text"
                        placeholder="School code"
                        value={formData.schoolCode}
                        onChange={handleChange}
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
