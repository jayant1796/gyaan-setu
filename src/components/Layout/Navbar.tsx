import React, { useState } from 'react';
import { logoutUser } from '../../lib/auth';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import type { User } from '../../lib/supabase';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">Gyan Setu</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-gray-700">
              {user.full_name}
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="py-4">
              <p className="text-sm text-gray-700 mb-4">
                {user.full_name}
                <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {user.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
