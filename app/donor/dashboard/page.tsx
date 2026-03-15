'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'd:/EduTribe/components/ui/card';
import { Badge } from 'd:/EduTribe/components/ui/badge';
import { Users, DollarSign, TrendingUp } from 'lucide-react';

interface DonorStats {
  totalDonors: number;
  verifiedDonors: number;
  totalDonations: number;
  totalAmount: number;
}

interface Donor {
  uid: string;
  name: string;
  email: string;
  phone: string;
  organizationType: string;
  totalDonations: number;
  totalAmount: number;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

interface VerificationRequest {
  requestId: string;
  requesterType: string;
  requesterUid: string;
  requesterName: string;
  targetUid: string;
  targetType: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function DonorDashboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors' as 'donors' | 'requests');

  useEffect(() => {
    loadDonorData();
    loadVerificationRequests();
  }, []);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      
      // Load donors
      const donorsResponse = await fetch('/api/donors');
      if (donorsResponse.ok) {
        const donorsData = await donorsResponse.json();
        if (donorsData.success) {
          setDonors(donorsData.data);
        }
      }
      
      // Load stats
      const statsResponse = await fetch('/api/donors/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }
      
    } catch (error) {
      console.error('Error loading donor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      const response = await fetch('/api/donors/requests');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVerificationRequests(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading verification requests:', error);
    }
  };

  const verifyDonor = async (uid: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'donor', uid })
      });

      const result = await response.json();
      if (result.success) {
        alert('Donor verified successfully!');
        loadDonorData(); // Reload data
      } else {
        alert('Error verifying donor');
      }
    } catch (error) {
      console.error('Error verifying donor:', error);
      alert('Error verifying donor');
    }
  };

  const submitVerificationRequest = async (targetUid: string, targetType: string, reason: string) => {
    try {
      const response = await fetch('/api/donors/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUid, targetType, reason })
      });

      const result = await response.json();
      if (result.success) {
        alert('Verification request submitted successfully!');
        loadVerificationRequests(); // Reload requests
      } else {
        alert('Error submitting verification request');
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      alert('Error submitting verification request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Donor Dashboard</h1>
          <Badge variant="outline">Donor</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDonors}</div>
                <div className="text-sm text-muted-foreground">Registered donors</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalDonations.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total amount donated</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Verified Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verifiedDonors}</div>
                <div className="text-sm text-muted-foreground">Verified donors</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['donors', 'requests'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'donors' | 'requests')}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'donors' && (
          <Card>
            <CardHeader>
              <CardTitle>Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donors.length > 0 ? (
                  donors.map((donor) => (
                    <div key={donor.uid} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-gray-500">UID: {donor.uid}</p>
                          <p className="text-sm text-gray-500">Email: {donor.email}</p>
                          <p className="text-sm text-gray-500">Organization: {donor.organizationType}</p>
                          <p className="text-sm text-gray-500">Total Donations: {donor.totalDonations}</p>
                          <p className="text-sm text-gray-500">Total Amount: ${donor.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Status: {donor.verifiedStatus}</p>
                          <p className="text-sm text-gray-500">Created: {new Date(donor.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={donor.verifiedStatus === 'verified' ? 'default' : 'secondary'}>
                          {donor.verifiedStatus === 'verified' ? 'Verified' : 'Pending'}
                        </Badge>
                        <button
                          onClick={() => verifyDonor(donor.uid)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          {donor.verifiedStatus === 'verified' ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No donors found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <button
                onClick={() => loadVerificationRequests()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
              >
                Refresh Requests
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationRequests.length > 0 ? (
                  verificationRequests.map((request) => (
                    <div key={request.requestId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{request.targetName}</p>
                          <p className="text-sm text-gray-500">Type: {request.targetType}</p>
                          <p className="text-sm text-gray-500">Requester: {request.requesterName}</p>
                          <p className="text-sm text-gray-500">Reason: {request.reason}</p>
                          <p className="text-sm text-gray-500">Status: {request.status}</p>
                          <p className="text-sm text-gray-500">Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No verification requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Form */}
        {activeTab === 'donors' && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Verification Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target UID
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter target UID (NGO or School)"
                    id="targetUid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Type
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    id="targetType"
                  >
                    <option value="">Select type...</option>
                    <option value="ngo">NGO</option>
                    <option value="school">School</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter reason for verification request"
                    id="reason"
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => {
                    const targetUid = (document.getElementById('targetUid') as HTMLInputElement)?.value;
                    const targetType = (document.getElementById('targetType') as HTMLSelectElement)?.value;
                    const reason = (document.getElementById('reason') as HTMLTextAreaElement)?.value;
                    
                    if (targetUid && targetType && reason) {
                      submitVerificationRequest(targetUid, targetType, reason);
                    } else {
                      alert('Please fill in all fields');
                    }
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Submit Request
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
