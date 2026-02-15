import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, User, MapPin, Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [submittedFromDate, setSubmittedFromDate] = useState('');
  const [submittedToDate, setSubmittedToDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);

  // Mock complaint data - in a real app, this would come from your backend/Firebase
  useEffect(() => {
    const mockComplaints = [
      {
        id: 1,
        title: 'Venue Temperature Issues',
        description: 'The air conditioning in the main hall is not working properly, causing discomfort for participants.',
        category: 'Facilities',
        priority: 'high',
        status: 'open',
        submittedBy: 'John Doe',
        submittedAt: '2024-02-10 14:30',
        location: 'Main Hall A',
        assignedTo: 'Facility Manager',
        imageUrl: 'https://images.unsplash.com/photo-1581578021424-ebdc0b1b01f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 2,
        title: 'WiFi Connectivity Problems',
        description: 'Intermittent WiFi connectivity issues affecting multiple participants in the workshop area.',
        category: 'Technical',
        priority: 'medium',
        status: 'in-progress',
        submittedBy: 'Jane Smith',
        submittedAt: '2024-02-11 09:15',
        location: 'Workshop Room B',
        assignedTo: 'IT Support',
        imageUrl: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 3,
        title: 'Food Quality Concerns',
        description: 'Several participants reported that the lunch quality was below expectations today.',
        category: 'Catering',
        priority: 'low',
        status: 'resolved',
        submittedBy: 'Mike Johnson',
        submittedAt: '2024-02-09 12:45',
        location: 'Cafeteria',
        assignedTo: 'Catering Team',
        resolvedAt: '2024-02-09 15:30',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 4,
        title: 'Parking Space Shortage',
        description: 'Insufficient parking spaces available for mentors and judges arriving for the event.',
        category: 'Logistics',
        priority: 'medium',
        status: 'open',
        submittedBy: 'Sarah Williams',
        submittedAt: '2024-02-12 08:20',
        location: 'Main Entrance',
        assignedTo: 'Logistics Coordinator',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 5,
        title: 'Power Outage in Lab',
        description: 'Complete power outage in Computer Lab 3 affecting ongoing hackathon activities.',
        category: 'Technical',
        priority: 'high',
        status: 'in-progress',
        submittedBy: 'David Brown',
        submittedAt: '2024-02-12 11:10',
        location: 'Computer Lab 3',
        assignedTo: 'Maintenance Team',
        imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 6,
        title: 'Registration Desk Confusion',
        description: 'Long queues and confusion at the registration desk causing delays for participants.',
        category: 'Organization',
        priority: 'medium',
        status: 'resolved',
        submittedBy: 'Lisa Davis',
        submittedAt: '2024-02-08 10:00',
        location: 'Main Lobby',
        assignedTo: 'Registration Team',
        resolvedAt: '2024-02-08 11:45',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
    ];
    
    setComplaints(mockComplaints);
    setFilteredComplaints(mockComplaints);
  }, []);

  // Filter complaints based on search term, status, and priority
  useEffect(() => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === selectedPriority);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter(complaint => 
        complaint.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (submittedFromDate) {
      filtered = filtered.filter(complaint => 
        complaint.submittedAt >= submittedFromDate
      );
    }

    if (submittedToDate) {
      filtered = filtered.filter(complaint => 
        complaint.submittedAt <= submittedToDate
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, selectedStatus, selectedPriority, selectedCategory, selectedLocation, submittedFromDate, submittedToDate, complaints]);

  const handleDeleteComplaint = (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      setComplaints(complaints.filter(complaint => complaint.id !== complaintId));
    }
  };

  const updateComplaintStatus = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint
    ));
  };

  const updateComplaintPriority = (complaintId, newPriority) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId ? { ...complaint, priority: newPriority } : complaint
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['all', 'open', 'in-progress', 'resolved', 'closed'];
  const priorities = ['all', 'low', 'medium', 'high'];

  const openViewModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentComplaint(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-600">Manage and resolve complaints submitted by users</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Location..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={submittedFromDate}
              onChange={(e) => setSubmittedFromDate(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={submittedToDate}
              onChange={(e) => setSubmittedToDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedCategory('all');
              setSelectedLocation('');
              setSubmittedFromDate('');
              setSubmittedToDate('');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {complaint.imageUrl ? (
                      <img
                        src={complaint.imageUrl}
                        alt={complaint.title}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'table-cell';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{complaint.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {complaint.submittedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={complaint.status}
                      onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                    >
                      {statuses.slice(1).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{complaint.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {complaint.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openViewModal(complaint)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteComplaint(complaint.id)}
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
        
        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No complaints found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Complaints</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Open Complaints</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status === 'open').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">High Priority</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.priority === 'high').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Modal for viewing complaint details */}
      {showModal && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {currentComplaint.imageUrl && (
                  <div>
                    <img
                      src={currentComplaint.imageUrl}
                      alt={currentComplaint.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentComplaint.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentComplaint.priority)}`}>
                      {currentComplaint.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentComplaint.status)}`}>
                      {currentComplaint.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-700">{currentComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="text-gray-900">{currentComplaint.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submitted At</h4>
                    <p className="text-gray-900">{currentComplaint.submittedAt}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submitted By</h4>
                    <p className="text-gray-900">{currentComplaint.submittedBy}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-gray-900">{currentComplaint.location}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                    <p className="text-gray-900">{currentComplaint.assignedTo}</p>
                  </div>
                  
                  {currentComplaint.resolvedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Resolved At</h4>
                      <p className="text-gray-900">{currentComplaint.resolvedAt}</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => {
                      // Update status to in-progress
                      updateComplaintStatus(currentComplaint.id, 'in-progress');
                      closeModal();
                    }}
                  >
                    Mark as In Progress
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onClick={() => {
                      // Update status to resolved
                      updateComplaintStatus(currentComplaint.id, 'resolved');
                      closeModal();
                    }}
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;