import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Users, MapPin, Clock, Edit, Trash2, Eye, Tag, Filter } from 'lucide-react';

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

  // Mock event data - in a real app, this would come from your backend/Firebase
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'Tech Innovation Hackathon 2024',
        description: 'Annual tech innovation hackathon focusing on AI and blockchain solutions',
        startDate: '2024-03-15',
        endDate: '2024-03-17',
        location: 'Main Campus Auditorium',
        status: 'upcoming',
        participants: 120,
        organizers: ['John Doe', 'Jane Smith'],
        category: 'Technology',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 2,
        title: 'Green Energy Solutions Challenge',
        description: 'Develop sustainable energy solutions for urban environments',
        startDate: '2024-02-20',
        endDate: '2024-02-22',
        location: 'Engineering Building',
        status: 'ongoing',
        participants: 85,
        organizers: ['Mike Johnson', 'Sarah Williams'],
        category: 'Environment',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 3,
        title: 'Healthcare Tech Hackathon',
        description: 'Innovative healthcare technology solutions',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        location: 'Medical Center',
        status: 'completed',
        participants: 95,
        organizers: ['David Brown', 'Lisa Davis'],
        category: 'Healthcare',
        imageUrl: 'https://images.unsplash.com/photo-1551601659-4c83b7b0c3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 4,
        title: 'FinTech Startup Weekend',
        description: 'Build financial technology solutions in 48 hours',
        startDate: '2024-04-05',
        endDate: '2024-04-07',
        location: 'Business School',
        status: 'upcoming',
        participants: 75,
        organizers: ['Tom Wilson', 'Amy Taylor'],
        category: 'Finance',
        imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        id: 5,
        title: 'Social Impact Hackathon',
        description: 'Technology solutions for social good',
        startDate: '2023-12-15',
        endDate: '2023-12-17',
        location: 'Community Center',
        status: 'completed',
        participants: 110,
        organizers: ['John Doe', 'Sarah Williams'],
        category: 'Social',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
    ];
    
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
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

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const updateEventStatus = (eventId, newStatus) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEvent(null);
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
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={currentEvent?.title || ''}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    defaultValue={currentEvent?.description || ''}
                    placeholder="Enter event description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={currentEvent?.startDate || ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={currentEvent?.endDate || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={currentEvent?.location || ''}
                    placeholder="Enter event location"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={currentEvent?.category || ''}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={currentEvent?.status || 'upcoming'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={currentEvent?.imageUrl || ''}
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