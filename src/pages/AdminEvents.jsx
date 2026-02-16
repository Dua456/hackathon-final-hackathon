import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Users, MapPin, Clock, Edit, Trash2, Eye, Tag, Filter } from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minParticipants, setMinParticipants] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    status: 'upcoming',
    imageUrl: ''
  });

  const categories = ['all', 'Technology', 'Environment', 'Healthcare', 'Finance', 'Social'];

  // Fetch real event data from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'asc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        const eventsList = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Event',
            description: data.description || 'No description provided',
            startDate: data.startDate ? (typeof data.startDate.toDate === 'function' ? data.startDate.toDate().toISOString().split('T')[0] : data.startDate) : new Date().toISOString().split('T')[0],
            endDate: data.endDate ? (typeof data.endDate.toDate === 'function' ? data.endDate.toDate().toISOString().split('T')[0] : data.endDate) : new Date().toISOString().split('T')[0],
            location: data.location || 'TBD',
            status: data.status || 'upcoming',
            participants: data.participantsCount || 0,
            organizers: data.organizers || [],
            category: data.category || 'General',
            imageUrl: data.imageUrl || ''
          };
        });

        setEvents(eventsList);
        setFilteredEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to empty array if there's an error
        setEvents([]);
        setFilteredEvents([]);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term and selected status
  useEffect(() => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (minParticipants) {
      filtered = filtered.filter(event => event.participants >= parseInt(minParticipants));
    }
    
    if (maxParticipants) {
      filtered = filtered.filter(event => event.participants <= parseInt(maxParticipants));
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, selectedStatus, selectedCategory, minParticipants, maxParticipants, events]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        // Refresh the events list
        const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('startDate', 'asc')));
        const eventsList = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Event',
            description: data.description || 'No description provided',
            startDate: data.startDate ? (typeof data.startDate.toDate === 'function' ? data.startDate.toDate().toISOString().split('T')[0] : data.startDate) : new Date().toISOString().split('T')[0],
            endDate: data.endDate ? (typeof data.endDate.toDate === 'function' ? data.endDate.toDate().toISOString().split('T')[0] : data.endDate) : new Date().toISOString().split('T')[0],
            location: data.location || 'TBD',
            status: data.status || 'upcoming',
            participants: data.participantsCount || 0,
            organizers: data.organizers || [],
            category: data.category || 'General',
            imageUrl: data.imageUrl || ''
          };
        });
        setEvents(eventsList);
        setFilteredEvents(eventsList);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: newStatus });
      // Update local state
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled'];

  const openEditModal = (event) => {
    setCurrentEvent(event);
    // Ensure dates are in the proper format for date inputs (YYYY-MM-DD)
    const formattedStartDate = event.startDate instanceof Date 
      ? event.startDate.toISOString().split('T')[0] 
      : event.startDate;
    const formattedEndDate = event.endDate instanceof Date 
      ? event.endDate.toISOString().split('T')[0] 
      : event.endDate;
      
    setEventForm({
      title: event.title,
      description: event.description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      location: event.location,
      category: event.category,
      status: event.status,
      imageUrl: event.imageUrl
    });
    setShowModal(true);
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEvent(null);
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      category: '',
      status: 'upcoming',
      imageUrl: ''
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();

    if (!eventForm.title || !eventForm.startDate || !eventForm.endDate) {
      alert('Title, start date, and end date are required');
      return;
    }

    try {
      // Convert date strings to Date objects for Firestore
      const startDateObj = eventForm.startDate ? new Date(eventForm.startDate) : new Date();
      const endDateObj = eventForm.endDate ? new Date(eventForm.endDate) : new Date();

      if (currentEvent) {
        // Update existing event
        await updateDoc(doc(db, 'events', currentEvent.id), {
          title: eventForm.title,
          description: eventForm.description,
          startDate: startDateObj,
          endDate: endDateObj,
          location: eventForm.location,
          category: eventForm.category,
          status: eventForm.status,
          imageUrl: eventForm.imageUrl
        });
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), {
          title: eventForm.title,
          description: eventForm.description,
          startDate: startDateObj,
          endDate: endDateObj,
          location: eventForm.location,
          category: eventForm.category,
          status: eventForm.status,
          imageUrl: eventForm.imageUrl,
          createdAt: new Date(),
          participantsCount: 0
        });
      }

      // Close modal and refresh events
      setShowModal(false);
      setEventForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        category: '',
        status: 'upcoming',
        imageUrl: ''
      });
      setCurrentEvent(null);
      
      // Refresh the events list
      const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('startDate', 'asc')));
      const eventsList = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Event',
          description: data.description || 'No description provided',
          startDate: data.startDate ? (typeof data.startDate.toDate === 'function' ? data.startDate.toDate().toISOString().split('T')[0] : data.startDate) : new Date().toISOString().split('T')[0],
          endDate: data.endDate ? (typeof data.endDate.toDate === 'function' ? data.endDate.toDate().toISOString().split('T')[0] : data.endDate) : new Date().toISOString().split('T')[0],
          location: data.location || 'TBD',
          status: data.status || 'upcoming',
          participants: data.participantsCount || 0,
          organizers: data.organizers || [],
          category: data.category || 'General',
          imageUrl: data.imageUrl || ''
        };
      });
      setEvents(eventsList);
      setFilteredEvents(eventsList);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600">Manage all hackathons and events in the system</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Min participants"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={minParticipants}
            onChange={(e) => setMinParticipants(e.target.value)}
          />
          
          <input
            type="number"
            placeholder="Max participants"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedCategory('all');
              setMinParticipants('');
              setMaxParticipants('');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setCurrentEvent(null);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>

              {event.imageUrl && (
                <div className="mb-4">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden"> {/* Fallback div */}
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.startDate} - {event.endDate}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participants} participants
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="h-4 w-4 mr-2" />
                  {event.category}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Organizers: {event.organizers.slice(0, 2).join(', ')}
                  {event.organizers.length > 2 && ` +${event.organizers.length - 2}`}
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-green-600 hover:text-green-900"
                    onClick={() => openEditModal(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Events</h3>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Events</h3>
          <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'upcoming').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ongoing Events</h3>
          <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'ongoing').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Participants</h3>
          <p className="text-2xl font-bold text-gray-900">{events.reduce((sum, event) => sum + event.participants, 0)}</p>
        </div>
      </div>

      {/* Modal for creating/editing events */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {currentEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventForm.startDate}
                      onChange={handleEventFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={eventForm.endDate}
                      onChange={handleEventFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={eventForm.location}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={eventForm.category}
                      onChange={handleEventFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="Technology">Technology</option>
                      <option value="Environment">Environment</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={eventForm.status}
                      onChange={handleEventFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={eventForm.imageUrl}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/event-image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {currentEvent ? 'Update Event' : 'Create Event'}
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

export default AdminEvents;