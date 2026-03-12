'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on main dashboard
  if (pathname === '/student/dashboard') {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground mb-4 ${className}`}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}
