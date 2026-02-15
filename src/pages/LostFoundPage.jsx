import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card'; // assuming you have these
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Package, PackageCheck, Camera, MapPin, Calendar, User, AlertCircle } from 'lucide-react';

export default function LostFoundPage() {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('lost');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    when: '',
    where: '',
    contact: currentUser?.email || currentUser?.phoneNumber || '',
    image: null
  });

  useEffect(() => {
    if (currentUser) {
      fetchItems();
    } else {
      console.warn("No currentUser → skipping fetch");
      setFetchError("Please log in to view items");
    }
  }, [currentUser]);

  const fetchItems = async () => {
    setFetchError(null);
    setLoading(true);
    try {
      console.log("Fetching lost items...");
      const lostQuery = query(
        collection(db, 'lostItems'),
        orderBy('timestamp', 'desc')
      );
      const lostSnap = await getDocs(lostQuery);
      const lostList = lostSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Lost items count:", lostList.length);

      console.log("Fetching found items...");
      const foundQuery = query(
        collection(db, 'foundItems'),
        orderBy('timestamp', 'desc')
      );
      const foundSnap = await getDocs(foundQuery);
      const foundList = foundSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Found items count:", foundList.length);

      setLostItems(lostList);
      setFoundItems(foundList);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError(err.message || "Failed to load items. Check console.");
      toast.error("Could not load lost & found items");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to post");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        const path = `${modalType}/${Date.now()}_${formData.image.name}`;
        const imageRef = ref(storage, path);
        const snap = await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const collectionName = modalType === 'lost' ? 'lostItems' : 'foundItems';

      await addDoc(collection(db, collectionName), {
        ...formData,
        image: null,           // don't save File object
        imageUrl,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        claimed: false,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString() // fallback for easier debugging
      });

      toast.success(`Posted in ${modalType} items!`);
      setFormData({
        itemName: '', description: '', when: '', where: '', contact: currentUser?.email || '', image: null
      });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error("Post error:", err);
      toast.error("Failed to post item: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const claimItem = async (itemId, collectionName) => {
    if (!currentUser) return toast.error("Login required");
    
    try {
      const itemRef = doc(db, collectionName, itemId);
      await updateDoc(itemRef, { 
        claimed: true,
        claimedBy: currentUser.uid,
        claimedAt: serverTimestamp()
      });
      toast.success("Item claimed!");
      fetchItems();
    } catch (err) {
      console.error("Claim error:", err);
      toast.error("Failed to claim");
    }
  };

  const ItemCard = ({ item, collectionName }) => (
    <Card className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 hover:border-indigo-500/30 transition-all">
      <CardContent className="p-5">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.itemName}
            className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
            onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-500" />
          </div>
        )}

        <h3 className="font-bold text-lg text-white mb-2">{item.itemName}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.description}</p>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> <span>{item.when || '—'}</span></div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{item.where || '—'}</span></div>
          <div className="flex items-center gap-2"><User className="h-4 w-4" /> <span>Contact: {item.contact || '—'}</span></div>
          <div className="text-xs opacity-80">Posted by: {item.userName || 'Anonymous'}</div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            item.claimed 
              ? 'bg-green-900/40 text-green-400 border border-green-700/50' 
              : 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50'
          }`}>
            {item.claimed ? 'Claimed' : 'Available'}
          </span>

          {!item.claimed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => claimItem(item.id, collectionName)}
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-950/50 hover:text-indigo-300"
            >
              Claim Item
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Debug / Force visible post button area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Lost & Found</h1>
          <p className="text-gray-400 mt-1">Report lost items or items you've found</p>
        </div>

        {/* POST BUTTON – made more prominent */}
        <Button
          onClick={() => {
            setModalType(activeTab);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-5 text-base font-medium shadow-lg shadow-indigo-900/30"
          disabled={!currentUser}
        >
          <Camera className="mr-2 h-5 w-5" />
          Post {activeTab === 'lost' ? 'Lost' : 'Found'} Item
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-1 -mb-px">
          <button
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('lost')}
          >
            <Package className="h-5 w-5" />
            Lost Items
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'found'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('found')}
          >
            <PackageCheck className="h-5 w-5" />
            Found Items
          </button>
        </div>
      </div>

      {/* Error / Loading state */}
      {fetchError && (
        <div className="bg-red-950/40 border border-red-800 text-red-200 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {loading && !fetchError && (
        <div className="text-center py-12 text-gray-400">Loading items...</div>
      )}

      {/* Items Grid */}
      {!loading && !fetchError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'lost' ? (
            lostItems.length > 0 ? (
              lostItems.map(item => (
                <ItemCard key={item.id} item={item} collectionName="lostItems" />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <Package className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-xl text-gray-300">No lost items reported yet</p>
                <p className="text-gray-500 mt-2">Be the first to post!</p>
              </div>
            )
          ) : (
            foundItems.length > 0 ? (
              foundItems.map(item => (
                <ItemCard key={item.id} item={item} collectionName="foundItems" />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <PackageCheck className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-xl text-gray-300">No found items reported yet</p>
                <p className="text-gray-500 mt-2">Help someone by posting!</p>
              </div>
            )
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/*                POST MODAL                        */}
      {/* ────────────────────────────────────────────── */}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Post {modalType === 'lost' ? 'Lost' : 'Found'} Item
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Item Name *</label>
              <input
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Black Wireless Earbuds"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Color, model, special marks, condition..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">When *</label>
                <input
                  type="date"
                  name="when"
                  value={formData.when}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Where *</label>
                <input
                  type="text"
                  name="where"
                  value={formData.where}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Library 2nd floor"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Info *</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Phone or email for contact"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600/30 file:text-indigo-300 hover:file:bg-indigo-600/50"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}