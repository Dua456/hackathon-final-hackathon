import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  Trophy,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Eye
} from 'lucide-react';
import RecentActivities from '../components/RecentActivities';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    pendingComplaints: 0,
    totalProjects: 0,
    totalRevenue: 0,
    newRegistrations: 0,
    activeParticipants: 0,
    completedEvents: 0
  });

  // Mock data - in a real app, this would come from your backend/Firebase
  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeEvents: 8,
        pendingComplaints: 12,
        totalProjects: 234,
        totalRevenue: 45600,
        newRegistrations: 42,
        activeParticipants: 892,
        completedEvents: 15
      });
    }, 500);
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: "+12% from last month",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Active Events",
      value: stats.activeEvents,
      change: "+3 new events",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Pending Complaints",
      value: stats.pendingComplaints,
      change: "Resolve soon",
      icon: AlertTriangle,
      color: "bg-yellow-500"
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      change: "+24 from last week",
      icon: Trophy,
      color: "bg-purple-500"
    }
  ];

  const quickActions = [
    { name: "Create Event", icon: Calendar, color: "bg-blue-500" },
    { name: "Manage Users", icon: Users, color: "bg-green-500" },
    { name: "View Reports", icon: TrendingUp, color: "bg-purple-500" },
    { name: "Handle Complaints", icon: AlertTriangle, color: "bg-red-500" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">New Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg mr-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`${action.color} p-3 rounded-lg mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <RecentActivities />
      </div>
    </div>
  );
};

export default AdminDashboard;