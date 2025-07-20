
'use client';

import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(getCurrentUser());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
    
    // Listen for storage changes to update user state
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check for user changes more frequently during transitions
    const interval = setInterval(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []); // Empty dependency array - this should remain constant

  const handleLogout = () => {
    logout();
    setUser(null);
    // Force page refresh to ensure clean state
    window.location.href = '/';
  };

  // Don't render user-specific content until mounted
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                <span className="font-pacifico">HealthCare</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/doctors" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Find Doctors
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              <span className="font-pacifico">HealthCare</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/doctors" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Find Doctors
            </Link>
            {user && (
              <>
                {user.role === 'doctor' && (
                  <>
                    <Link href="/doctor/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/doctor/schedule" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Schedule
                    </Link>
                  </>
                )}
                {user.role === 'patient' && (
                  <Link href="/patient/appointments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    My Appointments
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.role === 'doctor' 
                      ? `https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=32&height=32&seq=doc${user.id}&orientation=squarish`
                      : `https://readdy.ai/api/search-image?query=Happy%20patient%20portrait%2C%20smiling%20person%20in%20casual%20clothes%2C%20friendly%20patient%20photo%2C%20healthcare%20patient%20image%2C%20person%20in%20medical%20setting%2C%20approachable%20patient%20appearance%2C%20clean%20background&width=32&height=32&seq=patient${user.id}&orientation=squarish`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700">
                    Hello, {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 whitespace-nowrap cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
