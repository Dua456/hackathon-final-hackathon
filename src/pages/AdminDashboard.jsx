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
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
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

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Fetch events count
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const totalEvents = eventsSnapshot.size;
        
        // Count active events (assuming events with startDate in the future are upcoming and those currently running are ongoing)
        const currentDate = new Date();
        const activeEvents = eventsSnapshot.docs.filter(doc => {
          const event = doc.data();
          const startDate = event.startDate ? new Date(event.startDate) : null;
          const endDate = event.endDate ? new Date(event.endDate) : null;
          
          if (startDate && endDate) {
            return startDate <= currentDate && endDate >= currentDate; // Currently ongoing
          }
          return false;
        }).length;

        // Fetch complaints count
        const complaintsSnapshot = await getDocs(collection(db, 'complaints'));
        const totalComplaints = complaintsSnapshot.size;
        const pendingComplaints = complaintsSnapshot.docs.filter(doc => {
          const complaint = doc.data();
          return complaint.status === 'open';
        }).length;

        // Fetch activities count as projects
        const activitiesSnapshot = await getDocs(collection(db, 'activities'));
        const totalProjects = activitiesSnapshot.size;

        // Calculate new registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newRegistrations = usersSnapshot.docs.filter(doc => {
          const user = doc.data();
          const createdAt = user.createdAt ? user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt) : null;
          return createdAt && createdAt >= sevenDaysAgo;
        }).length;

        // Calculate active participants (users who have participated in events)
        // For now, we'll just use total users as active participants
        const activeParticipants = totalUsers;

        // Calculate completed events
        const completedEvents = eventsSnapshot.docs.filter(doc => {
          const event = doc.data();
          const endDate = event.endDate ? new Date(event.endDate) : null;
          return endDate && endDate < currentDate; // Past events
        }).length;

        setStats({
          totalUsers,
          activeEvents,
          pendingComplaints,
          totalProjects,
          totalRevenue: totalEvents * 1000, // Placeholder revenue calculation
          newRegistrations,
          activeParticipants,
          completedEvents
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to mock data if there's an error
        setStats({
          totalUsers: 0,
          activeEvents: 0,
          pendingComplaints: 0,
          totalProjects: 0,
          totalRevenue: 0,
          newRegistrations: 0,
          activeParticipants: 0,
          completedEvents: 0
        });
      }
    };

    fetchStats();
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 sm:hidden">{stat.change.split(' ')[0]}</p> {/* Show only first part on mobile */}
                  <p className="text-xs hidden sm:block text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">New Registrations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Participants</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completed Events</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`${action.color} p-2 sm:p-3 rounded-lg mb-2`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{action.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
        <RecentActivities />
      </div>
    </div>
  );
};

export default AdminDashboard;