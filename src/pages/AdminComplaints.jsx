import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, User, MapPin, Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

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

  const categories = ['all', 'Electricity', 'Water', 'Internet', 'AC', 'Cleanliness', 'Others'];

  // Fetch real complaint data from Firebase
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const complaintsQuery = query(collection(db, 'complaints'), orderBy('createdAt', 'desc')); // Changed to orderBy createdAt to match student page
        const complaintsSnapshot = await getDocs(complaintsQuery);

        const complaintsList = complaintsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Complaint',
            description: data.description || 'No description provided',
            category: data.category || 'General',
            urgency: data.urgency || 'Medium', // Changed from priority to urgency to match student page
            status: data.status || 'Pending', // Changed default to Pending to match student page
            submittedBy: data.submittedBy || 'Anonymous',
            userId: data.userId || '', // Added userId field to match student page
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : (data.submittedAt ? data.submittedAt.toDate ? data.submittedAt.toDate().toLocaleString() : data.submittedAt : new Date().toLocaleString()),
            location: data.location || 'TBD',
            assignedTo: data.assignedTo || 'Unassigned',
            resolvedAt: data.resolvedAt ? data.resolvedAt.toDate ? data.resolvedAt.toDate().toLocaleString() : data.resolvedAt : null,
            image: data.image || data.imageUrl || '' // Changed to image to match student page
          };
        });

        setComplaints(complaintsList);
        setFilteredComplaints(complaintsList);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        // Fallback to empty array if there's an error
        setComplaints([]);
        setFilteredComplaints([]);
      }
    };

    fetchComplaints();
  }, []);

  // Filter complaints based on search term, status, and urgency
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
      filtered = filtered.filter(complaint => complaint.urgency === selectedPriority);
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

  const handleDeleteComplaint = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await deleteDoc(doc(db, 'complaints', complaintId));
        // Refresh the complaints list
        const complaintsSnapshot = await getDocs(query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))); // Changed to orderBy createdAt to match student page
        const complaintsList = complaintsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Complaint',
            description: data.description || 'No description provided',
            category: data.category || 'General',
            urgency: data.urgency || 'Medium', // Changed from priority to urgency to match student page
            status: data.status || 'Pending', // Changed default to Pending to match student page
            submittedBy: data.submittedBy || 'Anonymous',
            userId: data.userId || '', // Added userId field to match student page
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : (data.submittedAt ? data.submittedAt.toDate ? data.submittedAt.toDate().toLocaleString() : data.submittedAt : new Date().toLocaleString()),
            location: data.location || 'TBD',
            assignedTo: data.assignedTo || 'Unassigned',
            resolvedAt: data.resolvedAt ? data.resolvedAt.toDate ? data.resolvedAt.toDate().toLocaleString() : data.resolvedAt : null,
            image: data.image || data.imageUrl || '' // Changed to image to match student page
          };
        });
        setComplaints(complaintsList);
        setFilteredComplaints(complaintsList);
      } catch (error) {
        console.error('Error deleting complaint:', error);
      }
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), { status: newStatus });
      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint
      ));
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const updateComplaintPriority = async (complaintId, newPriority) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), { priority: newPriority });
      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId ? { ...complaint, priority: newPriority } : complaint
      ));
    } catch (error) {
      console.error('Error updating complaint priority:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    // Handle both old priority values and new urgency values
    const normalizedPriority = priority?.toLowerCase();
    if (normalizedPriority === 'low') {
      return 'bg-green-100 text-green-800';
    } else if (normalizedPriority === 'medium') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (normalizedPriority === 'high') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['all', 'Pending', 'In Progress', 'Resolved', 'archived'];
  const priorities = ['all', 'Low', 'Medium', 'High'];

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
    imageUrl: ''
  });

  const openViewModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowModal(true);
  };

  const openEditModal = (complaint) => {
    setCurrentComplaint(complaint);
    setEditForm({
      title: complaint.title || '',
      description: complaint.description || '',
      category: complaint.category || 'General',
      priority: complaint.urgency || 'Medium', // Changed to urgency to match student page
      location: complaint.location || '',
      imageUrl: complaint.image || complaint.imageUrl || '' // Changed to image to match student page
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentComplaint(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      priority: '',
      location: '',
      imageUrl: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();

    if (!editForm.title || !editForm.description) {
      alert('Title and description are required');
      return;
    }

    try {
      await updateDoc(doc(db, 'complaints', currentComplaint.id), {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        urgency: editForm.priority, // Changed to urgency to match student page
        location: editForm.location,
        image: editForm.imageUrl // Changed to image to match student page
      });

      // Close modal and refresh complaints
      closeEditModal();

      // Refresh the complaints list
      const complaintsSnapshot = await getDocs(query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))); // Changed to orderBy createdAt to match student page
      const complaintsList = complaintsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Complaint',
          description: data.description || 'No description provided',
          category: data.category || 'General',
          urgency: data.urgency || 'Medium', // Changed from priority to urgency to match student page
          status: data.status || 'Pending', // Changed default to Pending to match student page
          submittedBy: data.submittedBy || 'Anonymous',
          userId: data.userId || '', // Added userId field to match student page
          submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : (data.submittedAt ? data.submittedAt.toDate ? data.submittedAt.toDate().toLocaleString() : data.submittedAt : new Date().toLocaleString()),
          location: data.location || 'TBD',
          assignedTo: data.assignedTo || 'Unassigned',
          resolvedAt: data.resolvedAt ? data.resolvedAt.toDate ? data.resolvedAt.toDate().toLocaleString() : data.resolvedAt : null,
          image: data.image || data.imageUrl || '' // Changed to image to match student page
        };
      });
      setComplaints(complaintsList);
      setFilteredComplaints(complaintsList);
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert(`Error updating complaint: ${error.message}`);
    }
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
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
                    {complaint.image ? (
                      <img
                        src={complaint.image}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.urgency)}`}>
                      {complaint.urgency}
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
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openEditModal(complaint)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
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
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Complaints</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">High Urgency</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.urgency === 'High').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved</h3>
          <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status === 'Resolved').length}</p>
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
                {currentComplaint.image && (
                  <div>
                    <img
                      src={currentComplaint.image}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentComplaint.urgency)}`}>
                      {currentComplaint.urgency} urgency
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
                      // Update status to In Progress
                      updateComplaintStatus(currentComplaint.id, 'In Progress');
                      closeModal();
                    }}
                  >
                    Mark as In Progress
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onClick={() => {
                      // Update status to Resolved
                      updateComplaintStatus(currentComplaint.id, 'Resolved');
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

      {/* Edit Modal */}
      {showEditModal && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Complaint</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateComplaint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Technical">Technical</option>
                      <option value="Catering">Catering</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Organization">Organization</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="Internet">Internet</option>
                      <option value="AC">AC</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <select
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editForm.imageUrl}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Complaint
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;