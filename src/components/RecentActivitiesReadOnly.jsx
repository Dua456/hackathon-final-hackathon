import React, { useState, useEffect } from 'react';
import { Eye, Edit, Calendar, Users, AlertTriangle, Trophy, MessageSquare, Loader, X, Save } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const RecentActivitiesReadOnly = ({ editable = false }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    status: 'active'
  });
  const { isAdmin } = useAuth();

  // Load activities from Firestore
  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData.slice(0, 5)); // Show only the 5 most recent
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activities: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handlePreview = (activity) => {
    setPreviewActivity(activity);
  };

  const handleClosePreview = () => {
    setPreviewActivity(null);
  };

  const handleEditClick = (activity) => {
    setCurrentActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      status: activity.status
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await updateDoc(doc(db, 'activities', currentActivity.id), {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status
      });
      
      setShowEditModal(false);
      setCurrentActivity(null);
    } catch (error) {
      console.error("Error updating activity: ", error);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activities available.
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
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
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
                  {(editable || isAdmin) && (
                    <button
                      onClick={() => handleEditClick(activity)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
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
                    {(editable || isAdmin) && (
                      <button
                        onClick={() => {
                          handleEditClick(previewActivity);
                          handleClosePreview();
                        }}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Edit
                      </button>
                    )}
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

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Activity</h3>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setCurrentActivity(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdate}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleEditInputChange}
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
                          name="status"
                          value={formData.status}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Update Activity
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setCurrentActivity(null);
                        }}
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
        </>
      )}
    </div>
  );
};

export default RecentActivitiesReadOnly;