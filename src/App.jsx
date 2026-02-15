import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import LostAndFound from './pages/LostAndFound';
import Complaints from './pages/Complaints';
import Volunteer from './pages/Volunteer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEvents from './pages/AdminEvents';
import AdminComplaints from './pages/AdminComplaints';
import AdminActivities from './pages/AdminActivities';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-smit-green/10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="activities" element={<DashboardOverview />} />
              <Route path="lost-found" element={<LostAndFound />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="volunteer" element={<Volunteer />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="activities" element={<AdminActivities />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
