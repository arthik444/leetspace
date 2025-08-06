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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth persistence to local storage for better user experience
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Connect to auth emulator in development (optional)
if (import.meta.env.MODE === 'development') {
  try {
    // Only try to connect to emulator if we haven't already connected
    // Check if we're running on localhost and the auth URL doesn't include the emulator
    if (window.location.hostname === 'localhost' && !auth.config?.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      console.log("Connected to Firebase Auth emulator");
    }
  } catch (error) {
    // Emulator might already be connected, not available, or we're not in the right environment
    console.log("Auth emulator connection skipped:", error.message);
  }
}

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
};

// Helper function to get user-friendly error messages
export const getAuthErrorMessage = (errorCode) => {
  return AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
};

export default app;