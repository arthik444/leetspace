import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ 
  children, 
  requireEmailVerification = true, 
  redirectTo = "/auth",
  fallback = null 
}) => {
  const { user, loading, initialized, isEmailVerified } = useAuth();
  const location = useLocation();
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);

  useEffect(() => {
    // Show email verification prompt if user is signed in but email is not verified
    if (user && requireEmailVerification && !isEmailVerified && initialized) {
      setShowEmailVerificationPrompt(true);
    } else {
      setShowEmailVerificationPrompt(false);
    }
  }, [user, isEmailVerified, requireEmailVerification, initialized]);

  // Show loading spinner while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // If email verification is required but user hasn't verified email
  if (requireEmailVerification && !isEmailVerified && showEmailVerificationPrompt) {
    return <EmailVerificationRequired />;
  }

  // User is authenticated and verified (if required), render the protected content
  return fallback || children;
};

// Email verification prompt component
const EmailVerificationRequired = () => {
  const { user, sendEmailVerification, signOut, reloadUser } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleResendVerification = async () => {
    setResendLoading(true);
    await sendEmailVerification();
    setResendLoading(false);
  };

  const handleCheckVerification = async () => {
    setCheckLoading(true);
    await reloadUser();
    setCheckLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Email Verification Required
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Please verify your email address to continue. We sent a verification link to{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user?.email}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCheckVerification}
              disabled={checkLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "I've verified my email"
              )}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              Check your spam folder if you don't see the email. The verification link expires in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;