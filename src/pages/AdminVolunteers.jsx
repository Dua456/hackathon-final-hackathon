import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Hash, Building, Calendar, Wrench, Clock, MessageSquare, Eye, Trash2, Edit3 } from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [submittedFromDate, setSubmittedFromDate] = useState('');
  const [submittedToDate, setSubmittedToDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVolunteerData, setEditVolunteerData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    skills: [],
    availability: [],
    image: ''
  });

  // Fetch all skills from the volunteers to populate the filter
  const [allSkills, setAllSkills] = useState([]);

  // Fetch volunteer data from Firebase
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const volunteersQuery = query(collection(db, 'volunteers'), orderBy('createdAt', 'desc'));
        const volunteersSnapshot = await getDocs(volunteersQuery);

        const volunteersList = volunteersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || '' // Handle both field names
          };
        });

        setVolunteers(volunteersList);
        setFilteredVolunteers(volunteersList);
        
        // Extract all unique skills for the filter
        const allVolunteerSkills = volunteersList.flatMap(volunteer => volunteer.skills || []);
        const uniqueSkills = [...new Set(allVolunteerSkills)];
        setAllSkills(uniqueSkills);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        // Fallback to empty array if there's an error
        setVolunteers([]);
        setFilteredVolunteers([]);
      }
    };

    fetchVolunteers();
  }, []);

  // Filter volunteers based on search term and filters
  useEffect(() => {
    let filtered = volunteers;

    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.department === selectedDepartment);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.year === selectedYear);
    }

    if (selectedSkill !== 'all') {
      filtered = filtered.filter(volunteer => 
        volunteer.skills && volunteer.skills.includes(selectedSkill)
      );
    }

    if (submittedFromDate) {
      filtered = filtered.filter(volunteer =>
        new Date(volunteer.submittedAt) >= new Date(submittedFromDate)
      );
    }

    if (submittedToDate) {
      filtered = filtered.filter(volunteer =>
        new Date(volunteer.submittedAt) <= new Date(submittedToDate)
      );
    }

    setFilteredVolunteers(filtered);
  }, [searchTerm, selectedDepartment, selectedYear, selectedSkill, submittedFromDate, submittedToDate, volunteers]);

  const handleDeleteVolunteer = async (volunteerId) => {
    if (window.confirm('Are you sure you want to delete this volunteer registration?')) {
      try {
        await deleteDoc(doc(db, 'volunteers', volunteerId));
        
        // Refresh the volunteers list
        const volunteersQuery = query(collection(db, 'volunteers'), orderBy('createdAt', 'desc'));
        const volunteersSnapshot = await getDocs(volunteersQuery);

        const volunteersList = volunteersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
            imageUrl: data.image || data.imageUrl || '' // Handle both field names
          };
        });

        setVolunteers(volunteersList);
        setFilteredVolunteers(volunteersList);
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const getDepartmentOptions = () => {
    const departments = [...new Set(volunteers.map(volunteer => volunteer.department))];
    return ['all', ...departments];
  };

  const getYearOptions = () => {
    const years = [...new Set(volunteers.map(volunteer => volunteer.year))];
    return ['all', ...years];
  };

  const openViewModal = (volunteer) => {
    setCurrentVolunteer(volunteer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentVolunteer(null);
  };

  const openEditModal = (volunteer) => {
    setEditVolunteerData({
      name: volunteer.name || '',
      rollNumber: volunteer.rollNumber || '',
      department: volunteer.department || '',
      year: volunteer.year || '',
      skills: Array.isArray(volunteer.skills) ? volunteer.skills : [],
      availability: Array.isArray(volunteer.availability) ? volunteer.availability : [],
      image: volunteer.image || volunteer.imageUrl || ''
    });
    setCurrentVolunteer(volunteer);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentVolunteer(null);
    setEditVolunteerData({
      name: '',
      rollNumber: '',
      department: '',
      year: '',
      skills: [],
      availability: [],
      image: ''
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditVolunteerData({ ...editVolunteerData, [name]: value });
  };

  const handleEditSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditVolunteerData({ ...editVolunteerData, skills });
  };

  const handleEditAvailabilityChange = (e) => {
    const availability = e.target.value.split(',').map(day => day.trim()).filter(day => day);
    setEditVolunteerData({ ...editVolunteerData, availability });
  };

  const handleUpdateVolunteer = async (e) => {
    e.preventDefault();

    if (!editVolunteerData.name || !editVolunteerData.rollNumber || !editVolunteerData.department || !editVolunteerData.year) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'volunteers', currentVolunteer.id), {
        ...editVolunteerData,
        image: editVolunteerData.image,
        updatedAt: new Date()
      });

      // Close modal and refresh volunteers
      closeEditModal();

      // Refresh the volunteers list
      const volunteersQuery = query(collection(db, 'volunteers'), orderBy('createdAt', 'desc'));
      const volunteersSnapshot = await getDocs(volunteersQuery);

      const volunteersList = volunteersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : data.createdAt : new Date().toLocaleString(),
          imageUrl: data.image || data.imageUrl || '' // Handle both field names
        };
      });

      setVolunteers(volunteersList);
      setFilteredVolunteers(volunteersList);
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert(`Error updating volunteer: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
        <p className="text-gray-600">Manage and review volunteer registrations</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search volunteers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {getDepartmentOptions().filter(opt => opt !== 'all').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {getYearOptions().filter(opt => opt !== 'all').map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="all">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

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
              setSelectedDepartment('all');
              setSelectedYear('all');
              setSelectedSkill('all');
              setSubmittedFromDate('');
              setSubmittedToDate('');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {volunteer.imageUrl ? (
                      <img
                        src={volunteer.imageUrl}
                        alt={volunteer.name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'table-cell';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{volunteer.name}</div>
                    <div className="text-sm text-gray-500">Roll: {volunteer.rollNumber}</div>
                    <div className="text-sm text-gray-500 mt-1">{volunteer.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {(volunteer.skills || []).slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {volunteer.skills && volunteer.skills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          +{volunteer.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {(volunteer.availability || []).slice(0, 2).map((day, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                      {volunteer.availability && volunteer.availability.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          +{volunteer.availability.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {volunteer.submittedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openViewModal(volunteer)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openEditModal(volunteer)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteVolunteer(volunteer.id)}
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

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No volunteers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volunteers</h3>
          <p className="text-2xl font-bold text-gray-900">{volunteers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Departments</h3>
          <p className="text-2xl font-bold text-gray-900">{new Set(volunteers.map(v => v.department)).size}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Most Common Skill</h3>
          <p className="text-2xl font-bold text-gray-900">
            {volunteers.length > 0 
              ? [...new Set(volunteers.flatMap(v => v.skills || []))].sort((a, b) => 
                  volunteers.filter(v => (v.skills || []).includes(b)).length - 
                  volunteers.filter(v => (v.skills || []).includes(a)).length
                )[0] || 'N/A'
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
          <p className="text-2xl font-bold text-gray-900">
            {volunteers.filter(v => {
              const volunteerDate = new Date(v.submittedAt);
              const now = new Date();
              return volunteerDate.getMonth() === now.getMonth() && 
                     volunteerDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Modal for viewing volunteer details */}
      {showModal && currentVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Volunteer Details</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {currentVolunteer.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={currentVolunteer.imageUrl}
                      alt={currentVolunteer.name}
                      className="w-32 h-32 object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden"> {/* Fallback div */}
                      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentVolunteer.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
                    <p className="text-gray-900">{currentVolunteer.rollNumber}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Department</h4>
                    <p className="text-gray-900">{currentVolunteer.department}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Year</h4>
                    <p className="text-gray-900">{currentVolunteer.year}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                    <p className="text-gray-900">{currentVolunteer.submittedAt}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(currentVolunteer.skills || []).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Availability</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(currentVolunteer.availability || []).map((day, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {currentVolunteer.imageUrl && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Profile Image</h4>
                      <div className="mt-2">
                        <img
                          src={currentVolunteer.imageUrl}
                          alt="Profile"
                          className="w-48 h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden"> {/* Fallback div */}
                          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                      </div>
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
                      handleDeleteVolunteer(currentVolunteer.id);
                      closeModal();
                    }}
                  >
                    Delete Volunteer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Volunteer</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateVolunteer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editVolunteerData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={editVolunteerData.rollNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={editVolunteerData.department}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <select
                      name="year"
                      value={editVolunteerData.year}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    value={Array.isArray(editVolunteerData.skills) ? editVolunteerData.skills.join(', ') : editVolunteerData.skills}
                    onChange={handleEditSkillsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Web Development, Mobile Development, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <input
                    type="text"
                    value={Array.isArray(editVolunteerData.availability) ? editVolunteerData.availability.join(', ') : editVolunteerData.availability}
                    onChange={handleEditAvailabilityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Monday, Tuesday, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate days with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={editVolunteerData.image}
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
                    Update Volunteer
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

export default AdminVolunteers;