// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBnKIwRsTYWX9Acc66dKGEuSRaPCfM2MNU",
  authDomain: "leetspaceauth.firebaseapp.com",
  projectId: "leetspaceauth",
  storageBucket: "leetspaceauth.firebasestorage.app",
  messagingSenderId: "11940892272",
  appId: "1:11940892272:web:d4f1742db569b474166eb5",
  measurementId: "G-VNVMM0N5K5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set auth persistence to local storage for better user experience
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Note: Firebase emulator connection is disabled by default
// To enable it, uncomment the code below and ensure the emulator is running on port 9099
/*
if (import.meta.env.MODE === 'development') {
  try {
    if (window.location.hostname === 'localhost') {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      console.log("Connected to Firebase Auth emulator");
    }
  } catch (error) {
    console.log("Auth emulator connection failed:", error.message);
  }
}
*/

// Auth error code mappings for better user experience
export const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
  'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
  'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  // Continue URL / action code errors
  'auth/invalid-continue-uri': 'The return URL is invalid. Please contact support.',
  'auth/unauthorized-continue-uri': 'The return URL is not allowed. Please contact support.',
  'auth/missing-continue-uri': 'Missing return URL for the operation. Please try again later.'
};

// Helper function to get user-friendly error messages
export const getAuthErrorMessage = (errorCode) => {
  return AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
};

export default app;