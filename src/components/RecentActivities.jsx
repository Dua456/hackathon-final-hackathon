import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, X, Save, Calendar, Users, AlertTriangle, Trophy, MessageSquare, Loader } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    timestamp: new Date().toISOString(),
    status: 'active'
  });

  // Load activities from Firestore
  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activities: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddActivity = () => {
    setIsEditing(false);
    setCurrentActivity(null);
    setFormData({
      title: '',
      description: '',
      type: 'general',
      timestamp: new Date().toISOString(),
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditActivity = (activity) => {
    setCurrentActivity(activity);
    setIsEditing(true);
    setFormData({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      timestamp: activity.timestamp,
      status: activity.status
    });
    setShowModal(true);
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteDoc(doc(db, 'activities', id));
      } catch (error) {
        console.error("Error deleting activity: ", error);
      }
    }
  };

  const handlePreview = (activity) => {
    setPreviewActivity(activity);
  };

  const handleClosePreview = () => {
    setPreviewActivity(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentActivity) {
        // Update existing activity
        await updateDoc(doc(db, 'activities', currentActivity.id), {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          timestamp: new Date(formData.timestamp),
          status: formData.status,
          icon: getActivityIcon(formData.type)
        });
      } else {
        // Add new activity
        await addDoc(collection(db, 'activities'), {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          timestamp: new Date(formData.timestamp),
          status: formData.status,
          icon: getActivityIcon(formData.type)
        });
      }
      
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'general',
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } catch (error) {
      console.error("Error saving activity: ", error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return 'Users';
      case 'event': return 'Calendar';
      case 'complaint': return 'AlertTriangle';
      case 'project': return 'Trophy';
      case 'message': return 'MessageSquare';
      default: return 'Calendar';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'bg-green-100 text-green-600';
      case 'event': return 'bg-blue-100 text-blue-600';
      case 'complaint': return 'bg-yellow-100 text-yellow-600';
      case 'project': return 'bg-purple-100 text-purple-600';
      case 'message': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateInput) => {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'object' && dateInput.seconds) {
      // Firestore timestamp
      date = new Date(dateInput.seconds * 1000);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = new Date();
    }
    return date.toLocaleString();
  };

  const renderIcon = (iconName) => {
    const props = { className: "h-4 w-4" };
    switch (iconName) {
      case 'Users': return <Users {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'AlertTriangle': return <AlertTriangle {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      default: return <Calendar {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        <button
          onClick={handleAddActivity}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activities. Add your first activity to get started.
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {renderIcon(activity.icon)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(activity)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal for adding/editing activities */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Activity' : 'Add New Activity'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="user">User</option>
                      <option value="event">Event</option>
                      <option value="complaint">Complaint</option>
                      <option value="project">Project</option>
                      <option value="message">Message</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <input
                      type="datetime-local"
                      value={formData.timestamp.slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update' : 'Add'} Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Activity Preview</h3>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(previewActivity.type)}`}>
                    {renderIcon(previewActivity.icon)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">{previewActivity.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(previewActivity.status)}`}>
                        {previewActivity.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{previewActivity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(previewActivity.timestamp)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Type:</span> {previewActivity.type}</div>
                    <div><span className="font-medium">Status:</span> {previewActivity.status}</div>
                    <div><span className="font-medium">Created:</span> {formatDate(previewActivity.timestamp)}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    handleEditActivity(previewActivity);
                    handleClosePreview();
                  }}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleClosePreview}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;