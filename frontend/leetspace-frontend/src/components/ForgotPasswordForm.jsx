import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { validateEmail } from "@/lib/authService";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({ onBack, className, ...props }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        setEmailSent(true);
      } else {
        setError(result.error || "Failed to send password reset email");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await sendPasswordReset(email);
      if (!result.success) {
        setError(result.error || "Failed to resend password reset email");
      }
    } catch (error) {
      console.error("Password reset resend error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail("");
    setError("");
    onBack();
  };

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              We've sent a password reset link to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder or</p>
          </div>
          
          <Button 
            onClick={handleResend}
            disabled={loading}
            variant="outline" 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Resend Email
              </>
            )}
          </Button>

          <Button 
            onClick={handleBackToLogin}
            variant="ghost" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>
            The password reset link will expire in 1 hour for security reasons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset Your Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm text-balance">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="reset-email" className="text-gray-700 dark:text-gray-300">
            Email Address
          </Label>
          <Input 
            id="reset-email"
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(""); // Clear error when user types
            }}
            className={error ? "border-red-500 focus:border-red-500" : ""}
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending Reset Link...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Reset Link
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
        >
          <ArrowLeft className="h-3 w-3 inline mr-1" />
          Back to Sign In
        </button>
      </div>
    </form>
  );
}