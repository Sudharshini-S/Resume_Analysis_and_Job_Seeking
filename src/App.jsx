import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser, loading, notification, activeTab, ROLES } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-gray-200">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Loading TalentTrack...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const renderDashboardByRole = () => {
    // If activeTab is profile across any role, show the clean ProfilePage
    if (activeTab === 'profile') {
      return <ProfilePage />;
    }

    switch (currentUser.role) {
      case ROLES.JOB_SEEKER:
        return <JobSeekerDashboard />;
      case ROLES.RECRUITER:
        return <RecruiterDashboard />;
      case ROLES.COUNSELOR:
        return <CounselorDashboard />;
      case ROLES.ADMIN:
        return <AdminDashboard />;
      default:
        return <JobSeekerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Toast Notifications */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-xl border flex items-center space-x-2.5 text-xs font-semibold ${
            notification.type === 'error'
              ? 'bg-rose-900 border-rose-500 text-rose-100'
              : 'bg-emerald-900 border-emerald-500 text-emerald-100'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Global TalentTrack Header */}
      <Navbar />

      {/* Main Light Background Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderDashboardByRole()}
      </main>

      {/* Global Dark Charcoal Footer */}
      <footer className="bg-[#18181b] text-gray-400 border-t border-gray-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1.5 text-xs">
          <div className="font-bold text-white tracking-wide text-sm">
            TalentTrack
          </div>
          <div className="text-gray-400 text-xs">
            Smart Resume & Recruitment Platform
          </div>
          <div className="text-gray-500 text-[11px] pt-1">
            © {new Date().getFullYear()} TalentTrack. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
