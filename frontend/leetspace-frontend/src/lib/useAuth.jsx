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
      console.log('🔄 Registering user with backend...', firebaseUser.uid);
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/register`;
      console.log('📡 Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
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

      console.log('📥 Backend response status:', response.status);

      if (response.ok) {
        const userProfile = await response.json();
        console.log('✅ User profile created/updated:', userProfile);
        setUserProfile(userProfile);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to register user with backend:', response.status, errorText);
        // For development, create a minimal profile to allow authentication
        setUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error registering user with backend:', error);
      // For development, create a minimal profile to allow authentication
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName,
        created_at: new Date().toISOString()
      });
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
    isAuthenticated: !!user // For now, just check if Firebase user exists
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
