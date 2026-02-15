import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ComplaintsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'all', 'my'
  const [complaints, setComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    image: null
  });

  const categories = ['Electricity', 'Water', 'Internet', 'AC', 'Cleanliness', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // Fetch all complaints
      const allComplaintsQuery = query(
        collection(db, 'complaints'),
        orderBy('timestamp', 'desc')
      );
      const allComplaintsSnapshot = await getDocs(allComplaintsQuery);
      const allComplaints = allComplaintsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch user's complaints
      const myComplaintsQuery = query(
        collection(db, 'complaints'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const myComplaintsSnapshot = await getDocs(myComplaintsQuery);
      const myComplaintsList = myComplaintsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setComplaints(allComplaints);
      setMyComplaints(myComplaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (formData.image) {
        const imageRef = ref(storage, `complaints/${Date.now()}_${formData.image.name}`);
        const snapshot = await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'complaints'), {
        ...formData,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        imageUrl,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      toast.success('Complaint submitted successfully!');
      setFormData({
        category: '',
        title: '',
        description: '',
        location: '',
        priority: 'medium',
        image: null
      });
      
      // Refresh complaints list
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to submit complaint');
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, { status: newStatus });
      toast.success(`Complaint status updated to ${newStatus}`);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update complaint status');
      console.error('Error updating complaint status:', error);
    }
  };

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

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'low':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const ComplaintCard = ({ complaint }) => (
    <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white">{complaint.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{complaint.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Category: {complaint.category}</span>
              <span>Location: {complaint.location}</span>
              <span>{new Date(complaint.timestamp?.toDate ? complaint.timestamp.toDate() : complaint.timestamp).toLocaleString()}</span>
            </div>
          </div>
          {complaint.userId === currentUser.uid && (
            <div className="flex flex-col gap-1 ml-4">
              <select
                value={complaint.status}
                onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                className="text-xs bg-gray-700 text-white rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>
        {complaint.imageUrl && (
          <div className="mt-3">
            <img 
              src={complaint.imageUrl} 
              alt="Complaint" 
              className="max-w-xs max-h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Complaints & Issues</h1>
        <p className="text-gray-400 mt-2">Report problems or view existing complaints</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'submit'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Complaint
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'all'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Complaints
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'my'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('my')}
        >
          My Complaints
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'submit' && (
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Submit New Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority.toLowerCase()}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Where is the issue located?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-neon hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'all' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">All Complaints</h2>
          {complaints.length > 0 ? (
            complaints.map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">No complaints found</p>
          )}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">My Complaints</h2>
          {myComplaints.length > 0 ? (
            myComplaints.map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">You haven't submitted any complaints</p>
          )}
        </div>
      )}
    </div>
  );
}