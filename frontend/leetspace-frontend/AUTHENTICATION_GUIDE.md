# LeetSpace Authentication System Guide

## Overview

This guide documents the enhanced Firebase authentication system implemented in the LeetSpace application. The system provides robust user authentication with email verification, Google OAuth, password strength validation, and comprehensive user management features.

## Features

### ✅ Core Authentication
- **Email/Password Sign Up & Sign In** with comprehensive validation
- **Google OAuth** integration with enhanced error handling
- **Email Verification** required for new accounts
- **Password Reset** functionality
- **Automatic Authentication Persistence** across browser sessions

### ✅ Security Features
- **Password Strength Validation** with real-time feedback
- **Protected Routes** with authentication and email verification requirements
- **Session Management** with automatic token refresh
- **User Account Management** (profile updates, password changes, account deletion)

### ✅ User Experience
- **Real-time Form Validation** with user-friendly error messages
- **Loading States** and **Success/Error Notifications**
- **Responsive Design** with dark mode support
- **Comprehensive User Profile** management interface

## File Structure

```
src/
├── lib/
│   ├── firebase.js              # Firebase configuration and setup
│   └── authService.js           # Authentication service with all auth methods
├── context/
│   └── AuthContext.jsx          # React context for authentication state
├── components/
│   ├── login-form.jsx           # Enhanced login/signup form
│   ├── PasswordStrengthIndicator.jsx  # Password strength component
│   ├── ProtectedRoute.jsx       # Route protection component
│   └── Navbar.jsx               # Navigation with user menu
├── pages/
│   ├── Auth.jsx                 # Authentication page
│   └── Profile.jsx              # User profile management page
└── App.jsx                      # Main app with protected routes
```

## Implementation Details

### 1. Firebase Configuration (`src/lib/firebase.js`)

Enhanced Firebase setup with:
- **Auth Persistence**: Automatic session persistence using `browserLocalPersistence`
- **Development Emulator**: Optional Firebase Auth emulator connection for development
- **Error Handling**: Comprehensive error message mapping for better UX

```javascript
// Key features:
- Enhanced error messages for all Firebase auth error codes
- Auth persistence configuration
- Development emulator support
- Helper function for user-friendly error messages
```

### 2. Authentication Service (`src/lib/authService.js`)

Comprehensive service class providing:
- **Account Creation**: Email/password with display name and automatic email verification
- **Sign In**: Email/password with email verification check
- **Google OAuth**: Enhanced Google sign-in with profile scopes
- **Email Verification**: Send and resend verification emails
- **Password Management**: Reset, update with re-authentication
- **Profile Management**: Update display name and other profile info
- **Account Deletion**: Secure account deletion with password confirmation
- **Utility Functions**: Email and password validation

### 3. Authentication Context (`src/context/AuthContext.jsx`)

React context providing:
- **User State Management**: Current user, loading states, email verification status
- **Authentication Methods**: All auth operations with toast notifications
- **Helper Properties**: Provider information, verification status
- **Error Handling**: Consistent error handling with user feedback

### 4. Enhanced Login Form (`src/components/login-form.jsx`)

Feature-rich authentication form with:
- **Dual Mode**: Login and signup in one component
- **Real-time Validation**: Email format, password strength, required fields
- **Password Visibility Toggle**: Show/hide password functionality
- **Email Verification Flow**: Handle unverified email states
- **Google OAuth Integration**: One-click Google sign-in
- **Password Reset**: Integrated forgot password functionality

### 5. Password Strength Indicator (`src/components/PasswordStrengthIndicator.jsx`)

Real-time password validation showing:
- **Strength Meter**: Visual strength indicator with color coding
- **Requirements Checklist**: Character length, uppercase, lowercase, numbers, special chars
- **Progressive Enhancement**: Score-based strength calculation

### 6. Protected Routes (`src/components/ProtectedRoute.jsx`)

Route protection with:
- **Authentication Check**: Redirect unauthenticated users to login
- **Email Verification**: Optional email verification requirement
- **Loading States**: Proper loading indicators during auth checks
- **Email Verification Prompt**: Full-screen prompt for unverified users

### 7. User Profile Management (`src/pages/Profile.jsx`)

Comprehensive account management with:
- **Profile Tab**: Display name editing, email verification status
- **Security Tab**: Connected accounts, password change
- **Danger Zone Tab**: Account deletion with confirmation
- **Real-time Updates**: Immediate UI updates after changes

## Usage Examples

### Basic Authentication Check

```javascript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, loading, isEmailVerified } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  if (!isEmailVerified) return <div>Please verify your email</div>;
  
  return <div>Welcome, {user.displayName}!</div>;
}
```

