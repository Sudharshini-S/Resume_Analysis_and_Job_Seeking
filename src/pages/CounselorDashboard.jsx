import React, { useState, useEffect } from 'react';
import { 
  getJobSeekers, 
  addCounselorGuidance, 
  updateCounselorGuidance, 
  getAllGuidance, 
  getCareerProgress, 
  getGuidanceForJobSeeker,
  getAppliedJobsForUser
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BarChart2, 
  Award, 
  MessageSquare, 
  Send, 
  Users, 
  FileText, 
  Clock, 
  Edit2, 
  User, 
  Loader2, 
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CounselorDashboard() {
  const { currentUser, activeTab, setActiveTab, showNotification } = useAuth();
  const [students, setStudents] = useState([]);
  const [allGuidance, setAllGuidance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspected student for full details view
  const [inspectedStudent, setInspectedStudent] = useState(null);
  const [careerHistory, setCareerHistory] = useState([]);
  const [studentGuidance, setStudentGuidance] = useState([]);
  const [studentApplications, setStudentApplications] = useState([]);
  const [loadingInspection, setLoadingInspection] = useState(false);

  // Guidance modal/form state
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);
  const [guidanceTargetStudent, setGuidanceTargetStudent] = useState(null);
  const [guidanceNote, setGuidanceNote] = useState('');
  const [guidanceCategory, setGuidanceCategory] = useState('Skill Gap Improvement');
  const [editingGuidanceId, setEditingGuidanceId] = useState(null);
  const [savingGuidance, setSavingGuidance] = useState(false);

  useEffect(() => {
    loadCounselorData();
  }, []);

  async function loadCounselorData() {
    setLoading(true);
    try {
      const [seekers, guidanceList] = await Promise.all([
        getJobSeekers(),
        getAllGuidance()
      ]);
      setStudents(seekers || []);
      setAllGuidance(guidanceList || []);
    } catch (err) {
      showNotification('Failed to fetch counselor data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Open full dedicated candidate inspection view
  const handleInspectStudent = async (student) => {
    if (!student) return;
    setInspectedStudent(student);
    setLoadingInspection(true);
    try {
      const [history, guidance, apps] = await Promise.all([
        getCareerProgress(student.id),
        getGuidanceForJobSeeker(student.id),
        getAppliedJobsForUser(student.id)
      ]);
      setCareerHistory(history || []);
      setStudentGuidance(guidance || []);
      setStudentApplications(apps || []);
    } catch (e) {
      setCareerHistory([]);
      setStudentGuidance([]);
      setStudentApplications([]);
    } finally {
      setLoadingInspection(false);
    }
  };

  // Guidance Modal
  const handleOpenGuidanceModal = (student, existingGuidance = null) => {
    setGuidanceTargetStudent(student);
    if (existingGuidance) {
      setEditingGuidanceId(existingGuidance.id);
      setGuidanceCategory(existingGuidance.category || 'Skill Gap Improvement');
      setGuidanceNote(existingGuidance.note || '');
    } else {
      setEditingGuidanceId(null);
      setGuidanceCategory('Skill Gap Improvement');
      setGuidanceNote('');
    }
    setGuidanceModalOpen(true);
  };

  const handleSaveGuidance = async (e) => {
    e.preventDefault();
    if (!guidanceTargetStudent || !guidanceNote.trim()) {
      showNotification('Please enter guidance note content.', 'error');
      return;
    }

    setSavingGuidance(true);
    try {
      if (editingGuidanceId) {
        await updateCounselorGuidance(editingGuidanceId, {
          category: guidanceCategory,
          note: guidanceNote,
          counselorName: currentUser?.name || 'Career Counselor'
        });
        showNotification(`Updated guidance for ${guidanceTargetStudent.name}`, 'success');
      } else {
        await addCounselorGuidance({
          jobSeekerId: guidanceTargetStudent.id,
          jobSeekerName: guidanceTargetStudent.name,
          counselorId: currentUser?.uid || 'counselor',
          counselorName: currentUser?.name || 'Career Counselor',
          category: guidanceCategory,
          note: guidanceNote
        });
        showNotification(`Guidance recorded for ${guidanceTargetStudent.name}`, 'success');
      }

      setGuidanceModalOpen(false);
      setGuidanceNote('');
      setEditingGuidanceId(null);

      // Refresh data
      await loadCounselorData();
      if (inspectedStudent && inspectedStudent.id === guidanceTargetStudent.id) {
        const [gList] = await Promise.all([getGuidanceForJobSeeker(inspectedStudent.id)]);
        setStudentGuidance(gList || []);
      }
    } catch (err) {
      showNotification('Error saving guidance: ' + err.message, 'error');
    } finally {
      setSavingGuidance(false);
    }
  };

  // Metrics
  const totalStudentsCount = students.length;
  const resumesUploadedCount = students.filter(s => s.resumeUploaded).length;
  const scoredStudents = students.filter(s => s.atsScore > 0);
  const avgAtsScore = scoredStudents.length > 0
    ? Math.round(scoredStudents.reduce((acc, s) => acc + s.atsScore, 0) / scoredStudents.length)
    : 0;
  const activeGuidanceCount = allGuidance.filter(g => g.status === 'Active').length;

  // Real Cohort Competency Analysis Chart Data
  const skillCountMap = {};
  students.forEach(s => {
    (s.skills || []).forEach(sk => {
      skillCountMap[sk] = (skillCountMap[sk] || 0) + 1;
    });
  });

  const chartData = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      candidates: count,
      percentage: totalStudentsCount > 0 ? Math.round((count / totalStudentsCount) * 100) : 0
    }));

  const currentView = activeTab || 'roster';

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-gray-700">Loading career counselor workspace...</p>
      </div>
    );
  }

  // --- DEDICATED FULL CANDIDATE INSPECTION VIEW ---
  if (inspectedStudent) {
    return (
      <div className="space-y-6 pb-12">
        {/* Navigation back to students */}
        <div>
          <button
            type="button"
            onClick={() => setInspectedStudent(null)}
            className="px-3.5 py-1.5 rounded bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span>Back to Students</span>
          </button>
        </div>

        {/* Candidate Overview Card */}
        <div className="panel-box space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{inspectedStudent.name}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  inspectedStudent.resumeUploaded 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {inspectedStudent.resumeUploaded ? 'Resume Active' : 'No Resume'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {inspectedStudent.email}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Calculated ATS Score</span>
              <span className="text-2xl font-extrabold text-emerald-600">
                {inspectedStudent.atsScore ? `${inspectedStudent.atsScore}%` : 'Not evaluated'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Extracted Skills</span>
              <span className="text-base font-bold text-gray-900">{inspectedStudent.skills?.length || 0} Identified</span>
            </div>
            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Industry Experience</span>
              <span className="text-base font-bold text-gray-900">{inspectedStudent.experienceYears || 0} Years</span>
            </div>
            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Placement Readiness</span>
              <span className="text-base font-bold text-blue-600">{inspectedStudent.readinessStatus || 'Evaluation in progress'}</span>
            </div>
          </div>

          {/* Extracted Skills List */}
          <div className="panel-card bg-white space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Extracted Technical Competencies:
            </h3>
            {inspectedStudent.skills && inspectedStudent.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {inspectedStudent.skills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No technical skills extracted yet for this candidate.</p>
            )}
          </div>

          {/* Education */}
          {inspectedStudent.education && inspectedStudent.education.length > 0 && (
            <div className="panel-card bg-white space-y-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Identified Education:</h3>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                {inspectedStudent.education.map((edu, i) => (
                  <li key={i}>{edu}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Applied Positions by this student */}
        <div className="panel-box space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Applied Positions ({studentApplications.length})
          </h2>
          {studentApplications.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">No job applications submitted by this candidate yet.</p>
          ) : (
            <div className="space-y-2">
              {studentApplications.map((app) => (
                <div key={app.id} className="panel-card bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{app.jobTitle}</h4>
                    <span className="text-xs text-gray-500">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()} • Application ATS Score: <strong>{app.atsScore}%</strong>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border self-start sm:self-auto ${
                    app.status === 'Shortlisted' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {app.status || 'Applied'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Career Guidance Notes Provided for this student */}
        <div className="panel-box space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Guidance History & Recommendations ({studentGuidance.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleOpenGuidanceModal(inspectedStudent)}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Career Guidance</span>
            </button>
          </div>

          {studentGuidance.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-3">No guidance records yet for this candidate. Click "Add Career Guidance" above to provide feedback.</p>
          ) : (
            <div className="space-y-3">
              {studentGuidance.map((g) => (
                <div key={g.id} className="panel-card bg-white space-y-2 border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {g.category}
                      </span>
                      <span className="text-gray-500">by {g.counselorName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[11px]">{new Date(g.createdAt).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenGuidanceModal(inspectedStudent, g)}
                        className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
                        title="Edit Guidance"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed font-sans">{g.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guidance Modal */}
        {guidanceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="panel-box w-full max-w-lg bg-white border border-gray-300 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  {editingGuidanceId ? 'Update Guidance Note' : 'Add Career Guidance'} for {inspectedStudent.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setGuidanceModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGuidance} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Guidance Category</label>
                  <select
                    value={guidanceCategory}
                    onChange={(e) => setGuidanceCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Skill Gap Improvement">Skill Gap Improvement</option>
                    <option value="Resume Formatting">Resume Formatting</option>
                    <option value="Target Keyword Alignment">Target Keyword Alignment</option>
                    <option value="Placement Strategy">Placement Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Guidance Note *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter placement guidance note, recommended certifications, and skills to acquire..."
                    value={guidanceNote}
                    onChange={(e) => setGuidanceNote(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setGuidanceModalOpen(false)}
                    className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingGuidance}
                    className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {savingGuidance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{editingGuidanceId ? 'Save Changes' : 'Record Guidance'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DEFAULT VIEW: STUDENTS & ANALYTICS ---
  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registered Job Seekers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{totalStudentsCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resumes Uploaded</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{resumesUploadedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Cohort ATS Score</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{avgAtsScore}%</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600 border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="panel-card bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Guidance Notes</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{activeGuidanceCount}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-200">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View 1: Students */}
      {currentView === 'roster' && (
        <div className="panel-box overflow-hidden">
          <div className="pb-3 mb-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Students ({students.length})
              </h3>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No registered candidates yet</p>
              <p className="mt-1">When job seekers register and upload resumes, their profiles appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3 text-center">Resume Uploaded</th>
                    <th className="p-3 text-center">Extracted Skills</th>
                    <th className="p-3 text-center">ATS Score</th>
                    <th className="p-3">Readiness Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student) => {
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold text-gray-900">{student.name}</td>
                        <td className="p-3 text-gray-500">{student.email}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.resumeUploaded ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-500 bg-gray-100'
                          }`}>
                            {student.resumeUploaded ? 'Active' : 'Not Uploaded'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold text-gray-700">
                          {student.skills?.length || 0} skills
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded font-extrabold text-xs border ${
                            student.atsScore >= 70 ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                            student.atsScore >= 40 ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-gray-200 text-gray-600 bg-gray-50'
                          }`}>
                            {student.atsScore > 0 ? `${student.atsScore}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[11px] font-semibold ${
                            student.atsScore >= 80 ? 'text-emerald-700' : student.atsScore >= 60 ? 'text-amber-700' : 'text-gray-500'
                          }`}>
                            {student.readinessStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleInspectStudent(student)}
                            className="px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border border-gray-300 text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenGuidanceModal(student)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <MessageSquare className="w-3 h-3" /> Add Career Guidance
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

      {/* View 2: Analytics & Cohort Graph */}
      {currentView === 'analytics' && (
        <div className="panel-box space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Cohort Competency Distribution & Analytics
            </h3>
          </div>

          {chartData.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <BarChart2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">No Candidate Skills Data Available Yet</p>
              <p className="mt-1">When candidates upload their resumes and skills are extracted, the cohort distribution graph will render here.</p>
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="skill" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      color: '#111827',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="candidates" fill="#2563eb" radius={[4, 4, 0, 0]} name="Candidates with Skill" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* View 3: Counselor Profile */}
      {currentView === 'profile' && (
        <div className="panel-box space-y-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-700" />
            Career Counselor Profile
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Display Name</span>
              <span className="text-sm font-bold text-gray-900">{currentUser?.name}</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Email Address</span>
              <span className="text-sm text-gray-800">{currentUser?.email}</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Assigned Role</span>
              <span className="text-sm text-gray-900 font-bold">{currentUser?.role}</span>
            </div>

            <div className="panel-card bg-white">
              <span className="text-gray-500 block font-semibold">Total Guidance Notes Delivered</span>
              <span className="text-sm text-blue-600 font-bold">{allGuidance.length} Notes</span>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Modal when opened from Students */}
      {guidanceModalOpen && guidanceTargetStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel-box w-full max-w-lg bg-white border border-gray-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                {editingGuidanceId ? 'Update Guidance Note' : 'Add Career Guidance'} for {guidanceTargetStudent.name}
              </h3>
              <button
                type="button"
                onClick={() => setGuidanceModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGuidance} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Guidance Category</label>
                <select
                  value={guidanceCategory}
                  onChange={(e) => setGuidanceCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Skill Gap Improvement">Skill Gap Improvement</option>
                  <option value="Resume Formatting">Resume Formatting</option>
                  <option value="Target Keyword Alignment">Target Keyword Alignment</option>
                  <option value="Placement Strategy">Placement Strategy</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Guidance Note *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter placement guidance note, recommended certifications, and skills to acquire..."
                  value={guidanceNote}
                  onChange={(e) => setGuidanceNote(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setGuidanceModalOpen(false)}
                  className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGuidance}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {savingGuidance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{editingGuidanceId ? 'Save Changes' : 'Record Guidance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

