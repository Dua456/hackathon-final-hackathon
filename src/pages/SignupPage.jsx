import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('Student');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role = userType === 'Admin' ? 'admin' : 'participant';
      await signup(email, password, fullName, role);
      toast.success('Account created successfully!');
      if (userType === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success('Account created successfully!');
      // Determine role based on user type selection
      const role = userType === 'Admin' ? 'admin' : 'participant';
      // Update user role in Firestore if needed
      if (role === 'admin') {
        // This would require additional logic to update the role after Google login
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Panel - Branding */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Logo */}
            <div className="mb-12">
              <img src="/assets/logo.png" alt="Saylani" className="h-25 mb-2" />            </div>

            {/* Title */}
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Campus Portal
              </h1>
              <p className="text-gray-600 text-lg">
                Manage reports, complaints<br />
                & events in one place.
              </p>
            </div>

            {/* Decorative Wave Pattern */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 400 200" className="w-full opacity-30">
                <path
                  d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z"
                  fill="url(#wave-gradient-1)"
                />
                <path
                  d="M0,120 Q100,70 200,120 T400,120 L400,200 L0,200 Z"
                  fill="url(#wave-gradient-2)"
                />
                <defs>
                  <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 0.3 }} />
                  </linearGradient>
                  <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right Panel - Signup Form */}
          <div className="p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* User Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('Student')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${userType === 'Student'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('Admin')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${userType === 'Admin'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Admin
                </button>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            {/* Google Sign In */}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}