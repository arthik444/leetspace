import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import AuthService, { validatePassword } from "@/lib/authService";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
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

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      if (mode !== "resetPassword" || !oobCode) {
        setError("Invalid reset link. Please request a new password reset email.");
        setVerifying(false);
        return;
      }
      const res = await AuthService.verifyPasswordResetCode(oobCode);
      if (!isMounted) return;
      if (res.success) {
        setVerifiedEmail(res.email || "");
        setError("");
      } else {
        setError(res.error || "Invalid or expired link. Please request a new one.");
      }
      setVerifying(false);
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, [mode, oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
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
    const res = await AuthService.confirmPasswordReset(oobCode, newPassword);
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Failed to reset password. Please try again.");
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password reset</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your password has been updated. You can now sign in.
            </p>
          </div>
          <Button onClick={() => navigate("/auth") } className="w-full mt-6">Go to Sign In</Button>
        </div>
      </div>
    );
  }

  if (error && !verifiedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid or expired link</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {error}
            </p>
          </div>
          <Button onClick={() => navigate("/auth") } variant="outline" className="w-full mt-6">Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set a new password</h1>
          {verifiedEmail && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">for <span className="font-medium text-gray-900 dark:text-white">{verifiedEmail}</span></p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="newPassword" className="text-gray-700">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn("pr-10 bg-white text-black")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn("pr-10 bg-white text-black")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <PasswordStrengthIndicator password={newPassword} showRequirements />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button type="submit" disabled={submitting || !newPassword || !confirmPassword} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Button type="button" onClick={() => navigate("/auth")} variant="ghost" className="w-full">
            Back to Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}