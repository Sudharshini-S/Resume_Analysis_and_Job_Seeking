import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { 
  Upload, 
  Briefcase, 
  User, 
  LogOut, 
  Users, 
  PlusCircle, 
  Compass, 
  CheckCircle, 
  Star, 
  GraduationCap, 
  BarChart2, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout, activeTab, setActiveTab } = useAuth();
  const role = currentUser?.role || ROLES.JOB_SEEKER;

  const isJobSeeker = role === ROLES.JOB_SEEKER;
  const isRecruiter = role === ROLES.RECRUITER;
  const isCounselor = role === ROLES.COUNSELOR;
  const isAdmin = role === ROLES.ADMIN;

  // Exact role display title without extra sentences
  const getRoleDisplayName = () => {
    switch (role) {
      case ROLES.JOB_SEEKER:
        return 'Job Seeker';
      case ROLES.RECRUITER:
        return 'Recruiter';
      case ROLES.COUNSELOR:
        return 'Career Counselor';
      case ROLES.ADMIN:
        return 'System Administrator';
      default:
        return 'Job Seeker';
    }
  };

  return (
    <header className="bg-[#18181b] text-white border-b border-gray-800 sticky top-0 z-40 shadow-md">
      {/* 1. Header Branding & Current Standalone Role */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-center">
        <h1 
          onClick={() => setActiveTab(isRecruiter ? 'post_jobs' : 'upload')}
          className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase cursor-pointer select-none"
        >
          TalentTrack
        </h1>
        <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">
          Smart Resume & Recruitment Platform
        </p>
        <div className="mt-1.5 inline-block">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30">
            {getRoleDisplayName()}
          </span>
        </div>
      </div>

      {/* 2. Global Navigation Bar - Centered across all 4 roles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800/80 py-2 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
        {/* Job Seeker Navigation */}
        {isJobSeeker && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload and Analyze</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('offerings')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'offerings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Offerings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('applied')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'applied'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Applied Jobs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guidance')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'guidance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Career Guidance</span>
            </button>
          </>
        )}

        {/* Recruiter Navigation */}
        {isRecruiter && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('post_jobs')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'post_jobs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manage_jobs')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'manage_jobs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Posted Jobs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Applications</span>
            </button>
          </>
        )}

        {/* Career Counselor Navigation */}
        {isCounselor && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'roster' || !activeTab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Students</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </>
        )}

        {/* System Administrator Navigation */}
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overview' || !activeTab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Registered Users</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>System Logs</span>
            </button>
          </>
        )}

        {/* Universal Profile Action */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        {/* Universal Logout Action */}
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
