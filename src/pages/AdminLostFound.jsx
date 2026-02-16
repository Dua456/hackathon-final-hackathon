import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, PackageCheck, User, MapPin, Calendar, Clock, CheckCircle, XCircle, Eye, Trash2, Edit3 } from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const AdminLostFound = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [submittedFromDate, setSubmittedFromDate] = useState('');
  const [submittedToDate, setSubmittedToDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemData, setEditItemData] = useState({
    itemName: '',
    description: '',
    date: '',
    location: '',
    contact: '',
    category: 'Others',
    imageUrl: ''
  });

  const categories = ['all', 'Phone', 'Wallet', 'Bag', 'Electronics', 'Others'];
  const types = ['all', 'lost', 'found'];

  // Fetch lost and found items from Firebase
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Get both lost and found items
        const lostItemsQuery = query(collection(db, 'lostItems'), orderBy('createdAt', 'desc'));
        const foundItemsQuery = query(collection(db, 'foundItems'), orderBy('createdAt', 'desc'));
        
        const [lostItemsSnapshot, foundItemsSnapshot] = await Promise.all([
          getDocs(lostItemsQuery),
          getDocs(foundItemsQuery)
        ]);

        const lostItemsList = lostItemsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            type: 'lost',
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || ''
          };
        });

        const foundItemsList = foundItemsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            type: 'found',
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || ''
          };
        });

        const allItems = [...lostItemsList, ...foundItemsList];
        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        // Fallback to empty array if there's an error
        setItems([]);
        setFilteredItems([]);
      }
    };

    fetchItems();
  }, []);

  // Filter items based on search term, status, and other filters
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'claimed') {
        filtered = filtered.filter(item => item.claimed === true);
      } else if (selectedStatus === 'available') {
        filtered = filtered.filter(item => item.claimed !== true);
      }
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedLocation) {
      filtered = filtered.filter(item =>
        item.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (submittedFromDate) {
      filtered = filtered.filter(item =>
        new Date(item.submittedAt) >= new Date(submittedFromDate)
      );
    }

    if (submittedToDate) {
      filtered = filtered.filter(item =>
        new Date(item.submittedAt) <= new Date(submittedToDate)
      );
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedStatus, selectedCategory, selectedType, selectedLocation, submittedFromDate, submittedToDate, items]);

  const handleDeleteItem = async (itemId, itemType) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const collectionName = itemType === 'lost' ? 'lostItems' : 'foundItems';
        await deleteDoc(doc(db, collectionName, itemId));
        
        // Refresh the items list
        const lostItemsQuery = query(collection(db, 'lostItems'), orderBy('createdAt', 'desc'));
        const foundItemsQuery = query(collection(db, 'foundItems'), orderBy('createdAt', 'desc'));
        
        const [lostItemsSnapshot, foundItemsSnapshot] = await Promise.all([
          getDocs(lostItemsQuery),
          getDocs(foundItemsQuery)
        ]);

        const lostItemsList = lostItemsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            type: 'lost',
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || ''
          };
        });

        const foundItemsList = foundItemsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            type: 'found',
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || ''
          };
        });

        const allItems = [...lostItemsList, ...foundItemsList];
        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const updateItemClaimStatus = async (itemId, itemType, newClaimStatus) => {
    try {
      const collectionName = itemType === 'lost' ? 'lostItems' : 'foundItems';
      await updateDoc(doc(db, collectionName, itemId), { claimed: newClaimStatus });
      
      // Update local state
      setItems(items.map(item =>
        item.id === itemId ? { ...item, claimed: newClaimStatus } : item
      ));
    } catch (error) {
      console.error('Error updating item claim status:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeColor = (type) => {
    if (type === 'lost') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  const statuses = ['all', 'available', 'claimed'];

  const openViewModal = (item) => {
    setCurrentItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
  };

  const openEditModal = (item) => {
    setEditItemData({
      itemName: item.itemName || '',
      description: item.description || '',
      date: item.date || new Date().toISOString().split('T')[0],
      location: item.location || '',
      contact: item.contact || '',
      category: item.category || 'Others',
      imageUrl: item.image || item.imageUrl || ''
    });
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentItem(null);
    setEditItemData({
      itemName: '',
      description: '',
      date: '',
      location: '',
      contact: '',
      category: 'Others',
      imageUrl: ''
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItemData({ ...editItemData, [name]: value });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (!editItemData.itemName || !editItemData.description || !editItemData.date || !editItemData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const collectionName = currentItem.type === 'lost' ? 'lostItems' : 'foundItems';
      await updateDoc(doc(db, collectionName, currentItem.id), {
        ...editItemData,
        image: editItemData.imageUrl,
        updatedAt: new Date()
      });

      // Close modal and refresh items
      closeEditModal();

      // Refresh the items list
      const lostItemsQuery = query(collection(db, 'lostItems'), orderBy('createdAt', 'desc'));
      const foundItemsQuery = query(collection(db, 'foundItems'), orderBy('createdAt', 'desc'));

      const [lostItemsSnapshot, foundItemsSnapshot] = await Promise.all([
        getDocs(lostItemsQuery),
        getDocs(foundItemsQuery)
      ]);

      const lostItemsList = lostItemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          type: 'lost',
          submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
          imageUrl: data.image || data.imageUrl || ''
        };
      });

      const foundItemsList = foundItemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          type: 'found',
          submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
          imageUrl: data.image || data.imageUrl || ''
        };
      });

      const allItems = [...lostItemsList, ...foundItemsList];
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Error updating item: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lost & Found Management</h1>
        <p className="text-gray-600">Manage and track lost and found items submitted by users</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search items..."
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
            <option value="available">Available</option>
            <option value="claimed">Claimed</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
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
              setSelectedCategory('all');
              setSelectedType('all');
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

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'table-cell';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.itemName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {item.contact || 'Contact info not provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.claimed)}`}>
                      {item.claimed ? 'Claimed' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {item.submittedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openViewModal(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteItem(item.id, item.type)}
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No lost & found items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Items</h3>
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Lost Items</h3>
          <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.type === 'lost').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Found Items</h3>
          <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.type === 'found').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Claimed Items</h3>
          <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.claimed).length}</p>
        </div>
      </div>

      {/* Modal for viewing item details */}
      {showModal && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {currentItem.imageUrl && (
                  <div>
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.itemName}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentItem.itemName}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(currentItem.type)}`}>
                      {currentItem.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentItem.claimed)}`}>
                      {currentItem.claimed ? 'Claimed' : 'Available'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-700">{currentItem.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="text-gray-900">{currentItem.category}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date Posted</h4>
                    <p className="text-gray-900">{currentItem.submittedAt}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-gray-900">{currentItem.location}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Info</h4>
                    <p className="text-gray-900">{currentItem.contact || 'Not provided'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Claimed</h4>
                    <p className="text-gray-900">{currentItem.claimed ? 'Yes' : 'No'}</p>
                  </div>

                  {currentItem.claimed && currentItem.claimedBy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Claimed By</h4>
                      <p className="text-gray-900">User ID: {currentItem.claimedBy}</p>
                    </div>
                  )}

                  {currentItem.claimed && currentItem.claimedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Claimed At</h4>
                      <p className="text-gray-900">{currentItem.claimedAt?.toDate ? currentItem.claimedAt.toDate().toLocaleString() : currentItem.claimedAt}</p>
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => {
                      handleDeleteItem(currentItem.id, currentItem.type);
                      closeModal();
                    }}
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Item</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    name="itemName"
                    value={editItemData.itemName}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={editItemData.description}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={editItemData.date}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={editItemData.location}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <input
                      type="text"
                      name="contact"
                      value={editItemData.contact}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={editItemData.category}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Phone">Phone</option>
                      <option value="Wallet">Wallet</option>
                      <option value="Bag">Bag</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editItemData.imageUrl}
                    onChange={handleEditInputChange}
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
                    Update Item
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

export default AdminLostFound;