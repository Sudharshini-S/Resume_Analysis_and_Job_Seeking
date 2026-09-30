import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBS0ZLt9JP1HFaJhdHpI-kqUZUtGrAo40w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "resume-ats-analysis.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "resume-ats-analysis",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "resume-ats-analysis.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "814756391347",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:814756391347:web:93f78a75bf750cc794c3c6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N8BSS3Y2BP"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, firebaseConfig };