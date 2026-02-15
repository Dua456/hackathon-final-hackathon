import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Filter, Download } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJoinDate, setSelectedJoinDate] = useState('');

  // Mock user data - in a real app, this would come from your backend/Firebase
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinDate: '2024-01-15', events: 5 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'participant', status: 'active', joinDate: '2024-02-01', events: 2 },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'organizer', status: 'inactive', joinDate: '2024-01-20', events: 1 },
      { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'participant', status: 'active', joinDate: '2024-02-10', events: 3 },
      { id: 5, name: 'David Brown', email: 'david@example.com', role: 'volunteer', status: 'active', joinDate: '2024-01-05', events: 4 },
      { id: 6, name: 'Lisa Davis', email: 'lisa@example.com', role: 'participant', status: 'suspended', joinDate: '2024-02-05', events: 1 },
      { id: 7, name: 'Tom Wilson', email: 'tom@example.com', role: 'organizer', status: 'active', joinDate: '2024-01-10', events: 2 },
      { id: 8, name: 'Amy Taylor', email: 'amy@example.com', role: 'participant', status: 'active', joinDate: '2024-02-12', events: 1 },
    ];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Filter users based on search term and selected role
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }
    
    if (selectedJoinDate) {
      filtered = filtered.filter(user => user.joinDate.startsWith(selectedJoinDate));
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, selectedStatus, selectedJoinDate, users]);

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const updateUserStatus = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const roles = ['all', 'admin', 'organizer', 'participant', 'volunteer'];
  const statuses = ['active', 'inactive', 'suspended'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all users in the system</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedJoinDate}
            onChange={(e) => setSelectedJoinDate(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => {
              setSearchTerm('');
              setSelectedRole('all');
              setSelectedStatus('all');
              setSelectedJoinDate('');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                    >
                      {roles.slice(1).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={user.status}
                      onChange={(e) => updateUserStatus(user.id, e.target.value)}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.events}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">New This Month</h3>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => new Date(u.joinDate) >= new Date(new Date().setMonth(new Date().getMonth() - 1))).length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;