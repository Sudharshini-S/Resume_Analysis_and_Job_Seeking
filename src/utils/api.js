import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { readTextFromFile, parseResumeText } from '../services/parser';
import { analyzeAtsMatch } from '../services/atsEngine';

// ==========================================
// AUDIT LOGGING HELPER
// ==========================================
export async function addAuditLog(action, userName, userId, details) {
  if (!db) return;
  try {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      user: userName || 'User',
      userId: userId || 'anonymous',
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit log notice:', err.message);
  }
}

// ==========================================
// RESUME OPERATIONS & PERSISTENCE
// ==========================================

/**
 * Upload and parse resume text, then save persistently to Firestore under the user's UID.
 */
export async function uploadAndParseResume(file, rawText = '', userId = '', userProfile = {}) {
  let textToParse = rawText;
  let fileName = '';

  if (file) {
    fileName = file.name;
    try {
      textToParse = await readTextFromFile(file);
    } catch (err) {
      console.warn('File read notice:', err);
    }
  }

  const parsed = parseResumeText(textToParse || '');
  if (fileName) {
    parsed.fileName = fileName;
  }

  if (db && userId) {
    await saveUserResume(userId, parsed, fileName, userProfile);
  }

  return { parsedResume: parsed };
}

/**
 * Save user resume, extracted skills, and track version history in Firestore
 */
