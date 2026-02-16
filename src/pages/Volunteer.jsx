import React, { useState } from 'react';
import { 
  User, 
  Hash, 
  Building, 
  Calendar, 
  Wrench, 
  Clock, 
  MessageSquare, 
  Check,
  X
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { notifyNewVolunteer } from '../utils/notificationService';

const Volunteer = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    skills: [],
    availability: [],
    imageUrl: ''
  });

  const { currentUser } = useAuth();

  const skillsOptions = [
    'Web Development', 
    'Mobile Development', 
    'UI/UX Design', 
    'Data Analysis', 
    'Marketing', 
    'Event Planning', 
    'Photography', 
    'Writing', 
    'Translation', 
    'Teaching'
  ];

  const availabilityOptions = [
    'Monday', 
    'Tuesday', 
    'Wednesday', 
    'Thursday', 
    'Friday', 
    'Saturday', 
    'Sunday'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNumber || !formData.department || !formData.year) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    if (formData.availability.length === 0) {
      toast.error('Please select at least one availability day');
      return;
    }

    try {
      setLoading(true);
      
      const docRef = await addDoc(collection(db, 'volunteers'), {
        ...formData,
        image: formData.imageUrl, // Store the image URL as 'image' field
        userId: currentUser.uid,
        createdAt: new Date()
      });

      // Create notification for admins
      try {
        // In a real app, you would fetch admin user IDs
        // For now, we'll just use a placeholder
        await notifyNewVolunteer([currentUser.uid], docRef.id, formData.name); // Using current user as placeholder
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      toast.success('Volunteer registration submitted successfully!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting volunteer form:', error);
      toast.error('Failed to register as volunteer');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rollNumber: '',
      department: '',
      year: '',
      skills: [],
      availability: [],
      imageUrl: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Registration</h1>
          <p className="text-gray-600">Join our volunteer team and help the community</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <User className="h-4 w-4 mr-2" />
          Register as Volunteer
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-100">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">500+</p>
              <p className="text-gray-600 text-sm">Active Volunteers</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-cyan-100">
              <Building className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">25+</p>
              <p className="text-gray-600 text-sm">Projects Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Check className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600 text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Volunteer?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Gain Experience</h3>
              <p className="text-gray-600 text-sm">Work on real projects and gain valuable experience</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Make Impact</h3>
              <p className="text-gray-600 text-sm">Contribute to meaningful causes and help others</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Network</h3>
              <p className="text-gray-600 text-sm">Connect with like-minded individuals and professionals</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Learn Skills</h3>
              <p className="text-gray-600 text-sm">Develop new skills and enhance existing ones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Volunteer Registration Form
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter your department"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {skillsOptions.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.skills.includes(skill)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select days you're available</p>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {availabilityOptions.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleAvailabilityToggle(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.availability.includes(day)
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image URL (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Provide a link to your profile picture or any relevant image</p>
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
                    {loading ? 'Registering...' : 'Register as Volunteer'}
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

export default Volunteer;