import React, { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  PackageCheck,
  Calendar,
  MapPin,
  Phone,
  User,
  X,
  Check
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const LostAndFound = () => {
  const [activeTab, setActiveTab] = useState('lost');
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    date: '',
    location: '',
    contact: '',
    category: 'Others',
    imageUrl: ''
  });

  const { currentUser } = useAuth();

  const categories = ['Phone', 'Wallet', 'Bag', 'Electronics', 'Others'];

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory, selectedDate]);

  const filterItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(item => item.date === selectedDate);
    }

    setFilteredItems(filtered);
  };

  const fetchItems = async () => {
    try {
      const collectionName = activeTab === 'lost' ? 'lostItems' : 'foundItems';
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);

      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setItems(itemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
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

    if (!formData.itemName || !formData.description || !formData.date || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const collectionName = activeTab === 'lost' ? 'lostItems' : 'foundItems';

      await addDoc(collection(db, collectionName), {
        ...formData,
        image: formData.imageUrl, // Use the URL directly
        claimed: false,
        userId: currentUser.uid,
        createdAt: new Date()
      });

      toast.success(`${activeTab === 'lost' ? 'Lost' : 'Found'} item posted successfully!`);
      setShowModal(false);
      resetForm();
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to post ${activeTab} item`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    try {
      const collectionName = activeTab === 'lost' ? 'lostItems' : 'foundItems';
      const itemRef = doc(db, collectionName, itemId);
      
      await updateDoc(itemRef, {
        claimed: true,
        claimedBy: currentUser.uid,
        claimedAt: new Date()
      });

      toast.success('Item claimed successfully!');
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error claiming item:', error);
      toast.error('Failed to claim item');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      date: '',
      location: '',
      contact: '',
      category: 'Others',
      imageUrl: ''
    });
  };

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.itemName}
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="hidden"> {/* Fallback div */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.itemName}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.claimed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {item.claimed ? 'Claimed' : 'Available'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(item.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {item.location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {item.category}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {item.contact}
            </div>
          </div>

          {!item.claimed && (
            <div className="mt-4">
              <button
                onClick={() => handleClaim(item.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                Claim Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-600">
            {activeTab === 'lost'
              ? 'Report lost items or view found items'
              : 'Report found items or view lost items'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post {activeTab === 'lost' ? 'Lost' : 'Found'} Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'lost'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="inline mr-2 h-4 w-4" />
          Lost Items
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'found'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PackageCheck className="inline mr-2 h-4 w-4" />
          Found Items
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
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
        
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setSelectedDate('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading {activeTab} items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No {activeTab} items found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>

      {/* Post Modal */}
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
                    Post {activeTab === 'lost' ? 'Lost' : 'Found'} Item
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
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter item name"
                    required
                  />
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
                    placeholder="Describe the item"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      placeholder="Where was it lost/found?"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
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
                    {loading ? 'Posting...' : 'Post Item'}
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

export default LostAndFound;