export async function saveUserResume(userId, parsedResume, fileName = '', userProfile = {}) {
  if (!db || !userId) return;

  try {
    const resumeData = {
      userId,
      candidateName: userProfile.name || parsedResume.candidateName || 'Candidate',
      email: userProfile.email || parsedResume.email || '',
      phone: parsedResume.phone || '',
      links: parsedResume.links || {},
      experienceYears: parsedResume.experienceYears || 0,
      skills: parsedResume.skills || [],
      skillsCategorized: parsedResume.skillsCategorized || {},
      education: parsedResume.education || [],
      projects: parsedResume.projects || [],
      rawText: parsedResume.rawText || '',
      fileName: fileName || parsedResume.fileName || 'Resume Document',
      parsedAt: parsedResume.parsedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save directly to `resumes/{userId}`
    await setDoc(doc(db, 'resumes', userId), resumeData, { merge: true });

    // 2. Update `users/{userId}` with latest extracted skills and status
    await setDoc(doc(db, 'users', userId), {
      skills: parsedResume.skills || [],
      resumeUploaded: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 3. Append to career progress tracking history
    await recordCareerProgressSnapshot(userId, {
      skills: parsedResume.skills || [],
      skillsCount: (parsedResume.skills || []).length,
      experienceYears: parsedResume.experienceYears || 0,
      fileName: fileName || parsedResume.fileName || 'Uploaded Resume',
      timestamp: new Date().toISOString()
    });

    // 4. Update guidance relevance based on updated skills
    await checkAndUpdateGuidanceRelevance(userId, parsedResume.skills || []);

    // 5. Audit Log
    await addAuditLog('RESUME_UPLOADED', userProfile.name || 'Job Seeker', userId, `Uploaded and parsed resume with ${parsedResume.skills.length} extracted skills.`);
  } catch (err) {
    console.error('Error saving resume to Firestore:', err);
    throw err;
  }
}

/**
 * Retrieve saved resume for a user by their Firebase UID
 */
export async function getUserResume(userId) {
  if (!db || !userId) return null;

  try {
    const resumeDoc = await getDoc(doc(db, 'resumes', userId));
    if (resumeDoc.exists()) {
      return { id: resumeDoc.id, ...resumeDoc.data() };
    }
    return null;
  } catch (err) {
    console.warn('Error fetching resume from Firestore:', err.message);
    return null;
  }
}

/**
 * Completely delete stored resume and associated extracted skills for a user
 */
export async function deleteUserResume(userId, userName = '') {
  if (!db || !userId) return;

  try {
    // 1. Delete resume doc
    await deleteDoc(doc(db, 'resumes', userId));

    // 2. Reset user skills & resumeUploaded flag
    await setDoc(doc(db, 'users', userId), {
      skills: [],
      atsScore: 0,
      resumeUploaded: false,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 3. Log event
    await addAuditLog('RESUME_DELETED', userName || 'Job Seeker', userId, 'Deleted resume and extracted skills.');
    return { success: true };
  } catch (err) {
    console.error('Error deleting resume:', err);
    throw err;
  }
}

// ==========================================
// ATS ANALYSIS OPERATIONS
// ==========================================

export async function runAtsAnalysis(payload) {
  const { parsedResume, jobId, customJdText, userId, userProfile } = payload;
  let jobTitle = "Target Role";
  let jdText = customJdText || "";
  let reqSkills = [];
  let minExp = 0;

  if (jobId && db) {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (jobDoc.exists()) {
        const j = jobDoc.data();
        jobTitle = j.title;
        jdText = j.description || "";
        reqSkills = Array.isArray(j.requiredSkills) 
          ? j.requiredSkills 
          : (j.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);
        minExp = parseInt(j.minExperience, 10) || 0;
      }
    } catch (e) {}
  }

  const report = analyzeAtsMatch(parsedResume, jdText, jobTitle, reqSkills, minExp);

  if (db && userId) {
    try {
      // Save report
      await addDoc(collection(db, 'ats_reports'), {
        userId,
        jobId: jobId || 'custom',
        jobTitle,
        report,
        totalAtsScore: report.totalAtsScore,
        createdAt: new Date().toISOString()
      });

      // Update user atsScore
      await setDoc(doc(db, 'users', userId), {
        atsScore: report.totalAtsScore,
        skills: parsedResume.skills || [],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update career progress with latest score
      await recordCareerProgressSnapshot(userId, {
        atsScore: report.totalAtsScore,
        jobTitle,
        skills: parsedResume.skills || [],
        timestamp: new Date().toISOString()
      });

      // Audit Log
      await addAuditLog('ATS_ANALYSIS', userProfile?.name || 'Job Seeker', userId, `Computed ATS score ${report.totalAtsScore}% for ${jobTitle}.`);
    } catch (err) {
      console.warn('Firestore report save notice:', err.message);
    }
  }

  return { report };
}

export async function getLatestAtsReport(userId) {
  if (!db || !userId) return null;

  try {
    const q = query(
      collection(db, 'ats_reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().report;
    }
  } catch (err) {
    // Fallback: query without order if index is pending
    try {
      const qFallback = query(collection(db, 'ats_reports'), where('userId', '==', userId), limit(5));
      const snapshot = await getDocs(qFallback);
      if (!snapshot.empty) {
        return snapshot.docs[snapshot.docs.length - 1].data().report;
      }
    } catch (e) {}
  }
  return null;
}

// ==========================================
// CAREER PROGRESS TRACKING
// ==========================================

export async function recordCareerProgressSnapshot(userId, snapshotData) {
  if (!db || !userId) return;

  try {
    const progressDocRef = doc(db, 'career_progress', userId);
    const existing = await getDoc(progressDocRef);
    let history = [];

    if (existing.exists()) {
      history = existing.data().history || [];
    }

    history.push({
      ...snapshotData,
      id: `rev_${Date.now()}`
    });

    // Keep up to latest 20 snapshots
    if (history.length > 20) {
      history = history.slice(history.length - 20);
    }

    await setDoc(progressDocRef, {
      userId,
      history,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Career progress tracking notice:', err.message);
  }
}

export async function getCareerProgress(userId) {
  if (!db || !userId) return [];

  try {
    const docSnap = await getDoc(doc(db, 'career_progress', userId));
    if (docSnap.exists()) {
      return docSnap.data().history || [];
    }
  } catch (err) {
    console.warn('Error fetching career progress:', err.message);
  }
  return [];
}

// ==========================================
// JOB POSTINGS & APPLICATIONS (RECRUITER & SEEKER)
// ==========================================

export async function getJobPostings() {
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'jobs'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching jobs:', err.message);
    return [];
  }
}

export async function createJobPosting(jobData) {
  if (!db) throw new Error("Database not connected");

  const newJob = {
    ...jobData,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'jobs'), newJob);
  newJob.id = docRef.id;

  await addAuditLog('JOB_POSTED', jobData.postedBy || 'Recruiter', jobData.postedById || 'recruiter', `Posted new job opening: "${newJob.title}".`);
  return { job: newJob };
}

export async function applyForJob(applicationData) {
  if (!db) throw new Error("Database not connected");

  const newApp = {
    ...applicationData,
    status: 'Applied',
    evaluationNotes: '',
    rating: 0,
    appliedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'applications'), newApp);
  newApp.id = docRef.id;

  await addAuditLog('JOB_APPLICATION', applicationData.candidateName || 'Applicant', applicationData.userId, `Applied for job: "${applicationData.jobTitle}".`);
  return { application: newApp };
}

export async function getCandidateApplications() {
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'applications'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching applications:', err.message);
    return [];
  }
}

export async function updateCandidateStatus(appId, status, evaluationNotes = '', rating = 0) {
  if (!db || !appId) return { success: false };

  try {
    const appRef = doc(db, 'applications', appId);
    const updatePayload = { 
      status,
      updatedAt: new Date().toISOString()
    };
    if (evaluationNotes) {
      updatePayload.evaluationNotes = evaluationNotes;
      updatePayload.recruiterNotes = evaluationNotes;
    }
    if (rating) updatePayload.rating = rating;
    if (status === 'Shortlisted') {
      updatePayload.shortlistedAt = new Date().toISOString();
    }

    await updateDoc(appRef, updatePayload);
    await addAuditLog('CANDIDATE_STATUS_UPDATED', 'Recruiter', appId, `Candidate status changed to '${status}'.`);
    return { success: true };
  } catch (err) {
    console.error('Error updating candidate status:', err);
    throw err;
  }
}

export async function updateJobPosting(jobId, updateData) {
  if (!db || !jobId) return { success: false };
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    await addAuditLog('JOB_UPDATED', 'Recruiter', jobId, `Updated job opening: "${updateData.title || jobId}".`);
    return { success: true };
  } catch (err) {
    console.error('Error updating job posting:', err);
    throw err;
  }
}

export async function getAppliedJobsForUser(userId) {
  if (!db || !userId) return [];
  try {
    const q = query(collection(db, 'applications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching applied jobs for user:', err.message);
    return [];
  }
}

export async function getShortlistedJobsForUser(userId) {
  if (!db || !userId) return [];
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      where('status', '==', 'Shortlisted')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    try {
      const allApps = await getAppliedJobsForUser(userId);
      return allApps.filter(app => app.status === 'Shortlisted');
    } catch (e) {
      return [];
    }
  }
}

// ==========================================
// CAREER COUNSELOR & PLACEMENT OFFICER
// ==========================================

/**
 * Fetch actual registered Job Seekers from Firestore with their real resumes and ATS scores
 */
export async function getJobSeekers() {
  if (!db) return [];

  try {
    // 1. Fetch all users with role 'Job Seeker'
    const q = query(collection(db, 'users'), where('role', '==', 'Job Seeker'));
    const userSnapshot = await getDocs(q);
    const jobSeekers = [];

    for (const uDoc of userSnapshot.docs) {
      const uData = uDoc.data();
      const userId = uDoc.id;

      // 2. Fetch their actual uploaded resume
      let resumeData = null;
      try {
        const resumeDoc = await getDoc(doc(db, 'resumes', userId));
        if (resumeDoc.exists()) {
          resumeData = resumeDoc.data();
        }
      } catch (e) {}

      // Combine user info with real resume data
      const skills = resumeData?.skills || uData.skills || [];
      const atsScore = uData.atsScore || 0;

      jobSeekers.push({
        id: userId,
        uid: userId,
        name: uData.name || resumeData?.candidateName || uData.email?.split('@')[0] || 'Job Seeker',
        email: uData.email || resumeData?.email || '',
        department: uData.department || 'General',
        cohort: uData.cohort || 'Registered Candidate',
        atsScore,
        skills,
        skillsCategorized: resumeData?.skillsCategorized || {},
        resume: resumeData,
        experienceYears: resumeData?.experienceYears || 0,
        education: resumeData?.education || [],
        rawText: resumeData?.rawText || '',
        readinessStatus: atsScore >= 80 ? 'Placement Ready' : atsScore >= 60 ? 'Moderate Readiness' : 'Needs Skill Building',
        resumeUploaded: !!resumeData
      });
    }

    return jobSeekers;
  } catch (err) {
    console.warn('Error fetching job seekers:', err.message);
    return [];
  }
}

export async function addCounselorGuidance(noteData) {
  if (!db) throw new Error("Database not connected");

  const newG = {
    ...noteData,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'guidance'), newG);
  newG.id = docRef.id;

  await addAuditLog('GUIDANCE_PROVIDED', noteData.counselorName || 'Counselor', noteData.jobSeekerId, `Provided guidance for ${noteData.jobSeekerName}: "${noteData.category}".`);
  return { guidance: newG };
}

export async function updateCounselorGuidance(guidanceId, updateFields) {
  if (!db || !guidanceId) return { success: false };

  try {
    const docRef = doc(db, 'guidance', guidanceId);
    await updateDoc(docRef, {
      ...updateFields,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.error('Error updating guidance:', err);
    throw err;
  }
}

export async function getGuidanceForJobSeeker(jobSeekerId) {
  if (!db || !jobSeekerId) return [];

  try {
    const q = query(collection(db, 'guidance'), where('jobSeekerId', '==', jobSeekerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching student guidance:', err.message);
    return [];
  }
}

export async function getAllGuidance() {
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'guidance'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching all guidance:', err.message);
    return [];
  }
}

/**
 * Checks if previously provided guidance for a user is now addressed by newly uploaded skills
 */
export async function checkAndUpdateGuidanceRelevance(userId, newSkills = []) {
  if (!db || !userId) return;

  try {
    const lowerSkills = new Set(newSkills.map(s => s.toLowerCase()));
    const existingGuidance = await getGuidanceForJobSeeker(userId);

    for (const g of existingGuidance) {
      if (g.status === 'Active') {
        const noteLower = (g.note || '').toLowerCase();
        // Check if the guidance explicitly recommended a skill that is now in newSkills
        let addressed = false;
        lowerSkills.forEach(sk => {
          if (noteLower.includes(sk) && sk.length > 2) {
            addressed = true;
          }
        });

        if (addressed) {
          await updateDoc(doc(db, 'guidance', g.id), {
            status: 'Addressed',
            statusNote: 'Updated resume includes previously suggested skills.',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn('Guidance update check notice:', err.message);
  }
}

// ==========================================
// SYSTEM ADMINISTRATOR
// ==========================================

export async function getAllUsers() {
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Error fetching all users:', err.message);
    return [];
  }
}

export async function updateUserRole(userId, newRole) {
  if (!db || !userId) return { success: false };

  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    await addAuditLog('ROLE_MODIFIED', 'System Administrator', userId, `Updated user role to '${newRole}'.`);
    return { success: true };
  } catch (err) {
    console.error('Error updating user role:', err);
    throw err;
  }
}

export async function getAdminStats() {
  if (!db) {
    return { totalUsers: 0, resumesParsedCount: 0, jobPostingsCount: 0, applicationsCount: 0 };
  }

  try {
    const [usersSnap, resumesSnap, jobsSnap, appsSnap] = await Promise.all([
      getDocs(collection(db, 'users')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'resumes')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'jobs')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'applications')).catch(() => ({ size: 0 }))
    ]);

    return {
      totalUsers: usersSnap.size || 0,
      resumesParsedCount: resumesSnap.size || 0,
      jobPostingsCount: jobsSnap.size || 0,
      applicationsCount: appsSnap.size || 0
    };
  } catch (err) {
    console.warn('Admin stats error:', err.message);
    return { totalUsers: 0, resumesParsedCount: 0, jobPostingsCount: 0, applicationsCount: 0 };
  }
}

export async function getAdminLogs() {
  if (!db) return [];

  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    // Fallback if index on timestamp is not yet built
    try {
      const fallbackSnap = await getDocs(collection(db, 'audit_logs'));
      const logs = fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return logs.reverse().slice(0, 50);
    } catch (e) {
      return [];
    }
  }
}
