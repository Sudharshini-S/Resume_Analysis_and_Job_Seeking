import React, { useState, useEffect } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUserResume } from '../utils/api';
import { Edit2, Check, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateUserProfileInState, showNotification } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);

  const role = currentUser?.role || ROLES.JOB_SEEKER;
  const isJobSeeker = role === ROLES.JOB_SEEKER;
  const isRecruiter = role === ROLES.RECRUITER;
  const isCounselor = role === ROLES.COUNSELOR;
  const isAdmin = role === ROLES.ADMIN;

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    company: currentUser?.company || ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        company: currentUser.company || ''
      });

      // Load actual resume skills from Firestore for Job Seeker
      if (isJobSeeker && currentUser.uid) {
        getUserResume(currentUser.uid).then((res) => {
          if (res && res.skills) {
            setExtractedSkills(res.skills);
          } else if (currentUser.skills) {
            setExtractedSkills(currentUser.skills);
          }
        }).catch(() => {
          if (currentUser.skills) setExtractedSkills(currentUser.skills);
        });
      }
    }
  }, [currentUser, isJobSeeker]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!currentUser?.uid) return;
    if (!formData.name.trim()) {
      showNotification('Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        name: formData.name.trim(),
        updatedAt: new Date().toISOString()
      };

      if (isJobSeeker) {
        updatePayload.department = formData.department.trim();
      }
      if (isRecruiter) {
        updatePayload.company = formData.company.trim();
      }

      // Persist to Firestore
      if (db) {
        await setDoc(doc(db, 'users', currentUser.uid), updatePayload, { merge: true });
      }

      // Update state and localStorage
      updateUserProfileInState(updatePayload);
      setIsEditing(false);
      showNotification('Profile updated successfully.', 'success');
    } catch (err) {
      showNotification('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const firstLetter = (formData.name || formData.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* 1. Profile Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            {/* Dynamic First Letter Circle */}
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-black uppercase shrink-0 shadow-sm select-none">
              {firstLetter}
            </div>

            {/* Role-Specific Summary Beside Circle */}
            <div className="space-y-1 text-xs">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {formData.name || 'User'}
              </h1>
              <p className="text-gray-600 font-medium">
                {formData.email}
              </p>

              {/* Job Seeker Info */}
              {isJobSeeker && (
                <>
                  <p className="text-blue-600 font-semibold">
                    {role}
                  </p>
                  {formData.department && (
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Department:</span> {formData.department}
                    </p>
                  )}
                  <div className="pt-1">
                    <span className="font-semibold text-gray-900 block mb-1">Extracted Skills:</span>
                    {extractedSkills && extractedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {extractedSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-[11px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No skills extracted yet.</p>
                    )}
                  </div>
                </>
              )}

              {/* Recruiter Info */}
              {isRecruiter && (
                <>
                  <p className="text-blue-600 font-semibold">
                    {role}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Company:</span> {formData.company || 'Not specified'}
                  </p>
                </>
              )}

              {/* Career Counselor Info */}
              {isCounselor && (
                <p className="text-blue-600 font-semibold">
                  Career Counselor
                </p>
              )}

              {/* System Administrator Info: only Name and Email shown */}
              {isAdmin && null}
            </div>
          </div>

          {/* Edit / Save Changes Button at Right End */}
          <div className="shrink-0 self-start">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Form Layout - Fields Stacked Vertically */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
          Profile Details
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Field 1: Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-lg p-2.5 text-xs text-gray-900 transition-colors ${
                isEditing
                  ? 'bg-white border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-gray-50 border border-gray-200 cursor-not-allowed text-gray-800'
              }`}
            />
          </div>

          {/* Field 2: Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Field 3: Role (Not shown for Admin as requested, or shown readonly without escalation) */}
          {!isAdmin && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Role</label>
              <input
                type="text"
                disabled
                value={role}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-600 cursor-not-allowed font-medium"
              />
            </div>
          )}

          {/* Field 4: Company (Recruiter only) */}
          {isRecruiter && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Company</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="Enter company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full rounded-lg p-2.5 text-xs text-gray-900 transition-colors ${
                  isEditing
                    ? 'bg-white border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'bg-gray-50 border border-gray-200 cursor-not-allowed text-gray-800'
                }`}
              />
            </div>
          )}

          {/* Field 5: Department (Job Seeker only) */}
          {isJobSeeker && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Department</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full rounded-lg p-2.5 text-xs text-gray-900 transition-colors ${
                  isEditing
                    ? 'bg-white border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'bg-gray-50 border border-gray-200 cursor-not-allowed text-gray-800'
                }`}
              />
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
