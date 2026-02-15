import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Trophy,
  MessageSquare
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, currentUser, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Events', href: '/admin/events', icon: Trophy },
    { name: 'Complaints', href: '/admin/complaints', icon: AlertTriangle },
    { name: 'Activities', href: '/admin/activities', icon: Calendar },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className={`${sidebarOpen ? 'fixed inset-0 z-40' : 'hidden'}`} onClick={() => setSidebarOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-gray-900 font-bold text-xl">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center w-full mt-4 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {location.pathname.split('/')[2] || 'Admin Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.displayName || currentUser?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                  {currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                   currentUser?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;