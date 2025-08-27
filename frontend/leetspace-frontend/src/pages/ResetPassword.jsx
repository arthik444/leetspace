import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, Mail } from "lucide-react";
import AuthService, { validatePassword } from "@/lib/authService";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [verifying, setVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [actionType, setActionType] = useState(""); // "resetPassword" or "verifyEmail"

  // Theme handling for consistency with Auth page
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");

    return () => {
      root.classList.remove("light");
      const stored = typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light';
      root.classList.add(stored === 'dark' ? 'dark' : 'light');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      if (!mode || !oobCode) {
        setError("Invalid link. Please check your email and try again.");
        setVerifying(false);
        return;
      }

      // Set the action type based on the mode parameter
      if (mode === "resetPassword") {
        setActionType("resetPassword");
      } else if (mode === "verifyEmail") {
        setActionType("verifyEmail");
      } else {
        setError("Unsupported action. Please check your email and try again.");
        setVerifying(false);
        return;
      }

      try {
        if (mode === "resetPassword") {
          // Handle password reset verification
          const res = await AuthService.verifyPasswordResetCode(oobCode);
          if (!isMounted) return;
          
          if (res.success) {
            setVerifiedEmail(res.email || "");
            setError("");
          } else {
            setError(res.error || "Invalid or expired reset link. Please request a new password reset email.");
          }
        } else if (mode === "verifyEmail") {
          // Handle email verification
          const res = await AuthService.checkActionCode(oobCode);
          if (!isMounted) return;
          
          if (res.success) {
            // This is an email verification - apply the action code
            const applyRes = await AuthService.applyActionCode(oobCode);
            if (applyRes.success) {
              setSuccess(true);
              setError("");
            } else {
              setError(applyRes.error || "Failed to verify email. The link may be invalid or expired.");
            }
          } else {
            setError("Invalid or expired email verification link. Please request a new verification email.");
          }
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError("Failed to verify link. Please try again.");
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };
    
    verify();
    return () => {
      isMounted = false;
    };
  }, [mode, oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Only handle password reset submission, not email verification
    if (actionType !== "resetPassword") {
      return;
    }

    // Enhanced validation
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    
    if (!confirmPassword.trim()) {
      setError("Please confirm your new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    const strength = validatePassword(newPassword);
    if (!strength.isValid) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const res = await AuthService.confirmPasswordReset(oobCode, newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToAuth = () => {
    navigate("/auth");
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your password reset link...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    const isEmailVerification = actionType === "verifyEmail";
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                {isEmailVerification ? (
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEmailVerification ? "Email Verified!" : "Password Reset Successful!"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  {isEmailVerification 
                    ? "Your email has been verified successfully. You can now access all features of your account."
                    : "Your password has been updated successfully. You can now sign in with your new password."
                  }
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button onClick={handleBackToAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Go to Sign In
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !verifiedEmail) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  {error}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button onClick={handleBackToAuth} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="ghost" 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // For email verification, show a processing message since it's handled automatically
  if (actionType === "verifyEmail" && !success && !error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verifying Your Email</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your email address...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center gap-2 text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
            {verifiedEmail && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                for <span className="font-medium text-gray-900 dark:text-white">{verifiedEmail}</span>
              </p>
            )}
          </div>

          {/* Only show password form for password reset actions */}
          {actionType === "resetPassword" && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className={cn(
                    "pr-10 bg-white dark:bg-gray-700 text-black dark:text-white",
                    error && "border-red-500 dark:border-red-400"
                  )}
                  aria-describedby={error ? "password-error" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={cn(
                    "pr-10 bg-white dark:bg-gray-700 text-black dark:text-white",
                    error && "border-red-500 dark:border-red-400"
                  )}
                  aria-describedby={error ? "password-error" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <PasswordStrengthIndicator password={newPassword} showRequirements />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400" id="password-error">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                type="submit" 
                disabled={submitting || !newPassword.trim() || !confirmPassword.trim()} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Button 
                type="button" 
                onClick={handleBackToAuth} 
                variant="ghost" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}