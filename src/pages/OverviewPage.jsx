import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Users, 
  AlertTriangle, 
  Package, 
  PackageCheck,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function OverviewPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    openIssues: 0,
    lostItems: 0,
    foundItems: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch volunteers count
        const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
        const totalVolunteers = volunteersSnapshot.size;

        // Fetch complaints count (open issues)
        const complaintsQuery = query(
          collection(db, 'complaints'),
          where('status', '!=', 'resolved')
        );
        const complaintsSnapshot = await getDocs(complaintsQuery);
        const openIssues = complaintsSnapshot.size;

        // Fetch lost items count
        const lostItemsSnapshot = await getDocs(collection(db, 'lostItems'));
        const lostItems = lostItemsSnapshot.size;

        // Fetch found items count
        const foundItemsSnapshot = await getDocs(collection(db, 'foundItems'));
        const foundItems = foundItemsSnapshot.size;

        setStats({
          totalVolunteers,
          openIssues,
          lostItems,
          foundItems
        });

        // Fetch recent activity (last 5 complaints and lost items)
        const allActivity = [];
        
        // Get recent complaints
        const complaintsQ = query(
          collection(db, 'complaints'),
          // Note: In a real app, we'd order by timestamp, but for simplicity we'll just take the last few
        );
        const complaintsData = await getDocs(complaintsQ);
        complaintsData.forEach(doc => {
          const data = doc.data();
          allActivity.push({
            id: doc.id,
            type: 'complaint',
            title: data.title || 'New complaint',
            description: data.description || '',
            timestamp: data.timestamp || new Date(),
            status: data.status || 'pending'
          });
        });

        // Get recent lost items
        const lostItemsQ = collection(db, 'lostItems');
        const lostItemsData = await getDocs(lostItemsQ);
        lostItemsData.forEach(doc => {
          const data = doc.data();
          allActivity.push({
            id: doc.id,
            type: 'lost',
            title: data.itemName || 'New lost item',
            description: data.description || '',
            timestamp: data.timestamp || new Date(),
            status: 'reported'
          });
        });

        // Sort by timestamp (most recent first) and take last 5
        const sortedActivity = allActivity.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 5);

        setRecentActivity(sortedActivity);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'text-green-400 bg-green-400/10';
      case 'in-progress':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'pending':
      default:
        return 'text-red-400 bg-red-400/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome, {currentUser?.displayName || 'User'}!</h1>
        <p className="text-gray-400 mt-2">Here's what's happening with the hackathon</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Volunteers"
          value={stats.totalVolunteers}
          icon={Users}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          title="Open Issues"
          value={stats.openIssues}
          icon={AlertTriangle}
          color="bg-red-500/20 text-red-400"
        />
        <StatCard
          title="Lost Items"
          value={stats.lostItems}
          icon={Package}
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard
          title="Found Items"
          value={stats.foundItems}
          icon={PackageCheck}
          color="bg-green-500/20 text-green-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 last:pb-0">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.type === 'complaint' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                      <p className="text-sm text-gray-400 truncate">{activity.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp?.toDate ? activity.timestamp.toDate() : activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a 
                href="/dashboard/volunteer" 
                className="flex items-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Users className="h-5 w-5 mr-3 text-indigo-400" />
                <span className="text-white">Become a Volunteer</span>
              </a>
              <a 
                href="/dashboard/complaints" 
                className="flex items-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <AlertTriangle className="h-5 w-5 mr-3 text-red-400" />
                <span className="text-white">Report an Issue</span>
              </a>
              <a 
                href="/dashboard/lost-found" 
                className="flex items-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Package className="h-5 w-5 mr-3 text-orange-400" />
                <span className="text-white">Report Lost Item</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}