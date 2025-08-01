import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Register user with backend
  const registerUserWithBackend = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName
        })
      });

      if (response.ok) {
        const userProfile = await response.json();
        setUserProfile(userProfile);
      } else {
        console.error('Failed to register user with backend');
      }
    } catch (error) {
      console.error('Error registering user with backend:', error);
    }
  };

  // Get current user token
  const getToken = async () => {
    if (user) {
      try {
        const idToken = await user.getIdToken(true); // Force refresh
        setToken(idToken);
        return idToken;
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    }
    return null;
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const idToken = await getToken();
      if (!idToken) throw new Error('No authentication token');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        return updatedProfile;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, register with backend
        await registerUserWithBackend(firebaseUser);
      } else {
        // User is signed out
        setUserProfile(null);
        setToken(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh token periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        await getToken();
      }, 30 * 60 * 1000); // Refresh every 30 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    userProfile,
    loading,
    token,
    getToken,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
