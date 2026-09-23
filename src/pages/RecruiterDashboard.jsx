import React, { useState, useEffect } from 'react';
import { 
  getJobPostings, 
  createJobPosting, 
  updateJobPosting,
  getCandidateApplications, 
  updateCandidateStatus 
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Users, 
  CheckCircle, 
  XCircle, 
  Star, 
  Edit3, 
  Briefcase, 
  X, 
  Plus, 
  Loader2, 
  DollarSign 
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { currentUser, activeTab, setActiveTab, showNotification } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Job Form State (no location, empty defaults)
  const [newJob, setNewJob] = useState({
    title: '',
    company: currentUser?.company || '',
    type: 'Full-Time',
    salary: '',
    minExperience: '',
    description: '',
    requiredSkills: []
  });
  const [skillInput, setSkillInput] = useState('');

  // Edit Job Modal State (no location)
  const [editingJob, setEditingJob] = useState(null);
  const [editSkillInput, setEditSkillInput] = useState('');
  const [savingJob, setSavingJob] = useState(false);

  // Candidate Evaluation Modal State
  const [evaluatingCandidate, setEvaluatingCandidate] = useState(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState(5);
  const [evalStatus, setEvalStatus] = useState('Shortlisted');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [jobList, candidateList] = await Promise.all([
        getJobPostings(),
        getCandidateApplications()
      ]);
      setJobs(jobList || []);
      setCandidates(candidateList || []);
    } catch (e) {
      console.warn('Error loading recruiter data:', e.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Skill Tag Handlers for Create Job ---
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!newJob.requiredSkills.includes(trimmed)) {
      setNewJob(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setNewJob(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  // --- Create Job ---
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title.trim() || !newJob.description.trim()) {
      showNotification('Please fill in job title and description.', 'error');
      return;
    }
    if (newJob.requiredSkills.length === 0) {
      showNotification('Please add at least one required skill.', 'error');
      return;
    }

    setSavingJob(true);
    try {
      const res = await createJobPosting({
        ...newJob,
        minExperience: Number(newJob.minExperience) || 0,
        postedBy: currentUser?.name || 'Recruiter',
        postedById: currentUser?.uid || ''
      });

      if (res && res.job) {
        showNotification(`Job offering published: ${res.job.title}`, 'success');
        setNewJob({
          title: '',
          company: currentUser?.company || '',
          type: 'Full-Time',
          salary: '',
          minExperience: '',
          description: '',
          requiredSkills: []
        });
        setSkillInput('');
        await loadData();
        setActiveTab('manage_jobs');
      }
    } catch (err) {
      showNotification('Failed to post job: ' + err.message, 'error');
    } finally {
      setSavingJob(false);
    }
  };

  // --- Skill Tag Handlers for Edit Job ---
  const handleAddEditSkill = (e) => {
    e?.preventDefault();
    const trimmed = editSkillInput.trim();
    if (!trimmed || !editingJob) return;
    const currentSkills = Array.isArray(editingJob.requiredSkills) ? editingJob.requiredSkills : [];
    if (!currentSkills.includes(trimmed)) {
      setEditingJob({
        ...editingJob,
        requiredSkills: [...currentSkills, trimmed]
      });
    }
    setEditSkillInput('');
  };

  const handleRemoveEditSkill = (skillToRemove) => {
    if (!editingJob) return;
    const currentSkills = Array.isArray(editingJob.requiredSkills) ? editingJob.requiredSkills : [];
    setEditingJob({
      ...editingJob,
      requiredSkills: currentSkills.filter(s => s !== skillToRemove)
    });
  };

  // --- Update Existing Job ---
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob || !editingJob.id) return;
    if (!editingJob.title.trim() || !editingJob.description.trim()) {
      showNotification('Please provide job title and description.', 'error');
      return;
    }

    setSavingJob(true);
    try {
      await updateJobPosting(editingJob.id, {
        title: editingJob.title,
        company: editingJob.company,
        type: editingJob.type,
        salary: editingJob.salary,
        minExperience: Number(editingJob.minExperience) || 0,
        description: editingJob.description,
        requiredSkills: Array.isArray(editingJob.requiredSkills) ? editingJob.requiredSkills : []
      });

      showNotification(`Job "${editingJob.title}" updated successfully!`, 'success');
      setEditingJob(null);
      await loadData();
    } catch (err) {
      showNotification('Failed to update job: ' + err.message, 'error');
    } finally {
      setSavingJob(false);
    }
  };

  // --- Candidate Evaluation & Status Actions ---
  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      await updateCandidateStatus(appId, newStatus);
      showNotification(`Applicant status updated to '${newStatus}'`, 'success');
      loadData();
    } catch (err) {
      showNotification('Status update failed: ' + err.message, 'error');
    }
  };

  const handleOpenEvaluationModal = (cand) => {
    setEvaluatingCandidate(cand);
    setEvalNotes(cand.recruiterReview || cand.recruiterNotes || cand.evaluationNotes || '');
    setEvalRating(cand.rating || 5);
    setEvalStatus(cand.status === 'Applied' ? 'Shortlisted' : (cand.status || 'Shortlisted'));
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingCandidate) return;

    try {
      await updateCandidateStatus(evaluatingCandidate.id, evalStatus, evalNotes, evalRating);
      showNotification(`Evaluation saved for ${evaluatingCandidate.candidateName}`, 'success');
      setEvaluatingCandidate(null);
      loadData();
    } catch (err) {
      showNotification('Failed to save evaluation: ' + err.message, 'error');
    }
  };

  const currentView = activeTab || 'post_jobs';

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-gray-700">Loading recruiter workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* View 1: Post New Job */}
      {currentView === 'post_jobs' && (
        <div className="panel-box">
          <div className="border-b border-gray-200 pb-3 mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Post Job
            </h2>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="Enter job title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Job Type</label>
                <select
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Min Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="Enter min experience"
                  value={newJob.minExperience}
                  onChange={(e) => setNewJob({ ...newJob, minExperience: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Salary Offer</label>
                <input
                  type="text"
                  placeholder="Enter salary offer"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Required Skills Section */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Required Skills *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md border border-gray-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Skills Container */}
              <div className="min-h-[42px] p-2 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap gap-1.5 items-center">
                {newJob.requiredSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-blue-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Job Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Enter job description"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingJob}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {savingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish Job Offering</span>
            </button>
          </form>
        </div>
      )}

      {/* View 2: Posted Jobs Management with Edit */}
      {currentView === 'manage_jobs' && (
        <div className="panel-box space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Posted Jobs ({jobs.length})
            </h2>

            <button
              type="button"
              onClick={() => setActiveTab('post_jobs')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Another Job</span>
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm mb-4">No job postings created yet.</p>
              <button
                onClick={() => setActiveTab('post_jobs')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm cursor-pointer"
              >
                Post New Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((j) => {
                const required = Array.isArray(j.requiredSkills)
                  ? j.requiredSkills
                  : (j.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

                return (
                  <div key={j.id} className="panel-card bg-white flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-gray-800">{j.company || 'Company'}</span>
                        <span className="text-gray-500">{j.minExperience}+ Yrs Exp</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900">{j.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-3 my-2">{j.description}</p>

                      {j.salary && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 my-1">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span>{j.salary}</span>
                        </div>
                      )}

                      <div className="pt-1">
                        <span className="text-[10px] text-gray-500 font-bold block mb-1">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {required.map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        {new Date(j.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingJob(j)}
                        className="px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border border-gray-300 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 3: Received Applications with Review & Shortlisting */}
      {currentView === 'applications' && (
        <div className="panel-box">
          <div className="pb-3 mb-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Applications ({candidates.length})
            </h2>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No applications received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Applied Job</th>
                    <th className="p-3 text-center">ATS Match</th>
                    <th className="p-3">Extracted Skills</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {candidates.map((cand) => {
                    const score = cand.atsScore || 0;
                    const skillsList = cand.skills || [];

                    return (
                      <tr key={cand.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{cand.candidateName}</div>
                          <div className="text-[11px] text-gray-500">{cand.candidateEmail}</div>
                        </td>
                        <td className="p-3 text-gray-800 font-semibold">
                          {cand.jobTitle || 'Target Position'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-extrabold text-xs px-2.5 py-1 rounded border ${
                            score >= 70 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                              : score >= 40 
                              ? 'text-amber-700 bg-amber-50 border-amber-200' 
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}>
                            {score}%
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {skillsList.slice(0, 5).map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] border border-gray-200">
                                {s}
                              </span>
                            ))}
                            {skillsList.length > 5 && (
                              <span className="text-[10px] text-gray-500 font-semibold">+{skillsList.length - 5}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                            cand.status === 'Shortlisted' 
                              ? 'text-amber-800 bg-amber-50 border-amber-300' 
                              : cand.status === 'Rejected'
                              ? 'text-rose-700 bg-rose-50 border-rose-200'
                              : 'text-blue-700 bg-blue-50 border-blue-200'
                          }`}>
                            {cand.status || 'Applied'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEvaluationModal(cand)}
                            className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-semibold border border-gray-300 inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-amber-500" /> Evaluate
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(cand.id, 'Shortlisted')}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-300 inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Shortlist
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(cand.id, 'Rejected')}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <XCircle className="w-3 h-3 text-rose-600" /> Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal (No location) */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel-box w-full max-w-2xl bg-white border border-gray-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Edit Job
              </h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter job title"
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={editingJob.company || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Job Type</label>
                  <select
                    value={editingJob.type || 'Full-Time'}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="Enter min experience"
                    value={editingJob.minExperience ?? ''}
                    onChange={(e) => setEditingJob({ ...editingJob, minExperience: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Salary Offer</label>
                  <input
                    type="text"
                    placeholder="Enter salary offer"
                    value={editingJob.salary || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Edit Skills Tag Badges */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter skill"
                    value={editSkillInput}
                    onChange={(e) => setEditSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditSkill();
                      }
                    }}
                    className="flex-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditSkill}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md border border-gray-300 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="min-h-[42px] p-2 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap gap-1.5 items-center">
                  {(Array.isArray(editingJob.requiredSkills) ? editingJob.requiredSkills : []).map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveEditSkill(sk)}
                        className="text-blue-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter job description"
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {savingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Evaluation Modal */}
      {evaluatingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel-box w-full max-w-lg bg-white border border-gray-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Evaluate Candidate: {evaluatingCandidate.candidateName}
              </h3>
              <button
                onClick={() => setEvaluatingCandidate(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-500 mb-0.5">Applied Position:</p>
                <p className="font-bold text-gray-900 text-sm">{evaluatingCandidate.jobTitle}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  ATS Match: {evaluatingCandidate.atsScore}%
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Status Decision</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setEvalRating(num)}
                      className={`p-1 rounded cursor-pointer ${num <= evalRating ? 'text-amber-500' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-gray-600 text-xs ml-2">({evalRating}/5)</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Recruiter Review
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter candidate review and feedback..."
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEvaluatingCandidate(null)}
                  className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
