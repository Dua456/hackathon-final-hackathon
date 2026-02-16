import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function VolunteerPage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    rollNumber: '',
    department: '',
    year: '',
    skills: [],
    availability: [],
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biomedical'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate Student'];
  const skillsOptions = ['Technical Support', 'Event Coordination', 'Marketing', 'Design', 'Photography', 'Writing', 'Translation', 'Other'];
  const availabilityOptions = ['Morning (9AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Weekends'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityChange = (timeSlot) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(timeSlot)
        ? prev.availability.filter(a => a !== timeSlot)
        : [...prev.availability, timeSlot]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'volunteers'), {
        ...formData,
        userId: currentUser.uid,
        timestamp: new Date()
      });

      toast.success('Volunteer registration submitted successfully!');
      setFormData({
        name: currentUser?.displayName || '',
        rollNumber: '',
        department: '',
        year: '',
        skills: [],
        availability: [],
        imageUrl: ''
      });
    } catch (error) {
      toast.error('Failed to submit volunteer registration');
      console.error('Error submitting volunteer form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Volunteer Registration</h1>
        <p className="text-gray-400 mt-2">Join our team of volunteers to help make this hackathon successful</p>
      </div>

      <Card className="bg-white backdrop-blur-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Volunteer Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your roll number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {skillsOptions.map(skill => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillsChange(skill)}
                      className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-300 text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Availability (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availabilityOptions.map(timeSlot => (
                  <label key={timeSlot} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availability.includes(timeSlot)}
                      onChange={() => handleAvailabilityChange(timeSlot)}
                      className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-300 text-sm">{timeSlot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter the URL of your profile image (e.g., https://example.com/image.jpg)"
              />
              <p className="text-xs text-gray-400 mt-2">Provide a link to your profile picture or any relevant image</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-neon hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}