import React from 'react';
import RecentActivities from '../components/RecentActivities';

const AdminActivities = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Management</h1>
        <p className="text-gray-600">Manage and monitor recent activities in the system.</p>
      </div>

      <RecentActivities />
    </div>
  );
};

export default AdminActivities;