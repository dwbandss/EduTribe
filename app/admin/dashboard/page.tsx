'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building, User, GraduationCap, LogOut } from 'lucide-react';
import { NGO } from 'd:/EduTribe/models/NGO';
import { Volunteer } from 'd:/EduTribe/models/Volunteer';
import { School } from 'd:/EduTribe/models/School';
import { Student } from 'd:/EduTribe/models/Student';
import { Donor } from 'd:/EduTribe/models/Donor';

interface EntityStats {
  totalNGOs: number;
  totalSchools: number;
  totalVolunteers: number;
  totalStudents: number;
  verifiedNGOs: number;
  verifiedSchools: number;
  verifiedVolunteers: number;
  verifiedStudents: number;
}

interface AdminData {
  ngos: any[];
  schools: any[];
  volunteers: any[];
  students: any[];
  donors: any[];
  stats: EntityStats & {
    totalDonors: number;
    verifiedDonors: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<'ngos' | 'schools' | 'volunteers' | 'students' | 'donors'>('ngos');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and redirect
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const verifyEntity = async (
    type: 'ngo' | 'school' | 'volunteer' | 'student' | 'donor',
    uid: string
  ): Promise<void> => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, uid })
      });

      const result = await response.json();

      if (result.success) {
        alert(`${type} updated`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline">Admin</Badge>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <StatCard
            icon={<Building className="w-5 h-5" />}
            title="NGOs"
            total={data?.stats.totalNGOs}
            verified={data?.stats.verifiedNGOs}
          />

          <StatCard
            icon={<Users className="w-5 h-5" />}
            title="Schools"
            total={data?.stats.totalSchools}
            verified={data?.stats.verifiedSchools}
          />

          <StatCard
            icon={<User className="w-5 h-5" />}
            title="Volunteers"
            total={data?.stats.totalVolunteers}
            verified={data?.stats.verifiedVolunteers}
          />

          <StatCard
            icon={<GraduationCap className="w-5 h-5" />}
            title="Students"
            total={data?.stats.totalStudents}
            verified={data?.stats.verifiedStudents}
          />

          <StatCard
            icon={<Users className="w-5 h-5" />}
            title="Donors"
            total={data?.stats.totalDonors}
            verified={data?.stats.verifiedDonors}
          />

        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['ngos', 'schools', 'volunteers', 'students', 'donors'].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as 'ngos' | 'schools' | 'volunteers' | 'students' | 'donors')
              }
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* NGOs */}
        {activeTab === 'ngos' && (
          <EntityList
            items={data?.ngos || []}
            label="organizationName"
            verifyField="verifiedStatus"
            onVerify={(uid) => verifyEntity('ngo', uid)}
          />
        )}

        {/* Schools */}
        {activeTab === 'schools' && (
          <EntityList
            items={data?.schools || []}
            label="schoolName"
            verifyField="verificationStatus"
            onVerify={(uid) => verifyEntity('school', uid)}
          />
        )}

        {/* Volunteers */}
        {activeTab === 'volunteers' && (
          <EntityList
            items={data?.volunteers || []}
            label="name"
            verifyField="verificationStatus"
            onVerify={(uid) => verifyEntity('volunteer', uid)}
          />
        )}

        {/* Donors */}
        {activeTab === 'donors' && (
          <EntityList
            items={data?.donors || []}
            label="name"
            verifyField="verifiedStatus"
            onVerify={(uid) => verifyEntity('donor', uid)}
          />
        )}

      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ icon, title, total, verified }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{total || 0}</div>
        <div className="text-xs text-green-600">{verified || 0} verified</div>
      </CardContent>
    </Card>
  );
}

function EntityList({ items, label, verifyField, onVerify }: {
  items: any[];
  label: string;
  verifyField: string;
  onVerify: (uid: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entities</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">

          {items.map((item: any) => (
            <div
              key={item._id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">{item[label]}</p>
                <p className="text-sm text-gray-500">UID: {item.uid}</p>
              </div>

              <div className="flex gap-2 items-center">
                <Badge variant={item[verifyField] ? 'default' : 'secondary'}>
                  {item[verifyField] ? 'Verified' : 'Pending'}
                </Badge>

                <button
                  onClick={() => onVerify(item.uid)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Toggle
                </button>
              </div>
            </div>
          ))}

        </div>
      </CardContent>
    </Card>
  );
}