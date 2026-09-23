import React, { useState, useEffect } from 'react';
import ResumeUploader from '../components/ResumeUploader';
import { 
  getJobPostings, 
  applyForJob, 
  getUserResume, 
  getLatestAtsReport, 
  runAtsAnalysis, 
  getGuidanceForJobSeeker,
  getAppliedJobsForUser
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Target, 
  Compass, 
  MessageSquare, 
  Loader2, 
  Calendar, 
  Check, 
  X 
} from 'lucide-react';

export default function JobSeekerDashboard() {
  const { currentUser, activeTab, setActiveTab, showNotification } = useAuth();
  const [currentResume, setCurrentResume] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appliedJobsMap, setAppliedJobsMap] = useState({});
  const [appliedJobsList, setAppliedJobsList] = useState([]);
  const [guidanceList, setGuidanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForGap, setSelectedJobForGap] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser?.uid]);

  async function loadDashboardData() {
    if (!currentUser?.uid) return;
    setLoading(true);

    try {
      // 1. Fetch persistent resume from Firestore
      const savedResume = await getUserResume(currentUser.uid);
      if (savedResume) {
        setCurrentResume(savedResume);
        // 2. Fetch latest saved ATS report
        const savedReport = await getLatestAtsReport(currentUser.uid);
        if (savedReport) {
          setAtsReport(savedReport);
        } else if (savedResume.skills && savedResume.skills.length > 0) {
          const atsRes = await runAtsAnalysis({
            userId: currentUser.uid,
            userProfile: currentUser,
            parsedResume: savedResume
          });
          setAtsReport(atsRes?.report || null);
        }
      } else {
        setCurrentResume(null);
        setAtsReport(null);
      }

      // 3. Fetch applications for this user
      const userApps = await getAppliedJobsForUser(currentUser.uid);
      setAppliedJobsList(userApps);
      const appMap = {};
      userApps.forEach(a => { appMap[a.jobId] = true; });
      setAppliedJobsMap(appMap);

      // 4. Fetch counselor guidance records for this user
      const guidance = await getGuidanceForJobSeeker(currentUser.uid);
      setGuidanceList(guidance);

      // 5. Fetch live recruiter job postings
      const jobList = await getJobPostings();
      setJobs(jobList);
      if (jobList.length > 0 && !selectedJobForGap) {
        setSelectedJobForGap(jobList[0]);
      }
    } catch (err) {
      console.warn('Error loading Job Seeker data:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleResumeParsed = (parsed, report) => {
    setCurrentResume(parsed);
    setAtsReport(report);
    if (currentUser?.uid) {
      getGuidanceForJobSeeker(currentUser.uid).then(setGuidanceList);
    }
  };

  const handleDeleteResume = () => {
    setCurrentResume(null);
    setAtsReport(null);
  };

  const handleApply = async (job) => {
    if (!currentResume || !currentResume.skills || currentResume.skills.length === 0) {
      showNotification('Please upload your resume before applying.', 'error');
      return;
    }

    try {
      await applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company || '',
        userId: currentUser?.uid,
        candidateName: currentUser?.name || currentResume.candidateName || 'Applicant',
        candidateEmail: currentUser?.email || currentResume.email || '',
        atsScore: atsReport?.totalAtsScore || currentUser?.atsScore || 0,
        skills: currentResume.skills || []
      });

      setAppliedJobsMap(prev => ({ ...prev, [job.id]: true }));
      const updatedApps = await getAppliedJobsForUser(currentUser.uid);
      setAppliedJobsList(updatedApps);
      showNotification(`Applied successfully for ${job.title}`, 'success');
    } catch (err) {
      showNotification('Error applying: ' + err.message, 'error');
    }
  };

  // Calculate skill gap against a job
  const computeSkillGap = (job) => {
    if (!job) return { matched: [], missing: [], score: 0 };
    const required = Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : (job.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

    const resumeSkills = currentResume?.skills || [];
    const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));

    const matched = [];
    const missing = [];

    required.forEach(req => {
      if (resumeSkillsLower.has(req.toLowerCase())) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    });

    const score = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 100;
    return { matched, missing, score, totalRequired: required.length };
  };

  // Job recommendations ranked by skill alignment
  const getJobRecommendations = () => {
    if (!currentResume || !currentResume.skills || currentResume.skills.length === 0) return [];

    return jobs.map(job => {
      const gap = computeSkillGap(job);
      return {
        ...job,
        matchScore: gap.score,
        matchedSkills: gap.matched,
        missingSkills: gap.missing
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const currentView = activeTab || 'upload';

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* View 1: Upload and Analyze (Merged Resume Upload & Skill Gap) */}
      {currentView === 'upload' && (
        <div className="space-y-6">
          <div className="panel-box">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Upload and Analyze</h1>
          </div>

          <ResumeUploader
            onResumeParsed={handleResumeParsed}
            currentResume={currentResume}
            atsReport={atsReport}
            onDeleteResume={handleDeleteResume}
          />

          {/* Integrated Skill Gap Comparison */}
          {currentResume && currentResume.skills && currentResume.skills.length > 0 && (
            <div className="space-y-6">
              <div className="panel-box space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Target Job Skill Gap Comparison
                  </h3>

                  {jobs.length > 0 && (
                    <div className="w-full sm:w-auto">
                      <select
                        value={selectedJobForGap?.id || ''}
                        onChange={(e) => {
                          const j = jobs.find(job => job.id === e.target.value);
                          if (j) setSelectedJobForGap(j);
                        }}
                        className="w-full sm:w-64 bg-white border border-gray-300 rounded p-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {jobs.map(job => (
                          <option key={job.id} value={job.id}>
                            {job.title} ({job.company})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedJobForGap ? (
                  (() => {
                    const gap = computeSkillGap(selectedJobForGap);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                          <div>
                            <span className="text-sm font-bold text-gray-900 block">{selectedJobForGap.title}</span>
                            <span className="text-xs text-gray-500">{selectedJobForGap.company} • {selectedJobForGap.minExperience}+ Yrs Experience Required</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Skill Match</span>
                            <span className={`text-xl font-extrabold ${gap.score >= 70 ? 'text-emerald-600' : gap.score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {gap.score}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="panel-card border-emerald-200 bg-emerald-50/40">
                            <h4 className="text-xs font-bold text-emerald-800 mb-2">
                              Matched Skills ({gap.matched.length})
                            </h4>
                            {gap.matched.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {gap.matched.map((s, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-emerald-700 rounded border border-emerald-200 text-[11px] font-medium shadow-2xs">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{s}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No skills currently matched for this position.</p>
                            )}
                          </div>

                          <div className="panel-card border-rose-200 bg-rose-50/40">
                            <h4 className="text-xs font-bold text-rose-800 mb-2">
                              Missing Skills ({gap.missing.length})
                            </h4>
                            {gap.missing.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {gap.missing.map((s, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-rose-700 rounded border border-rose-200 text-[11px] font-medium shadow-2xs">
                                    <X className="w-3 h-3 text-rose-600" />
                                    <span>{s}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-emerald-700 font-semibold">You possess all required technical skills for this role.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-gray-500 italic">No job postings available to compare.</p>
                )}
              </div>

              {/* Recommended Jobs */}
              <div className="panel-box space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Recommended Jobs
                  </h3>
                </div>

                {jobs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4">No job postings available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getJobRecommendations().map(job => (
                      <div key={job.id} className="panel-card flex flex-col justify-between space-y-3 bg-white">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-gray-800">{job.company}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              job.matchScore >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}>
                              {job.matchScore}% Skill Match
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900">{job.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 my-1">{job.description}</p>

                          <div className="pt-2">
                            <span className="text-[10px] text-gray-500 font-bold block mb-1">Matched Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {job.matchedSkills.slice(0, 4).map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                  {s}
                                </span>
                              ))}
                              {job.matchedSkills.length === 0 && (
                                <span className="text-[10px] text-gray-400 italic">None matched</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-600 font-medium">{job.salary || 'Competitive'}</span>
                          <button
                            onClick={() => handleApply(job)}
                            disabled={appliedJobsMap[job.id]}
                            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                              appliedJobsMap[job.id]
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                            }`}
                          >
                            {appliedJobsMap[job.id] ? 'Applied' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Recruiter Job Offerings */}
      {currentView === 'offerings' && (
        <div className="panel-box space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Job Offerings ({jobs.length})
            </h1>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No job openings available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => {
                const isApplied = appliedJobsMap[job.id];
                const required = Array.isArray(job.requiredSkills)
                  ? job.requiredSkills
                  : (job.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

                return (
                  <div key={job.id} className="panel-card flex flex-col justify-between space-y-3 bg-white">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-gray-800">{job.company}</span>
                        <span className="text-gray-500">{job.minExperience}+ Yrs Exp</span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-3 my-2">{job.description}</p>

                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block mb-1">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {required.map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{job.salary || 'Competitive'}</span>
                      <button
                        onClick={() => handleApply(job)}
                        disabled={isApplied}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                        }`}
                      >
                        {isApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 3: Applied Jobs (Consolidated with Shortlisted & Rejected Status & Recruiter Review) */}
      {currentView === 'applied' && (
        <div className="panel-box space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Applied Jobs ({appliedJobsList.length})
            </h1>
          </div>

          {appliedJobsList.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm mb-4">No applications submitted yet.</p>
              <button
                onClick={() => setActiveTab('offerings')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm cursor-pointer"
              >
                Browse Job Offerings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appliedJobsList.map((app) => {
                const reviewText = app.recruiterReview || app.recruiterNotes || app.evaluationNotes || '';
                const isShortlisted = app.status === 'Shortlisted';
                const isRejected = app.status === 'Rejected';

                return (
                  <div key={app.id} className="panel-card bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {app.jobTitle || 'Position'}
                        </h3>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                          Company: {app.company || 'Company'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                          isShortlisted
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : isRejected
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          Status: {app.status || 'Applied'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>ATS Match: <strong className="text-gray-800">{app.atsScore || 0}%</strong></span>
                    </div>

                    {app.skills && app.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.skills.slice(0, 6).map((sk, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Recruiter Review Display for Shortlisted or Rejected Candidates */}
                    {(isShortlisted || isRejected) && reviewText && (
                      <div className="mt-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                        <span className="font-bold text-gray-800 block mb-1">Recruiter Review:</span>
                        <p className="text-gray-900 leading-relaxed font-sans italic">
                          "{reviewText}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 4: Counselor Guidance */}
      {currentView === 'guidance' && (
        <div className="panel-box space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              Career Guidance ({guidanceList.length})
            </h1>
          </div>

          {guidanceList.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No guidance notes received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guidanceList.map((g) => (
                <div key={g.id} className="panel-card border-gray-200 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {g.category}
                      </span>
                      <span className="text-gray-500">by {g.counselorName}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        g.status === 'Addressed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {g.status || 'Active'}
                      </span>
                      <span className="text-gray-400 text-[11px]">{new Date(g.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans">{g.note}</p>

                  {g.statusNote && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                      {g.statusNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
