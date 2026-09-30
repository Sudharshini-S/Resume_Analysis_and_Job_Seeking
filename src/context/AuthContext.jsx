import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const ROLES = {
  JOB_SEEKER: 'Job Seeker',
  RECRUITER: 'Recruiter',
  COUNSELOR: 'Career Counselor',
  ADMIN: 'System Administrator'
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // 1. Initial cached user - immediately display if available so user is never blocked
    const savedUser = localStorage.getItem('smart_ats_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === 'admin@gmail.com') {
          parsed.role = ROLES.ADMIN;
        }
        setCurrentUser(parsed);
        if (parsed.role === ROLES.RECRUITER) setActiveTab('post_jobs');
        else if (parsed.role === ROLES.ADMIN) setActiveTab('overview');
        else if (parsed.role === ROLES.COUNSELOR) setActiveTab('roster');
        setLoading(false);
      } catch (e) {}
    }

    // Fallback safety timeout: ensure loading state never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // 2. Listen to real Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        clearTimeout(safetyTimer);
        if (user) {
          const isAdmin = user.email?.toLowerCase() === 'admin@gmail.com';
          let userData = {
            uid: user.uid,
            name: isAdmin ? 'System Administrator' : (user.displayName || user.email.split('@')[0]),
            email: user.email,
            role: isAdmin ? ROLES.ADMIN : ROLES.JOB_SEEKER,
            atsScore: 0,
            skills: []
          };

          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              // Live Firestore data
              userData = { uid: user.uid, ...userDoc.data() };
              if (isAdmin) {
                userData.role = ROLES.ADMIN;
              }
            } else {
              // Save initial profile to Firestore if missing
              await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
            }
          } catch (err) {
            console.warn('Firestore user fetch notice:', err.message);
          }

          setCurrentUser(userData);
          localStorage.setItem('smart_ats_active_user', JSON.stringify(userData));
          if (userData.role === ROLES.RECRUITER) {
            setActiveTab('post_jobs');
          } else if (userData.role === ROLES.ADMIN) {
            setActiveTab('overview');
          } else if (userData.role === ROLES.COUNSELOR) {
            setActiveTab('roster');
          } else {
            setActiveTab('upload');
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('smart_ats_active_user');
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase auth state error:', error);
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email, password) => {
    const trimmedEmail = email.trim();
    const isAdmin = trimmedEmail.toLowerCase() === 'admin@gmail.com';

    try {
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      let userData = {
        uid: res.user.uid,
        email: res.user.email,
        name: isAdmin ? 'System Administrator' : (res.user.displayName || res.user.email.split('@')[0]),
        role: isAdmin ? ROLES.ADMIN : ROLES.JOB_SEEKER,
        atsScore: 0,
        skills: []
      };

      try {
        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
        if (userDoc.exists()) {
          userData = { uid: res.user.uid, ...userDoc.data() };
          if (isAdmin) {
            userData.role = ROLES.ADMIN;
            await setDoc(doc(db, 'users', res.user.uid), { role: ROLES.ADMIN }, { merge: true });
          }
        } else {
          await setDoc(doc(db, 'users', res.user.uid), userData, { merge: true });
        }
      } catch (e) {}

      setCurrentUser(userData);
      localStorage.setItem('smart_ats_active_user', JSON.stringify(userData));
      if (userData.role === ROLES.RECRUITER) setActiveTab('post_jobs');
      else if (userData.role === ROLES.ADMIN) setActiveTab('overview');
      else if (userData.role === ROLES.COUNSELOR) setActiveTab('roster');
      else setActiveTab('upload');
      return userData;
    } catch (err) {
      // If admin@gmail.com does not exist in Firebase Auth yet, automatically register and log in!
      if (isAdmin && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found')) {
        try {
          return await registerWithEmail(trimmedEmail, password, 'System Administrator', ROLES.ADMIN);
        } catch (regErr) {
          if (regErr.code === 'auth/email-already-in-use') {
            const msg = 'admin@gmail.com exists with a different password. Please enter the password used when it was created.';
            showNotification(msg, 'error');
            throw new Error(msg);
          }
        }
      }

      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. If you are a new user, please click "Create Account" first.';
      }
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email, password, name, role, company = '') => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const isAdmin = email.toLowerCase() === 'admin@gmail.com';
      const assignedRole = isAdmin ? ROLES.ADMIN : (role || ROLES.JOB_SEEKER);
      const userData = {
        uid: res.user.uid,
        name: name || email.split('@')[0],
        email,
        role: assignedRole,
        company: company || (assignedRole === ROLES.RECRUITER ? 'Recruiter Organization' : ''),
        atsScore: 0,
        skills: [],
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', res.user.uid), userData, { merge: true });
      } catch (e) {}

      setCurrentUser(userData);
      localStorage.setItem('smart_ats_active_user', JSON.stringify(userData));
      if (assignedRole === ROLES.RECRUITER) setActiveTab('post_jobs');
      else if (assignedRole === ROLES.ADMIN) setActiveTab('overview');
      else if (assignedRole === ROLES.COUNSELOR) setActiveTab('roster');
      else setActiveTab('upload');
      return userData;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const loginWithGoogle = async (role, company = '') => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      let userData = {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: role || ROLES.JOB_SEEKER,
        company: company || (role === ROLES.RECRUITER ? 'Recruiter Organization' : ''),
        atsScore: 0,
        skills: []
      };

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userData = { uid: user.uid, ...userDoc.data() };
        } else {
          await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        }
      } catch (e) {}

      setCurrentUser(userData);
      localStorage.setItem('smart_ats_active_user', JSON.stringify(userData));
      setActiveTab(userData.role === ROLES.RECRUITER ? 'post_jobs' : 'upload');
      return userData;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('smart_ats_active_user');
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    setActiveTab('upload');
  };

  const updateUserProfileInState = (updatedFields) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('smart_ats_active_user', JSON.stringify(updated));
      return updated;
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeTab,
        setActiveTab,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfileInState,
        notification,
        showNotification,
        ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
