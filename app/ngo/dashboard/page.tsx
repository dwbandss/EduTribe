"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  BookOpen,
  Heart,
  GraduationCap,
  TrendingUp,
  MapPin,
  Star,
  CheckCircle,
  Calendar,
  AlertCircle,
  Clock,
  X
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

type TabType = "overview" | "volunteers" | "schools" | "requests" | "impact";

interface Stats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalSchools: number;
  totalStudents: number;
  sessionsThisMonth: number;
  totalHours: number;
  totalSessions: number;
  averageRating: number;
  districtsCovered: number;
}

interface Volunteer {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  preferredSubjects: string[];
  preferredClasses: string[];
  preferredDistrict: string;
  ratingAverage: number;
  totalSessions: number;
  totalHours: number;
  studentsTaught: number;
  verificationStatus: string;
  isActive: boolean;
  assignedSchoolUid?: string;
}

interface School {
  uid: string;
  schoolName: string;
  district: string;
  state: string;
  totalStudents: number;
  verificationStatus: string;
  assignedVolunteers: string[];
  activeRequests: string[];
}

interface Request {
  requestId: string;
  schoolUid: string;
  school?: {
    uid: string;
    schoolName: string;
    district: string;
    state: string;
  };
  subjectsRequired: string[];
  classesRequired: string[];
  volunteersNeeded: number;
  district: string;
  state: string;
  status: 'open' | 'closed' | 'filled';
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export default function NGODashboard() {
  console.log('=== DEBUG: Dashboard component mounting ===');
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []); // Initial fetch on mount

