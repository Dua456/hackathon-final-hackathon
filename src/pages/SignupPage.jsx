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
  const { signup, googleLogin, isAdmin, waitForUserData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role = userType === 'Admin' ? 'admin' : 'participant';
      await signup(email, password, fullName, role);
      toast.success('Account created successfully!');
      // Wait for the user data to be loaded and check the actual user role
      await waitForUserData();
      
      if (isAdmin) {
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
      // Wait for the user data to be loaded and check the actual user role
      await waitForUserData();
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda1d10f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4">
              <img src="/assets/logo.png" alt="Saylani" className="h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our campus portal to get started</p>
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
  );
}