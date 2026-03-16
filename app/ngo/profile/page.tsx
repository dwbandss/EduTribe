"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Edit,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NGOProfile {
  ngoUid: string;
  ngoName: string;
  email: string;
  phone?: string;
  district: string;
  state: string;
  verifiedStatus: string;
  description?: string;
  establishedYear?: number;
  website?: string;
  stats?: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalSchools: number;
    totalStudents: number;
    averageRating: number;
    districtsCovered: number;
  };
}

export default function NGOProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/ngo/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.ngo);
      } else {
        setError(data.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error || "Profile not found"}</p>
            <Button onClick={() => router.push("/ngo/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/ngo/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">NGO Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>

            <Button size="sm" variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{profile.ngoName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant={profile.verifiedStatus === "verified" ? "default" : "secondary"}>
                        {profile.verifiedStatus === "verified" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {profile.verifiedStatus}
                      </Badge>
                      <span className="text-sm">UID: {profile.ngoUid}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>

                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{profile.district}, {profile.state}</p>
                    </div>
                  </div>

                  {profile.establishedYear && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Established</p>
                        <p className="font-medium">{profile.establishedYear}</p>
                      </div>
                    </div>
                  )}
                </div>

                {profile.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">About</p>
                    <p className="text-sm leading-relaxed">{profile.description}</p>
                  </div>
                )}

                {profile.website && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Website</p>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Impact Overview</CardTitle>
                <CardDescription>Your contribution to education</CardDescription>
              </CardHeader>

              {profile.stats && (
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profile.stats.totalVolunteers}</div>
                      <p className="text-sm text-muted-foreground">Total Volunteers</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profile.stats.totalSchools}</div>
                      <p className="text-sm text-muted-foreground">Partner Schools</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profile.stats.totalStudents}</div>
                      <p className="text-sm text-muted-foreground">Students Reached</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profile.stats.activeVolunteers}</div>
                      <p className="text-sm text-muted-foreground">Active Volunteers</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profile.stats.districtsCovered}</div>
                      <p className="text-sm text-muted-foreground">Districts Covered</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{profile.stats.averageRating.toFixed(1)}</div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Link href="/ngo/dashboard">
                  <Button className="w-full" variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Volunteers
                </Button>

                <Button className="w-full" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Schools
                </Button>

                <Button className="w-full" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-center p-4">
                  {profile.verifiedStatus === "verified" ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-green-600">Verified NGO</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your NGO is verified and can access all features
                      </p>
                    </>
                  ) : (
                    <>
                      <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-yellow-600">Pending Verification</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your NGO verification is under review
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
