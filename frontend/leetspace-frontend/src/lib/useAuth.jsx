import { useState, useEffect, useContext, createContext } from "react";
// import { auth } from "./firebase"; // your Firebase config
// import { onAuthStateChanged } from "firebase/auth";
import apiService from "./api"; // Our backend API service

// 1. Create context
const AuthContext = createContext();

// 2. Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    //   setUser(firebaseUser);
    //   setLoading(false);
    // }
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Verify token and get user data
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be invalid, clear it
        apiService.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password });
      
      // Get user data after successful login
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
    setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, fullName = null) => {
    try {
      setLoading(true);
      const userData = await apiService.register({
        email,
        password,
        full_name: fullName
      });
      
      // Auto-login after registration
      await login(email, password);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state
      setUser(null);
      return { success: true };
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    // <AuthContext.Provider value={{ user, loading }}>
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook to use auth context
export function useAuth() {
//   return useContext(AuthContext);
// }
const context = useContext(AuthContext);
if (context === undefined) {
  throw new Error('useAuth must be used within an AuthProvider');
}
return context;
}
