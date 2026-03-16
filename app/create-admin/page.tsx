'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Admin created successfully! You can now login at /admin/login');
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create Admin Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Click the button below to create the admin account:</p>
              <p><strong>Email:</strong> admin@edutribe.org</p>
              <p><strong>Password:</strong> Admin@123</p>
            </div>
            
            <Button 
              onClick={handleCreateAdmin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Admin Account'}
            </Button>

            {message && (
              <div className="text-sm p-3 rounded-md bg-gray-100">
                {message}
              </div>
            )}

            <div className="text-center">
              <a href="/admin/login" className="text-sm text-blue-600 hover:underline">
                Go to Admin Login →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
