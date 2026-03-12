'use client';

import { useState } from 'react';
import { Menu, X, Search, Bell, Settings, LogOut, Home, User, ChevronDown, GraduationCap, Bot, BookOpen } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}>
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Navigation Menu</h2>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <nav className="flex flex-col space-y-2">
                  <a href="/student/dashboard" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                  <a href="/school-finder" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <Search className="h-5 w-5" />
                    <span>School Finder</span>
                  </a>
                  <a href="/admission-assistant" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <Bot className="h-5 w-5" />
                    <span>Admission Assistant</span>
                  </a>
                  <a href="/scholarships" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <GraduationCap className="h-5 w-5" />
                    <span>Scholarships</span>
                  </a>
                  <a href="/saved-schools" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <BookOpen className="h-5 w-5" />
                    <span>Saved Schools</span>
                  </a>
                  <a href="/notifications" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </a>
                  <a href="/settings" className="flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
