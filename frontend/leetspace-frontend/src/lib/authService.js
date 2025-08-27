// src/lib/authService.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    deleteUser,
    reload,
    fetchSignInMethodsForEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    applyActionCode,
    checkActionCode
  } from "firebase/auth";
  import { auth, getAuthErrorMessage } from "./firebase";
  
  // Configure Google Auth Provider
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  // Authentication service class
  export class AuthService {
    
    // Sign up with email and password
    static async signUpWithEmail(email, password, displayName = '') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Update user profile with display name if provided
        if (displayName.trim()) {
          await updateProfile(user, { displayName: displayName.trim() });
        }
  
        // Send email verification
        await this.sendEmailVerification(user);
  
        return {
          success: true,
          user: user,
          message: 'Account created successfully! Please check your email for verification.'
        };
      } catch (error) {
        console.error('Sign up error:', error);
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }
  
    // Sign in with email and password
    static async signInWithEmail(email, password) {
      try {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          return {
            success: false,
            error: 'Please verify your email before signing in.',
            needsVerification: true,
            user: user
          };
        }

        return {
          success: true,
          user: user,
          message: 'Signed in successfully!'
        };
      } catch (error) {
        // For credential-related errors, use generic message for security
        if (error.code === 'auth/wrong-password' || 
            error.code === 'auth/invalid-credential' || 
            error.code === 'auth/user-not-found') {
          return {
            success: false,
            error: 'Invalid email or password.',
            code: 'auth/invalid-credential'
          };
        }

        // For other errors, return the Firebase error
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }
  
    // Sign in with Google
    static async signInWithGoogle() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Google accounts are automatically verified
        return {
          success: true,
          user: user,
          message: 'Signed in with Google successfully!',
          isNewUser: result._tokenResponse?.isNewUser || false
        };
      } catch (error) {
        console.error('Google sign in error:', error);
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }
  
    // Send email verification
    static async sendEmailVerification(user = auth.currentUser) {
      try {
        if (!user) {
          throw new Error('No user found');
        }
  
        await sendEmailVerification(user, {
          url: window.location.origin + '/reset-password',
          handleCodeInApp: true
        });
  
        return {
          success: true,
          message: 'Verification email sent successfully!'
        };
      } catch (error) {
        console.error('Email verification error:', error);
        return {
          success: false,
          error: 'Failed to send verification email. Please try again.',
          code: error.code
        };
      }
    }
  
    // Send password reset email
    static async sendPasswordReset(email) {
      try {
        // Attempt password reset directly - let Firebase handle email validation
        await sendPasswordResetEmail(auth, email, {
          url: window.location.origin + '/reset-password',
          handleCodeInApp: true
        });
  
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        };
      } catch (error) {
        console.error('Password reset error (with continue URL):', error);

        // Known continue URL issues: retry without custom ActionCodeSettings
        const continueUriErrors = new Set([
          'auth/invalid-continue-uri',
          'auth/unauthorized-continue-uri',
          'auth/missing-continue-uri',
        ]);

        if (continueUriErrors.has(error.code)) {
          try {
            await sendPasswordResetEmail(auth, email);
            return {
              success: true,
              message: 'If an account with that email exists, a password reset link has been sent.'
            };
          } catch (fallbackError) {
            console.error('Password reset fallback error (no continue URL):', fallbackError);
            return {
              success: false,
              error: getAuthErrorMessage(fallbackError.code),
              code: fallbackError.code
            };
          }
        }
        
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }

      // Verify password reset code and get email
      static async verifyPasswordResetCode(oobCode) {
        try {
          const email = await verifyPasswordResetCode(auth, oobCode);
          return { success: true, email };
        } catch (error) {
          console.error('verifyPasswordResetCode error:', error);
          return { success: false, error: getAuthErrorMessage(error.code), code: error.code };
        }
      }
    
      // Confirm password reset with new password
      static async confirmPasswordReset(oobCode, newPassword) {
        try {
          await confirmPasswordReset(auth, oobCode, newPassword);
          return { success: true };
        } catch (error) {
          console.error('confirmPasswordReset error:', error);
          return { success: false, error: getAuthErrorMessage(error.code), code: error.code };
        }
      }

      // Check action code (for both email verification and password reset)
      static async checkActionCode(oobCode) {
        try {
          const info = await checkActionCode(auth, oobCode);
          return { 
            success: true, 
            operation: info.operation,
            data: info.data 
          };
        } catch (error) {
          console.error('checkActionCode error:', error);
          return { success: false, error: getAuthErrorMessage(error.code), code: error.code };
        }
      }

      // Apply action code (for email verification)
      static async applyActionCode(oobCode) {
        try {
          await applyActionCode(auth, oobCode);
          return { success: true };
        } catch (error) {
          console.error('applyActionCode error:', error);
          return { success: false, error: getAuthErrorMessage(error.code), code: error.code };
        }
      }
  
    // Sign out
    static async signOut() {
      try {
        await signOut(auth);
        return {
          success: true,
          message: 'Signed out successfully!'
        };
      } catch (error) {
        console.error('Sign out error:', error);
        return {
          success: false,
          error: 'Failed to sign out. Please try again.',
          code: error.code
        };
      }
    }
  
    // Update user profile
    static async updateUserProfile(updates) {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user found');
        }
  
        await updateProfile(user, updates);
        
        return {
          success: true,
          message: 'Profile updated successfully!'
        };
      } catch (error) {
        console.error('Profile update error:', error);
        return {
          success: false,
          error: 'Failed to update profile. Please try again.',
          code: error.code
        };
      }
    }
  
    // Update password
    static async updatePassword(currentPassword, newPassword) {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user found');
        }
        if (currentPassword === newPassword) {
          return {
            success: false,
            error: 'New password must be different from current password',
            code: 'auth/same-password'
          };
        }
        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
  
        // Update password
        await updatePassword(user, newPassword);
  
        return {
          success: true,
          message: 'Password updated successfully!'
        };
      } catch (error) {
        console.error('Password update error:', error);
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }
  
    // Delete user account
    static async deleteAccount(password) {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user found');
        }
  
        // Re-authenticate user first if they have a password
        if (password && user.providerData.some(provider => provider.providerId === 'password')) {
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
        }
  
        await deleteUser(user);
  
        return {
          success: true,
          message: 'Account deleted successfully!'
        };
      } catch (error) {
        console.error('Account deletion error:', error);
        return {
          success: false,
          error: getAuthErrorMessage(error.code),
          code: error.code
        };
      }
    }
  
    // Reload user data
    static async reloadUser() {
      try {
        const user = auth.currentUser;
        if (user) {
          await reload(user);
          return {
            success: true,
            user: user
          };
        }
        return {
          success: false,
          error: 'No user found'
        };
      } catch (error) {
        console.error('Reload user error:', error);
        return {
          success: false,
          error: 'Failed to reload user data',
          code: error.code
        };
      }
    }
  
    // Check if email is verified
    static isEmailVerified(user = auth.currentUser) {
      return user?.emailVerified || false;
    }
  
    // Get current user
    static getCurrentUser() {
      return auth.currentUser;
    }
  
    // Get user provider information
    static getUserProviders(user = auth.currentUser) {
      if (!user) return [];
      return user.providerData.map(provider => provider.providerId);
    }
  
    // Check if user has password provider
    static hasPasswordProvider(user = auth.currentUser) {
      return this.getUserProviders(user).includes('password');
    }
  
    // Check if user has Google provider
    static hasGoogleProvider(user = auth.currentUser) {
      return this.getUserProviders(user).includes('google.com');
    }
  }
  
  // Validation utilities
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    return {
      isValid: password.length >= minLength,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      score: [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      ].filter(Boolean).length
    };
  };
  
  export default AuthService;