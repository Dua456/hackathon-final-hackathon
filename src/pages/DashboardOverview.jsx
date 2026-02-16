import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Package,
  Users,
  CheckCircle,
  Clock,
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import RecentActivitiesDashboard from '../components/RecentActivitiesDashboard';

const DashboardOverview = () => {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    lostItems: 0,
    foundItems: 0,
    volunteers: 0
  });
  // Note: Recent activities are now handled by the RecentActivitiesDashboard component
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints
      const complaintsSnapshot = await getDocs(collection(db, 'complaints'));
      const complaints = complaintsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch lost items
      const lostItemsSnapshot = await getDocs(collection(db, 'lostItems'));
      const lostItems = lostItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch found items
      const foundItemsSnapshot = await getDocs(collection(db, 'foundItems'));
      const foundItems = foundItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch volunteers
      const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
      const volunteers = volunteersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const activeComplaints = complaints.filter(complaint => complaint.status !== 'Resolved').length;

      setStats({
        totalComplaints: complaints.length,
        activeComplaints,
        lostItems: lostItems.length,
        foundItems: foundItems.length,
        volunteers: volunteers.length
      });

      // Recent activities are now handled by the RecentActivitiesDashboard component
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your campus activities today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={AlertTriangle}
          color="yellow"
          subtitle="All submitted complaints"
        />
        <StatCard
          title="Active Complaints"
          value={stats.activeComplaints}
          icon={Clock}
          color="red"
          subtitle="Pending resolution"
        />
        <StatCard
          title="Lost Items"
          value={stats.lostItems}
          icon={Package}
          color="orange"
          subtitle="Currently reported"
        />
        <StatCard
          title="Found Items"
          value={stats.foundItems}
          icon={CheckCircle}
          color="green"
          subtitle="Available for claim"
        />
        <StatCard
          title="Volunteers"
          value={stats.volunteers}
          icon={Users}
          color="blue"
          subtitle="Registered helpers"
        />
        <StatCard
          title="Engagement"
          value="85%"
          icon={TrendingUp}
          color="purple"
          subtitle="Campus participation"
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <RecentActivitiesDashboard />
      </div>
    </div>
  );
};

export default DashboardOverview;