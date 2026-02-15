import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  X,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Complaints = () => {
  const [showModal, setShowModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Others',
    description: '',
    location: '',
    urgency: 'Medium',
    imageUrl: ''
  });

  const { currentUser } = useAuth();

  const categories = [
    'Electricity', 
    'Water', 
    'Internet', 
    'AC', 
    'Cleanliness', 
    'Others'
  ];
  
  const urgencies = [
    { value: 'Low', color: 'text-green-400 bg-green-500/20' },
    { value: 'Medium', color: 'text-yellow-400 bg-yellow-500/20' },
    { value: 'High', color: 'text-red-400 bg-red-500/20' }
  ];

  const statuses = [
    { value: 'Pending', icon: Clock, color: 'text-yellow-400 bg-yellow-500/20' },
    { value: 'In Progress', icon: AlertCircle, color: 'text-blue-400 bg-blue-500/20' },
    { value: 'Resolved', icon: CheckCircle, color: 'text-green-400 bg-green-500/20' }
  ];

  useEffect(() => {
    fetchComplaints();
  }, [viewMode]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, selectedCategory, selectedUrgency, selectedStatus]);

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }

    // Apply urgency filter
    if (selectedUrgency !== 'All') {
      filtered = filtered.filter(complaint => complaint.urgency === selectedUrgency);
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(complaint => complaint.status === selectedStatus);
    }

    setFilteredComplaints(filtered);
  };

  const fetchComplaints = async () => {
    try {
      let q;
      if (viewMode === 'my') {
        q = query(collection(db, 'complaints'), where('userId', '==', currentUser.uid));
      } else {
        q = query(collection(db, 'complaints'));
      }

      const querySnapshot = await getDocs(q);

      const complaintsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setComplaints(complaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'complaints'), {
        ...formData,
        image: formData.imageUrl, // Use the URL directly
        userId: currentUser.uid,
        status: 'Pending',
        createdAt: new Date()
      });

      toast.success('Complaint submitted successfully!');
      setShowModal(false);
      resetForm();
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, {
        status: newStatus
      });
      
      toast.success(`Complaint status updated to ${newStatus}`);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Others',
      description: '',
      location: '',
      urgency: 'Medium',
      imageUrl: ''
    });
  };

  const ComplaintCard = ({ complaint }) => {
    const StatusIcon = statuses.find(s => s.value === complaint.status)?.icon || Clock;

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {complaint.image ? (
              <img
                src={complaint.image}
                alt={complaint.title}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Flag className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="hidden"> {/* Fallback div */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Flag className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                <p className="text-gray-600 mt-1">{complaint.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statuses.find(s => s.value === complaint.status)?.color || 'bg-gray-100 text-gray-600'
                } flex items-center`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {complaint.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  urgencies.find(u => u.value === complaint.urgency)?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {complaint.urgency} Urgency
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {complaint.category}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {complaint.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {complaint.createdAt?.toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {complaint.userId === currentUser.uid ? 'Me' : 'Other User'}
              </div>
            </div>

            {viewMode === 'all' && complaint.userId !== currentUser.uid && (
              <div className="mt-4 flex space-x-2">
                {statuses.map(status => (
                  <button
                    key={status.value}
                    onClick={() => updateComplaintStatus(complaint.id, status.value)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      complaint.status === status.value
                        ? `${status.color} ring-2 ring-offset-2 ring-offset-white ring-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600">Submit and track complaints</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Complaint
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setViewMode('my')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
            viewMode === 'my'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Complaints
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
            viewMode === 'all'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Complaints
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search complaints..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={selectedUrgency}
          onChange={(e) => setSelectedUrgency(e.target.value)}
        >
          <option value="All">All Urgencies</option>
          {urgencies.map(urgency => (
            <option key={urgency.value} value={urgency.value}>{urgency.value}</option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.value}</option>
          ))}
        </select>
        
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setSelectedUrgency('All');
            setSelectedStatus('All');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No complaints found</p>
            <p className="text-gray-500 text-sm mt-1">
              {viewMode === 'my'
                ? 'Submit your first complaint!'
                : 'No complaints match your filters.'}
            </p>
          </div>
        ) : (
          filteredComplaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        )}
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Submit Complaint
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter complaint title"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency *
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      {urgencies.map(urgency => (
                        <option key={urgency.value} value={urgency.value}>{urgency.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe your complaint in detail"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Where is the issue located?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
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

export default Complaints;