### Protecting Routes

```javascript
// Require authentication only
<ProtectedRoute>
  <MyComponent />
</ProtectedRoute>

// Require authentication but not email verification
<ProtectedRoute requireEmailVerification={false}>
  <MyComponent />
</ProtectedRoute>
```

### Custom Authentication Actions

```javascript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { signOut, sendEmailVerification, updateProfile } = useAuth();
  
  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      // Handle successful sign out
    }
  };
  
  const handleSendVerification = async () => {
    await sendEmailVerification();
    // Toast notification is handled automatically
  };
  
  const handleUpdateProfile = async () => {
    const result = await updateProfile({ displayName: "New Name" });
    if (result.success) {
      // Profile updated successfully
    }
  };
}
```

## Security Considerations

### 1. Email Verification
- **Required for new accounts**: Users must verify email before accessing sensitive features
- **Automatic sending**: Verification emails sent immediately upon registration
- **Resend capability**: Users can request new verification emails
- **Deep linking**: Verification links redirect back to the app

### 2. Password Security
- **Strength validation**: Real-time password strength checking
- **Requirements enforcement**: Minimum length, character type requirements
- **Secure updates**: Password changes require current password re-authentication
- **Reset functionality**: Secure password reset via email

### 3. Account Protection
- **Re-authentication**: Sensitive operations require password confirmation
- **Session management**: Automatic token refresh and persistence
- **Account deletion**: Secure deletion with confirmation steps
- **Provider management**: Clear indication of connected authentication providers

## Configuration

### Firebase Setup

1. **Firebase Console**: Ensure your Firebase project has Authentication enabled
2. **Google OAuth**: Configure Google provider in Firebase Auth settings
3. **Email Templates**: Customize email verification and password reset templates
4. **Authorized Domains**: Add your domains to authorized domains list

### Environment Variables (Optional)

```javascript
// For development emulator
VITE_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
```

### Customization

#### Theme Support
The authentication system fully supports dark mode through the existing theme provider.

#### Toast Notifications
All authentication operations provide user feedback through the Sonner toast library.

#### Form Validation
Validation rules can be customized in `src/lib/authService.js`:
- Email regex pattern
- Password requirements
- Strength calculation criteria

## Troubleshooting

### Common Issues

1. **Email Verification Not Working**
   - Check Firebase console email template settings
   - Verify authorized domains include your app domain
   - Check spam folder for verification emails

2. **Google OAuth Errors**
   - Ensure Google provider is enabled in Firebase Console
   - Check OAuth client configuration
   - Verify redirect URIs are correctly configured

3. **Protected Route Issues**
   - Ensure AuthProvider wraps your entire app
   - Check that routes are properly nested within ProtectedRoute
   - Verify loading states are handled correctly

4. **Password Reset Not Working**
   - Check email template configuration
   - Verify user email exists in Firebase Auth
   - Ensure authorized domains are correctly set

### Development Tips

1. **Use Firebase Emulator**: Set up Firebase Auth emulator for development
2. **Error Logging**: Check browser console for detailed error messages
3. **Toast Notifications**: Monitor toast messages for user feedback
4. **State Debugging**: Use React DevTools to inspect auth context state

## Best Practices

### Security
- Always validate user input on both client and server
- Use HTTPS in production
- Implement proper CORS policies
- Regular security audits of authentication flow

### User Experience
- Provide clear error messages
- Implement proper loading states
- Use progressive enhancement for password strength
- Offer multiple sign-in options

### Maintenance
- Monitor Firebase Auth usage and quota
- Regularly update Firebase SDK versions
- Test authentication flow across different browsers
- Monitor user feedback for authentication issues

## API Reference

### AuthService Methods

```javascript
// Account creation and authentication
AuthService.signUpWithEmail(email, password, displayName)
AuthService.signInWithEmail(email, password)
AuthService.signInWithGoogle()

// Email and password management
AuthService.sendEmailVerification(user)
AuthService.sendPasswordReset(email)
AuthService.updatePassword(currentPassword, newPassword)

// Profile management
AuthService.updateUserProfile(updates)
AuthService.deleteAccount(password)
AuthService.reloadUser()

// Utility methods
AuthService.isEmailVerified(user)
AuthService.hasPasswordProvider(user)
AuthService.hasGoogleProvider(user)
```

### Validation Functions

```javascript
import { validateEmail, validatePassword } from "@/lib/authService";

const isValidEmail = validateEmail("user@example.com");
const passwordStrength = validatePassword("myPassword123!");
```

This comprehensive authentication system provides a secure, user-friendly foundation for your LeetSpace application with room for future enhancements and customizations.