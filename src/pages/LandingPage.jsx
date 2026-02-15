import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Github, Mail, UserPlus } from 'lucide-react';

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Hackathon Dashboard
        </div>
        {currentUser ? (
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-neon hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]"
          >
            Dashboard
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-700"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-neon hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hackathon
            </span>{' '}
            <span className="text-white">Dashboard</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Volunteer • Report Issues • Lost & Found
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold transition-all duration-200 shadow-neon hover:shadow-[0_0_30px_rgba(99,102,241,0.8)]"
            >
              <UserPlus size={24} />
              Create Account
              <ArrowRight size={20} className="ml-2" />
            </Link>
            
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]"
            >
              <Mail size={24} />
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}