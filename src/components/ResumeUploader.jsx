import React, { useState } from 'react';
import { Upload, CheckCircle, Loader2, Trash2, AlertTriangle, RefreshCw, FileText, Award } from 'lucide-react';
import { readTextFromFile, parseResumeText } from '../services/parser';
import { runAtsAnalysis, saveUserResume, deleteUserResume } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AtsScoreGauge from './AtsScoreGauge';
import ReportPdfView from './ReportPdfView';

export default function ResumeUploader({ onResumeParsed, currentResume, atsReport, onDeleteResume }) {
  const { currentUser, updateUserProfileInState, showNotification } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const processResumeText = async (text, name = '') => {
    if (!text || !text.trim()) {
      showNotification('Could not read text from document. Please paste plain resume text below.', 'error');
      return;
    }

    setLoading(true);
    try {
      const parsed = parseResumeText(text);
      if (name) parsed.fileName = name;

      if (!parsed.skills || parsed.skills.length === 0) {
        showNotification('Resume parsed. No explicit matching skills found in text.', 'info');
      }

      // 1. Save resume to Firestore for currently logged-in user
      if (currentUser?.uid) {
        await saveUserResume(currentUser.uid, parsed, name, currentUser);
      }

      // 2. Compute ATS analysis
      const atsRes = await runAtsAnalysis({
        userId: currentUser?.uid || '',
        userProfile: currentUser,
        parsedResume: parsed
      });

      const report = atsRes?.report || null;
      const finalScore = report?.totalAtsScore || 0;

      // 3. Update auth state
      updateUserProfileInState({
        atsScore: finalScore,
        skills: parsed.skills || [],
        resumeUploaded: true
      });

      onResumeParsed(parsed, report);
      showNotification(`Resume saved & analyzed! Identified ${parsed.skills.length} technical skills. ATS Score: ${finalScore}%`, 'success');
    } catch (err) {
      showNotification('Error processing resume: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const text = await readTextFromFile(file);
      await processResumeText(text, file.name);
    } catch (err) {
      showNotification('Error reading file: ' + err.message, 'error');
      setLoading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setLoading(true);
      const text = await readTextFromFile(file);
      await processResumeText(text, file.name);
    }
  };

  const handlePasteSubmit = async () => {
    if (!rawText.trim()) {
      showNotification('Please paste resume text into the text area first.', 'error');
      return;
    }
    await processResumeText(rawText, 'Pasted Resume Text');
  };

  const handleDeleteConfirmed = async () => {
    if (!currentUser?.uid) return;
    setIsDeleting(true);
    try {
      await deleteUserResume(currentUser.uid, currentUser.name);
      updateUserProfileInState({
        atsScore: 0,
        skills: [],
        resumeUploaded: false
      });
      if (onDeleteResume) {
        onDeleteResume();
      }
      setShowDeleteConfirm(false);
      setFileName('');
      setRawText('');
      showNotification('Your resume and extracted skills have been deleted.', 'success');
    } catch (err) {
      showNotification('Failed to delete resume: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasResume = currentResume && (currentResume.rawText || (currentResume.skills && currentResume.skills.length > 0));

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="panel-box">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">
              {hasResume ? 'Update / Replace Stored Resume' : 'Upload Resume Document'}
            </h2>
            <p className="text-xs text-gray-500">
              {hasResume 
                ? 'Your resume is currently persistent in Firestore. Uploading a new resume will automatically update your profile, extracted skills, and ATS score.' 
                : 'Upload your resume document (.pdf, .docx, .txt) or paste raw text below to extract skills and calculate ATS score.'}
            </p>
          </div>

          {hasResume && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="px-3 py-1.5 rounded bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Resume</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-10 text-center border border-gray-200 rounded-lg bg-gray-50">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-800 font-semibold">Parsing Document & Extracting Exact Skills...</p>
            <p className="text-[11px] text-gray-500 mt-1">Storing to Firestore database...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Input Area with Solid Border */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`upload-solid-box p-6 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50/50' : 'hover:border-gray-400'
              }`}
            >
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="my-2">
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded cursor-pointer transition-colors inline-block shadow-sm">
                  {hasResume ? 'Select New Resume File' : 'Upload Resume File'}
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Supports .pdf, .docx, .doc, and .txt formats</p>
              {fileName && <p className="text-xs text-emerald-600 mt-2 font-semibold">Selected Document: {fileName}</p>}
            </div>

            {/* Paste Text Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Or Paste Plain Resume Text Below:</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste full plain resume text here..."
                rows={4}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono mb-2 shadow-xs"
              />
              <button
                onClick={handlePasteSubmit}
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
              >
                Analyze Pasted Text
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Skills & ATS Score Displayed Directly Below Upload Area */}
      {hasResume ? (
        <div className="space-y-6">
          <div className="panel-box">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-200 gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Active Resume
                </h3>
                <p className="text-xs text-gray-500">
                  {currentResume.fileName ? `Source: ${currentResume.fileName}` : 'Loaded from Firestore database'} • Updated: {new Date(currentResume.updatedAt || currentResume.parsedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Current ATS Score</span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {atsReport?.totalAtsScore || currentUser?.atsScore || 0}% Match
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-800 font-bold">
                    Extracted Skills ({currentResume.skills?.length || 0}):
                  </span>
                  <span className="text-[11px] text-gray-500">Categorized competencies</span>
                </div>

                {currentResume.skillsCategorized && Object.keys(currentResume.skillsCategorized).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(currentResume.skillsCategorized).map(([cat, list]) => (
                      list && list.length > 0 ? (
                        <div key={cat} className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                            {cat} ({list.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {list.map((skill, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : (
                  currentResume.skills && currentResume.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentResume.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No explicit skills extracted.</p>
                  )
                )}
              </div>



              <div>
                <span className="text-gray-800 font-bold block mb-0.5">Estimated Industry Experience:</span>
                <span className="text-gray-600">{currentResume.experienceYears ? `${currentResume.experienceYears} Years` : '-'}</span>
              </div>
            </div>
          </div>

          {/* ATS Gauge & Analysis Component */}
          {atsReport && (
            <AtsScoreGauge 
              atsReport={atsReport} 
              onOpenPdfReport={() => setShowPdfModal(true)} 
            />
          )}
        </div>
      ) : (
        <div className="panel-box text-center py-10 text-xs text-gray-500">
          <h3 className="text-base font-bold text-gray-800 mb-1">Active Resume</h3>
          <p className="mt-1 text-gray-600">Upload a document or plain text above to extract your skills.</p>
        </div>
      )}

      {/* Confirmation Modal for Deleting Resume */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel-box w-full max-w-md border-rose-200 bg-white shadow-xl">
            <div className="flex items-center space-x-3 mb-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-gray-900">Confirm Resume & Skill Deletion</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Are you sure you want to delete your stored resume document and all extracted technical skills?
              <br /><br />
              This will remove your resume and analysis data from Firestore. Your account login credentials will remain intact, and you can upload a new resume at any time.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {showPdfModal && (
        <ReportPdfView
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          atsReport={atsReport || {
            jobTitle: "Target Position",
            totalAtsScore: currentUser?.atsScore || 0,
            breakdown: { skillScore: 70, experienceScore: 80, keywordScore: 70, formattingScore: 90 },
            matchedSkills: currentResume?.skills || [],
            missingSkills: [],
            suggestions: []
          }}
          resume={currentResume}
        />
      )}
    </div>
  );
}