  useEffect(() => {
    // Handle URL tab parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && ['volunteers', 'schools', 'requests', 'impact', 'overview'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "overview") {
      fetchData(); // Only fetch for non-overview tabs
    }
  }, [activeTab]); // Fetch when tab changes

  const fetchData = async () => {
    try {
      console.log('=== DEBUG: Dashboard fetching data ===');
      
      // Browser will automatically send httpOnly cookie
      const fetchOptions = {
        credentials: "include" as RequestCredentials
      };

      // Fetch NGO profile
      console.log('=== DEBUG: Dashboard fetching profile ===');
      const profileResponse = await fetch("/api/ngo/profile", fetchOptions);
      console.log('=== DEBUG: Dashboard profile response status ===', profileResponse.status);
      
      if (!profileResponse.ok) {
        throw new Error("Profile fetch failed");
      }
      
      const profileData = await profileResponse.json();
      console.log('=== DEBUG: Dashboard profile data ===', profileData.success ? 'SUCCESS' : 'FAILED');
      
      if (profileData.success) {
        setProfile(profileData.profile);
      }

      // Always fetch stats for overview
      console.log('=== DEBUG: Dashboard fetching stats ===');
      const statsResponse = await fetch("/api/ngo/stats", fetchOptions);
      console.log('=== DEBUG: Dashboard stats response status ===', statsResponse.status);
      const statsData = await statsResponse.json();
      console.log('=== DEBUG: Dashboard stats data ===', statsData.success ? 'SUCCESS' : 'FAILED');
      
      if (statsData.success && statsData.stats) {
        console.log('=== DEBUG: Setting stats data ===', statsData.stats);
        setStats(statsData.stats);
      } else {
        console.log('=== DEBUG: Stats API failed, setting default stats ===');
        // Set default stats if API fails
        setStats({
          totalVolunteers: 0,
          activeVolunteers: 0,
          totalSchools: 0,
          totalStudents: 0,
          sessionsThisMonth: 0,
          totalHours: 0,
          totalSessions: 0,
          averageRating: 0,
          districtsCovered: 0
        });
      }

      // Fetch data based on active tab
      if (activeTab === "volunteers") {
        const volunteersResponse = await fetch("/api/ngo/volunteers", fetchOptions);
        const volunteersData = await volunteersResponse.json();
        if (volunteersData.success) {
          setVolunteers(volunteersData.volunteers);
        }
      } else if (activeTab === "schools") {
        const schoolsResponse = await fetch("/api/ngo/schools", fetchOptions);
        const schoolsData = await schoolsResponse.json();
        if (schoolsData.success) {
          setSchools(schoolsData.schools);
        }
      } else if (activeTab === "requests") {
        const requestsResponse = await fetch("/api/ngo/requests", fetchOptions);
        const requestsData = await requestsResponse.json();
        if (requestsData.success) {
          setRequests(requestsData.requests);
        }
      }

      setError("");
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerAction = async (volunteerUid: string, action: string) => {
    try {
      const response = await fetch("/api/ngo/volunteers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify({ volunteerUid, action }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData(); // Refresh data
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to perform action");
    }
  };

  const tabs: TabType[] = [
    "overview",
    "volunteers",
    "schools",
    "requests",
    "impact"
  ];

  console.log('=== DEBUG: Current stats state ===', stats);
  console.log('=== DEBUG: Current active tab ===', activeTab);
  console.log('=== DEBUG: Loading state ===', loading);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">NGO Dashboard</span>
              <Badge variant={profile?.verifiedStatus === "verified" ? "default" : "secondary"}>
                {profile?.verifiedStatus === "verified" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {profile?.verifiedStatus}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/ngo/profile" className="text-sm text-muted-foreground">
                Profile
              </Link>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        {/* Tabs */}

        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}

        {activeTab === "overview" && stats && (
          <>
            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Volunteers"
                value={stats.totalVolunteers || 0}
                icon={<Users className="w-4 h-4" />}
              />

              <StatCard
                title="Active Volunteers"
                value={stats.activeVolunteers || 0}
                icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              />

              <StatCard
                title="Partner Schools"
                value={stats.totalSchools || 0}
                icon={<BookOpen className="w-4 h-4" />}
              />

              <StatCard
                title="Students Reached"
                value={stats.totalStudents || 0}
                icon={<GraduationCap className="w-4 h-4" />}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <StatCard
                title="Sessions This Month"
                value={stats.sessionsThisMonth || 0}
                icon={<Calendar className="w-4 h-4" />}
              />

              <StatCard
                title="Districts Covered"
                value={stats.districtsCovered || 0}
                icon={<MapPin className="w-4 h-4" />}
              />

              <StatCard
                title="Average Rating"
                value={(stats.averageRating || 0).toFixed(1)}
                icon={<Star className="w-4 h-4 text-yellow-500" />}
              />
            </div>
          </>
        )}

        {/* VOLUNTEER REQUESTS */}
        
        {activeTab === "volunteers" && (
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Requests & Management</CardTitle>
              {error && (
                <CardDescription className="text-destructive">
                  {error}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading volunteer requests...</p>
                </div>
              ) : (
                <>
                  {/* Pending Volunteer Requests */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Pending Volunteer Requests</h3>
                    {volunteers.filter(v => v.verificationStatus === 'pending').length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending volunteer requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {volunteers.filter(v => v.verificationStatus === 'pending').map((volunteer) => (
                          <div
                            key={volunteer.uid}
                            className="flex justify-between items-center border p-4 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{volunteer.name}</p>
                              <p className="text-sm text-muted-foreground">{volunteer.uid}</p>
                              <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                              <p className="text-sm text-muted-foreground">{volunteer.phone}</p>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleVolunteerAction(volunteer.uid, "verify")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleVolunteerAction(volunteer.uid, "reject")}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SCHOOLS */}
        
        {activeTab === "schools" && (
          <Card>
            <CardHeader>
              <CardTitle>Partner Schools</CardTitle>
              {error && (
                <CardDescription className="text-destructive">
                  {error}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading schools...</p>
                </div>
              ) : (
                <>
                  {schools.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No partner schools yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schools.map((school) => (
                        <div
                          key={school.uid}
                          className="flex justify-between items-center border p-4 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{school.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{school.uid}</p>
                            <p className="text-sm text-muted-foreground">{school.district}, {school.state}</p>
                            <p className="text-sm text-muted-foreground">{school.totalStudents} students</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* REQUESTS */}
        
        {activeTab === "requests" && (
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Requests</CardTitle>
              {error && (
                <CardDescription className="text-destructive">
                  {error}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading requests...</p>
                </div>
              ) : (
                <>
                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No volunteer requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div
                          key={request.requestId}
                          className="flex justify-between items-center border p-4 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{request.school?.schoolName || 'Unknown School'}</p>
                            <p className="text-sm text-muted-foreground">{request.requestId}</p>
                            <p className="text-sm text-muted-foreground">{request.subjectsRequired?.join(', ')}</p>
                            <p className="text-sm text-muted-foreground">{request.volunteersNeeded} volunteers needed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* IMPACT */}

        {activeTab === "impact" && stats && (
          <Card>
            <CardHeader>
              <CardTitle>Impact</CardTitle>
              <CardDescription>Your yearly impact</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ImpactRow label="Students Helped" value={stats.totalStudents || 0} />
              <ImpactRow label="Volunteer Hours" value={Math.round((stats.totalHours || 0) / 60)} />
              <ImpactRow
                label="Sessions Conducted"
                value={stats.totalSessions || 0}
              />
              <ImpactRow
                label="Average Rating"
                value={`${(stats.averageRating || 0).toFixed(1)}/5`}
              />
              <ImpactRow
                label="Active Volunteers"
                value={stats.activeVolunteers || 0}
              />
              <ImpactRow
                label="Districts Covered"
                value={stats.districtsCovered || 0}
              />
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ImpactRow({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
