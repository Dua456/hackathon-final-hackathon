import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold text-emerald-600">HackathonHub</div>
        <div className="flex space-x-4">
          <Link 
            to="/login" 
            className="px-4 py-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-emerald-600">HackathonHub</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            The ultimate platform for managing and participating in hackathons. 
            Connect with fellow developers, showcase your projects, and compete in exciting challenges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 text-lg font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Collaboration</h3>
            <p className="text-gray-600">
              Easily form teams, collaborate on projects, and communicate with fellow participants throughout the event.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Showcase</h3>
            <p className="text-gray-600">
              Present your innovative solutions, share your code, and get feedback from judges and peers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              Stay informed with live updates, announcements, and countdown timers for all hackathon events.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join the Next Big Hackathon?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your account today and start exploring upcoming events, building amazing projects, and connecting with the developer community.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">© 2024 HackathonHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;