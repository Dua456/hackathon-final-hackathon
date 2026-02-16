import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Calendar, Package, CheckCircle, Users, AlertTriangle, X, Save, Loader } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const RecentActivitiesDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditActivity, setCurrentEditActivity] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { currentUser } = useAuth();

  // Load all activities from Firestore
  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        // Fetch all collections
        const [complaintsSnapshot, lostItemsSnapshot, foundItemsSnapshot, volunteersSnapshot] = await Promise.all([
          getDocs(collection(db, 'complaints')),
          getDocs(collection(db, 'lostItems')),
          getDocs(collection(db, 'foundItems')),
          getDocs(collection(db, 'volunteers'))
        ]);

        const complaints = complaintsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          collection: 'complaints',
          ...doc.data(), 
          type: 'complaint', 
          timestamp: doc.data().createdAt || doc.data().timestamp 
        }));
        
        const lostItems = lostItemsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          collection: 'lostItems',
          ...doc.data(), 
          type: 'lost', 
          timestamp: doc.data().createdAt || doc.data().timestamp 
        }));
        
        const foundItems = foundItemsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          collection: 'foundItems',
          ...doc.data(), 
          type: 'found', 
          timestamp: doc.data().createdAt || doc.data().timestamp 
        }));
        
        const volunteers = volunteersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          collection: 'volunteers',
          ...doc.data(), 
          type: 'volunteer', 
          timestamp: doc.data().createdAt || doc.data().timestamp 
        }));

        // Combine all activities and sort by timestamp
        const allActivities = [
          ...complaints,
          ...lostItems,
          ...foundItems,
          ...volunteers
        ].filter(activity => activity.timestamp)
        .sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB - dateA; // Sort descending (most recent first)
        })
        .slice(0, 10); // Show top 10 most recent

        setActivities(allActivities);
      } catch (error) {
        console.error("Error fetching activities: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'complaint': return AlertTriangle;
      case 'lost': return Package;
      case 'found': return CheckCircle;
      case 'volunteer': return Users;
      default: return Calendar;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'complaint': return 'bg-yellow-100 text-yellow-600';
      case 'lost': return 'bg-orange-100 text-orange-600';
      case 'found': return 'bg-green-100 text-green-600';
      case 'volunteer': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateInput) => {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'object' && dateInput.toDate) {
      // Firestore timestamp
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = new Date();
    }
    return date.toLocaleString();
  };

  const handlePreview = (activity) => {
    setPreviewActivity(activity);
  };

  const handleClosePreview = () => {
    setPreviewActivity(null);
  };

  const handleEdit = (activity) => {
    setCurrentEditActivity(activity);
    // Set form data based on activity type
    if (activity.type === 'complaint') {
      setEditFormData({
        title: activity.title || '',
        description: activity.description || '',
        category: activity.category || 'Others',
        location: activity.location || '',
        urgency: activity.urgency || 'Medium',
        image: activity.image || activity.imageUrl || ''
      });
    } else if (activity.type === 'lost' || activity.type === 'found') {
      setEditFormData({
        itemName: activity.itemName || '',
        description: activity.description || '',
        date: activity.date || new Date().toISOString().split('T')[0],
        location: activity.location || '',
        contact: activity.contact || '',
        category: activity.category || 'Others',
        image: activity.image || activity.imageUrl || ''
      });
    } else if (activity.type === 'volunteer') {
      setEditFormData({
        name: activity.name || '',
        rollNumber: activity.rollNumber || '',
        department: activity.department || '',
        year: activity.year || '',
        skills: activity.skills || [],
        availability: activity.availability || [],
        image: activity.image || activity.imageUrl || ''
      });
    }
    setShowEditModal(true);
  };

  const handleDelete = async (activity) => {
    if (window.confirm(`Are you sure you want to delete this ${activity.type} activity?`)) {
      try {
        await deleteDoc(doc(db, activity.collection, activity.id));
        // Refresh the activities list
        const fetchAllActivities = async () => {
          try {
            const [complaintsSnapshot, lostItemsSnapshot, foundItemsSnapshot, volunteersSnapshot] = await Promise.all([
              getDocs(collection(db, 'complaints')),
              getDocs(collection(db, 'lostItems')),
              getDocs(collection(db, 'foundItems')),
              getDocs(collection(db, 'volunteers'))
            ]);

            const complaints = complaintsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              collection: 'complaints',
              ...doc.data(), 
              type: 'complaint', 
              timestamp: doc.data().createdAt || doc.data().timestamp 
            }));
            
            const lostItems = lostItemsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              collection: 'lostItems',
              ...doc.data(), 
              type: 'lost', 
              timestamp: doc.data().createdAt || doc.data().timestamp 
            }));
            
            const foundItems = foundItemsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              collection: 'foundItems',
              ...doc.data(), 
              type: 'found', 
              timestamp: doc.data().createdAt || doc.data().timestamp 
            }));
            
            const volunteers = volunteersSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              collection: 'volunteers',
              ...doc.data(), 
              type: 'volunteer', 
              timestamp: doc.data().createdAt || doc.data().timestamp 
            }));

            const allActivities = [
              ...complaints,
              ...lostItems,
              ...foundItems,
              ...volunteers
            ].filter(activity => activity.timestamp)
            .sort((a, b) => {
              const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
              const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
              return dateB - dateA;
            })
            .slice(0, 10);

            setActivities(allActivities);
          } catch (error) {
            console.error("Error fetching activities: ", error);
          }
        };

        fetchAllActivities();
      } catch (error) {
        console.error("Error deleting activity: ", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const activityRef = doc(db, currentEditActivity.collection, currentEditActivity.id);
      
      if (currentEditActivity.type === 'complaint') {
        await updateDoc(activityRef, {
          ...editFormData,
          updatedAt: new Date()
        });
      } else if (currentEditActivity.type === 'lost' || currentEditActivity.type === 'found') {
        await updateDoc(activityRef, {
          ...editFormData,
          updatedAt: new Date()
        });
      } else if (currentEditActivity.type === 'volunteer') {
        // Handle skills and availability as arrays
        const updatedSkills = Array.isArray(editFormData.skills) 
          ? editFormData.skills 
          : editFormData.skills?.split(',').map(skill => skill.trim()).filter(skill => skill) || [];
          
        const updatedAvailability = Array.isArray(editFormData.availability) 
          ? editFormData.availability 
          : editFormData.availability?.split(',').map(day => day.trim()).filter(day => day) || [];

        await updateDoc(activityRef, {
          ...editFormData,
          skills: updatedSkills,
          availability: updatedAvailability,
          updatedAt: new Date()
        });
      }

      setShowEditModal(false);
      setCurrentEditActivity(null);
      
      // Refresh the activities list
      const fetchAllActivities = async () => {
        try {
          const [complaintsSnapshot, lostItemsSnapshot, foundItemsSnapshot, volunteersSnapshot] = await Promise.all([
            getDocs(collection(db, 'complaints')),
            getDocs(collection(db, 'lostItems')),
            getDocs(collection(db, 'foundItems')),
            getDocs(collection(db, 'volunteers'))
          ]);

          const complaints = complaintsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            collection: 'complaints',
            ...doc.data(), 
            type: 'complaint', 
            timestamp: doc.data().createdAt || doc.data().timestamp 
          }));
          
          const lostItems = lostItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            collection: 'lostItems',
            ...doc.data(), 
            type: 'lost', 
            timestamp: doc.data().createdAt || doc.data().timestamp 
          }));
          
          const foundItems = foundItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            collection: 'foundItems',
            ...doc.data(), 
            type: 'found', 
            timestamp: doc.data().createdAt || doc.data().timestamp 
          }));
          
          const volunteers = volunteersSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            collection: 'volunteers',
            ...doc.data(), 
            type: 'volunteer', 
            timestamp: doc.data().createdAt || doc.data().timestamp 
          }));

          const allActivities = [
            ...complaints,
            ...lostItems,
            ...foundItems,
            ...volunteers
          ].filter(activity => activity.timestamp)
          .sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
          })
          .slice(0, 10);

          setActivities(allActivities);
        } catch (error) {
          console.error("Error fetching activities: ", error);
        }
      };

      fetchAllActivities();
    } catch (error) {
      console.error("Error updating activity: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentEditActivity(null);
    setEditFormData({});
  };

  const renderActivityTitle = (activity) => {
    switch (activity.type) {
      case 'complaint':
        return activity.title || 'New Complaint';
      case 'lost':
        return activity.itemName || 'Lost Item Reported';
      case 'found':
        return activity.itemName || 'Found Item Reported';
      case 'volunteer':
        return activity.name ? `${activity.name} registered as volunteer` : 'New Volunteer';
      default:
        return 'New Activity';
    }
  };

  const renderActivityDescription = (activity) => {
    switch (activity.type) {
      case 'complaint':
        return activity.description || 'A new complaint was submitted';
      case 'lost':
        return activity.description || 'A lost item was reported';
      case 'found':
        return activity.description || 'A found item was reported';
      case 'volunteer':
        return activity.department ? `from ${activity.department}` : 'New volunteer registration';
      default:
        return 'An activity was recorded';
    }
  };

  const IconComponent = getActivityIcon(previewActivity?.type);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading recent activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recent activities</p>
          <p className="text-gray-500 text-sm">Your activities will appear here</p>
        </div>
      ) : (
        activities.map((activity, index) => {
          const IconComponent = getActivityIcon(activity.type);
          return (
            <div 
              key={`${activity.collection}-${activity.id}`} 
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{renderActivityTitle(activity)}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{renderActivityDescription(activity)}</p>
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
                {(activity.userId === currentUser.uid || activity.submittedBy === currentUser.uid) && (
                  <>
                    <button
                      onClick={() => handleEdit(activity)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Preview Modal */}
      {previewActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{renderActivityTitle(previewActivity)}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(previewActivity.timestamp)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    {previewActivity.type === 'complaint' && (
                      <>
                        <div><span className="font-medium">Category:</span> {previewActivity.category}</div>
                        <div><span className="font-medium">Urgency:</span> {previewActivity.urgency}</div>
                        <div><span className="font-medium">Location:</span> {previewActivity.location}</div>
                        <div><span className="font-medium">Description:</span> {previewActivity.description}</div>
                      </>
                    )}
                    {(previewActivity.type === 'lost' || previewActivity.type === 'found') && (
                      <>
                        <div><span className="font-medium">Item Name:</span> {previewActivity.itemName}</div>
                        <div><span className="font-medium">Date:</span> {previewActivity.date}</div>
                        <div><span className="font-medium">Location:</span> {previewActivity.location}</div>
                        <div><span className="font-medium">Category:</span> {previewActivity.category}</div>
                        <div><span className="font-medium">Description:</span> {previewActivity.description}</div>
                        {previewActivity.contact && <div><span className="font-medium">Contact:</span> {previewActivity.contact}</div>}
                      </>
                    )}
                    {previewActivity.type === 'volunteer' && (
                      <>
                        <div><span className="font-medium">Name:</span> {previewActivity.name}</div>
                        <div><span className="font-medium">Roll Number:</span> {previewActivity.rollNumber}</div>
                        <div><span className="font-medium">Department:</span> {previewActivity.department}</div>
                        <div><span className="font-medium">Year:</span> {previewActivity.year}</div>
                        <div><span className="font-medium">Skills:</span> {Array.isArray(previewActivity.skills) ? previewActivity.skills.join(', ') : previewActivity.skills}</div>
                        <div><span className="font-medium">Availability:</span> {Array.isArray(previewActivity.availability) ? previewActivity.availability.join(', ') : previewActivity.availability}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {(previewActivity.userId === currentUser.uid || previewActivity.submittedBy === currentUser.uid) && (
                  <>
                    <button
                      onClick={() => {
                        handleEdit(previewActivity);
                        handleClosePreview();
                      }}
                      className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(previewActivity);
                        handleClosePreview();
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={handleClosePreview}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentEditActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit {currentEditActivity.type.charAt(0).toUpperCase() + currentEditActivity.type.slice(1)}</h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                {currentEditActivity.type === 'complaint' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={editFormData.category || 'Others'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
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
                        name="urgency"
                        value={editFormData.urgency || 'Medium'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={editFormData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={editFormData.image || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </>
                )}

                {(currentEditActivity.type === 'lost' || currentEditActivity.type === 'found') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        name="itemName"
                        value={editFormData.itemName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={editFormData.date || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={editFormData.category || 'Others'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="Phone">Phone</option>
                        <option value="Wallet">Wallet</option>
                        <option value="Bag">Bag</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                      <input
                        type="text"
                        name="contact"
                        value={editFormData.contact || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Phone number or email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={editFormData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={editFormData.image || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </>
                )}

                {currentEditActivity.type === 'volunteer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        name="rollNumber"
                        value={editFormData.rollNumber || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={editFormData.department || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <select
                        name="year"
                        value={editFormData.year || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={Array.isArray(editFormData.skills) ? editFormData.skills.join(', ') : editFormData.skills || ''}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          skills: e.target.value.split(',').map(skill => skill.trim())
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Web Development, Mobile Development, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <input
                        type="text"
                        name="availability"
                        value={Array.isArray(editFormData.availability) ? editFormData.availability.join(', ') : editFormData.availability || ''}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          availability: e.target.value.split(',').map(day => day.trim())
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Monday, Tuesday, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={editFormData.image || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
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

export default RecentActivitiesDashboard;