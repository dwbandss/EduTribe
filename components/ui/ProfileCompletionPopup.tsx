'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface ProfileCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile?: () => void;
}

export default function ProfileCompletionPopup({ isOpen, onClose, onCompleteProfile }: ProfileCompletionPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Complete Your Profile</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Incomplete</p>
              <p className="text-sm text-muted-foreground">
                To access personalized features like scholarship recommendations, please complete your profile information including:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                <li>Class/Grade</li>
                <li>State</li>
                <li>Category</li>
                <li>Income (optional)</li>
                <li>Marks (optional)</li>
              </ul>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Later
            </Button>
            <Button 
              onClick={() => {
                onCompleteProfile?.();
                onClose();
              }}
              className="flex-1"
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
