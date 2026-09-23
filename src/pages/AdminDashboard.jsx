import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminLogs, getAllUsers, updateUserRole, getJobSeekers } from '../utils/api';
import { useAuth, ROLES } from '../context/AuthContext';
import { ShieldCheck, Activity, Users, Database, FileText, Edit, CheckCircle, Search, User, ShieldAlert, Loader2, X } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, activeTab, showNotification } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState(ROLES.JOB_SEEKER);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Security check: Only admin@gmail.com can access
  const isAdmin = currentUser?.email?.toLowerCase() === 'admin@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [sData, lData, uData, seekers] = await Promise.all([
        getAdminStats(),
        getAdminLogs(),
        getAllUsers(),
        getJobSeekers()
      ]);
      setStats(sData);
      setLogs(lData || []);
      setUsers(uData || []);
      setJobSeekers(seekers || []);
    } catch (err) {
      showNotification('Error loading admin workspace: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUserRole(editingUser.id || editingUser.uid, newRole, currentUser?.name || 'Administrator');
      showNotification(`Updated role for ${editingUser.name} to ${newRole}`, 'success');
      setEditingUser(null);
      await loadAdminData();
    } catch (err) {
      showNotification('Failed to update role: ' + err.message, 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  if (!isAdmin) {
    return (
      <div className="panel-box text-center py-16 max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          The System Administrator control console is strictly restricted to authorized administrative credentials (<code className="text-rose-600 font-mono">admin@gmail.com</code>).
        </p>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
          Your current session is logged in as <span className="font-bold">{currentUser?.email || 'Guest'}</span> with role <span className="font-bold">{currentUser?.role}</span>.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-gray-700">Loading system administration records...</p>
      </div>
    );
  }

  const currentView = activeTab || 'overview';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Level Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Registered Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{users.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Resumes Uploaded</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.resumesCount || jobSeekers.filter(s => s.resumeUploaded).length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Job Postings</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.jobsCount || 0}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600 border border-amber-200">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.applicationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-200">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View 1: Overview - Candidate Profiles & Resumes */}
      {currentView === 'overview' && (
        <div className="panel-box overflow-hidden space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Registered Job Seeker Profiles & Uploaded Resumes ({jobSeekers.length})
            </h3>
          </div>

          {jobSeekers.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No candidates registered yet</p>
              <p className="mt-1">When users register as job seekers and upload resumes, their live data will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Resume Status</th>
                    <th className="p-3 text-center">Extracted Skills</th>
                    <th className="p-3 text-center">ATS Score</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jobSeekers.map((cand) => (
                    <tr key={cand.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-900">{cand.name}</td>
                      <td className="p-3 text-gray-500">{cand.email}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cand.resumeUploaded ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-500 bg-gray-100'
                        }`}>
                          {cand.resumeUploaded ? 'Uploaded' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-700 font-semibold">
                        {cand.skills?.length || 0} skills
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-extrabold text-xs text-emerald-600">
                          {cand.atsScore ? `${cand.atsScore}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border border-gray-300 text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          View Resume
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 2: Registered Accounts & Role Assignments */}
      {currentView === 'users' && (
        <div className="panel-box overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Registered User Accounts ({filteredUsers.length})
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search user, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              No registered user accounts matching search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((u) => (
                    <tr key={u.id || u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700">
                          {(u.name || u.email || 'U')[0].toUpperCase()}
                        </div>
                        {u.name || 'User'}
                      </td>
                      <td className="p-3 text-gray-500">{u.email}</td>
                      <td className="p-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          u.role === ROLES.ADMIN 
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === ROLES.RECRUITER
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : u.role === ROLES.COUNSELOR
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                          }}
                          className="px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border border-gray-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3 h-3" /> Edit Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 3: System Logs */}
      {currentView === 'logs' && (
        <div className="panel-box space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              System Logs ({logs.length})
            </h3>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              No system logs recorded yet. System activities such as uploads, applications, and role changes will log here.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-white rounded border border-gray-200 flex items-start justify-between text-xs hover:border-gray-300 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-blue-700 uppercase text-[10px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {log.action}
                      </span>
                      <span className="font-semibold text-gray-900">{log.user}</span>
                    </div>
                    <p className="text-gray-600">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-4">
                    {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 4: Administrator Profile */}
      {currentView === 'profile' && (
        <div className="panel-box space-y-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-700" />
            System Administrator Profile
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Administrator Email</span>
              <span className="text-sm font-bold text-gray-900">{currentUser?.email}</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Assigned Role</span>
              <span className="text-sm text-gray-900 font-bold">{currentUser?.role}</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Audit Logs Recorded</span>
              <span className="text-sm text-blue-600 font-bold">{logs.length} Log Events</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Security Status</span>
              <span className="text-sm text-emerald-600 font-bold">Authorized Superadmin</span>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Resume Inspection Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="panel-box w-full max-w-2xl max-h-[85vh] overflow-y-auto relative bg-white border border-gray-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Resume Information: {selectedCandidate.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="panel-card bg-white">
                <span className="text-gray-500 block font-semibold">Email:</span>
                <span className="text-gray-800 font-medium">{selectedCandidate.email}</span>
              </div>
              <div className="panel-card bg-white">
                <span className="text-gray-500 block font-semibold">ATS Match Score:</span>
                <span className="text-emerald-600 font-bold">{selectedCandidate.atsScore || 0}%</span>
              </div>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-700 font-bold block mb-1 text-xs uppercase">Extracted Technical Skills:</span>
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No skills extracted.</p>
              )}
            </div>

            {selectedCandidate.rawText && (
              <div className="panel-card bg-white">
                <span className="text-gray-700 font-bold block mb-1 text-xs uppercase">Resume Raw Text Preview:</span>
                <pre className="text-[11px] text-gray-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-50 p-2.5 rounded border border-gray-200">
                  {selectedCandidate.rawText}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Editing Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel-box w-full max-w-md p-6 relative bg-white border border-gray-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Modify User Access Role</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleUpdate} className="space-y-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Target Account:</p>
                <p className="text-sm font-bold text-gray-900">{editingUser.name} ({editingUser.email})</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value={ROLES.JOB_SEEKER}>{ROLES.JOB_SEEKER}</option>
                  <option value={ROLES.RECRUITER}>{ROLES.RECRUITER}</option>
                  <option value={ROLES.COUNSELOR}>{ROLES.COUNSELOR}</option>
                  <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
