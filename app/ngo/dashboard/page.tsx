"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Clock
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
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Always fetch stats for overview
      const statsResponse = await fetch("/api/ngo/stats", { headers });
      const statsData = await statsResponse.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      } else {
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
        const volunteersResponse = await fetch("/api/ngo/volunteers", { headers });
        const volunteersData = await volunteersResponse.json();
        if (volunteersData.success) {
          setVolunteers(volunteersData.volunteers);
        }
      } else if (activeTab === "schools") {
        const schoolsResponse = await fetch("/api/ngo/schools", { headers });
        const schoolsData = await schoolsResponse.json();
        if (schoolsData.success) {
          setSchools(schoolsData.schools);
        }
      } else if (activeTab === "requests") {
        const requestsResponse = await fetch("/api/ngo/requests", { headers });
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
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ngo/volunteers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const handleSchoolAction = async (schoolUid: string, action: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ngo/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolUid, action }),
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

  const handleRequestAction = async (requestId: string, action: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ngo/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
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
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">NGO Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/ngo/profile" className="text-sm text-muted-foreground">
              Profile
            </Link>

            <Button size="sm" variant="outline">
              Logout
            </Button>
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

        {/* VOLUNTEERS */}

        {activeTab === "volunteers" && (
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Management</CardTitle>
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
                  <p className="mt-2 text-muted-foreground">Loading volunteers...</p>
                </div>
              ) : volunteers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No volunteers found</p>
                </div>
              ) : (
                volunteers.map((volunteer) => (
                  <div
                    key={volunteer.uid}
                    className="flex justify-between items-center border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{volunteer.name}</p>
                      <p className="text-sm text-muted-foreground">{volunteer.uid}</p>
                      <p className="text-sm text-muted-foreground">{volunteer.email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            volunteer.verificationStatus === "verified" && volunteer.isActive
                              ? "default"
                              : "secondary"
                          }
                        >
                          {volunteer.verificationStatus === "verified" && volunteer.isActive
                            ? "active"
                            : volunteer.verificationStatus}
                        </Badge>

                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {volunteer.ratingAverage.toFixed(1)}
                        </div>
                      </div>

                      {volunteer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {volunteer.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{volunteer.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {volunteer.verificationStatus === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleVolunteerAction(volunteer.uid, "verify")}
                        >
                          Verify
                        </Button>
                      )}
                      {volunteer.verificationStatus === "verified" && (
                        <Button
                          size="sm"
                          variant={volunteer.isActive ? "destructive" : "default"}
                          onClick={() =>
                            handleVolunteerAction(
                              volunteer.uid,
                              volunteer.isActive ? "deactivate" : "activate"
                            )
                          }
                        >
                          {volunteer.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))
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
              ) : schools.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No schools found</p>
                </div>
              ) : (
                schools.map((school) => (
                  <div
                    key={school.uid}
                    className="flex justify-between items-center border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{school.schoolName}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.uid}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {school.district}, {school.state}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {school.totalStudents} students
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            school.verificationStatus === "verified" ? "default" : "secondary"
                          }
                        >
                          {school.verificationStatus}
                        </Badge>
                        
                        {school.assignedVolunteers.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {school.assignedVolunteers.length} volunteers
                          </Badge>
                        )}
                        
                        {school.activeRequests.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {school.activeRequests.length} requests
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {school.verificationStatus === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleSchoolAction(school.uid, "verify")}
                        >
                          Verify
                        </Button>
                      )}
                      {school.verificationStatus === "verified" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSchoolAction(school.uid, "reject")}
                        >
                          Reject
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))
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
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No requests found</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.requestId}
                    className="flex justify-between items-center border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {request.school?.schoolName || 'Unknown School'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.requestId}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Subjects: {request.subjectsRequired.join(', ')}
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        Classes: {request.classesRequired.join(', ')}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Volunteers needed: {request.volunteersNeeded}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {request.district}, {request.state}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.createdAt).toLocaleDateString()}

                        <Badge
                          variant={
                            request.urgency === "high"
                              ? "destructive"
                              : request.urgency === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {request.urgency}
                        </Badge>
                        
                        <Badge
                          variant={
                            request.status === "open"
                              ? "default"
                              : request.status === "filled"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {request.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.requestId, "close")}
                        >
                          Close
                        </Button>
                      )}
                      {request.status === "closed" && (
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.requestId, "reopen")}
                        >
                          Reopen
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
                    </div>
                  </div>
                ))
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