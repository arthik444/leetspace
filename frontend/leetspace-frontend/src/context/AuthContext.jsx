import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // make sure this path is correct
import AuthService from "@/lib/authService";
// import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!initialized) {
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [initialized]);

  const signUp = useCallback(async (email, password, displayName = '') => {
    setLoading(true);
    try {
      const result = await AuthService.signUpWithEmail(email, password, displayName);
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred', code: error?.code };
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithEmail(email, password);
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        if (result.needsVerification) {
          return { 
            success: false, 
            error: result.error, 
            needsVerification: true,
            user: result.user,
            code: result.code,
          };
        }
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred', code: error?.code };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      if (result.success) {
        return { 
          success: true, 
          user: result.user, 
          isNewUser: result.isNewUser 
        };
      } else {
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: 'An unexpected error occurred', code: error?.code };
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmailVerification = useCallback(async () => {
    try {
      const result = await AuthService.sendEmailVerification();
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    try {
      const result = await AuthService.sendPasswordReset(email);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to send password reset email' };
    }
  }, []);

  const verifyResetCode = useCallback(async (oobCode) => {
    return AuthService.verifyPasswordResetCode(oobCode);
  }, []);

  const confirmPasswordReset = useCallback(async (oobCode, newPassword) => {
    return AuthService.confirmPasswordReset(oobCode, newPassword);
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AuthService.signOut();
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Failed to sign out' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const result = await AuthService.updateUserProfile(updates);
      if (result.success) {
        // Optimistic local update for immediate UI feedback
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
        // Reload user to get updated data from Firebase
        await AuthService.reloadUser();
        setUser(auth.currentUser);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const result = await AuthService.updatePassword(currentPassword, newPassword);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }, []);

  const deleteAccount = useCallback(async (password) => {
    try {
      const result = await AuthService.deleteAccount(password);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }, []);

  const reloadUser = useCallback(async () => {
    try {
      await AuthService.reloadUser();
      setUser(auth.currentUser);
      return { success: true };
    } catch (error) {
      console.error('Reload user error:', error);
      return { success: false, error: 'Failed to reload user data' };
    }
  }, []);

    const isEmailVerified = AuthService.isEmailVerified(user);
    const hasPasswordProvider = AuthService.hasPasswordProvider(user);
    const hasGoogleProvider = AuthService.hasGoogleProvider(user);
    const userProviders = AuthService.getUserProviders(user);
  
    const value = {
      user,
      loading,
      initialized,
      isEmailVerified,
      hasPasswordProvider,
      hasGoogleProvider,
      userProviders,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      sendEmailVerification,
      sendPasswordReset,
      updatePassword,
      updateProfile,
      deleteAccount,
      reloadUser,
      verifyResetCode,
      confirmPasswordReset,
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
