import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/lib/authService";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    sendEmailVerification
  } = useAuth();

  // Check for successful email verification in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
    }
  }, [location]);

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = "Password must be at least 6 characters long";
      }
    }

    // Display name validation for sign up
    if (!isLogin && !formData.displayName.trim()) {
      errors.displayName = "Display name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUnverifiedUser(null);

    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          const from = location.state?.from || "/";
          navigate(from, { replace: true });
        } else if (result.needsVerification) {
          setUnverifiedUser(result.user);
        }
      } else {
        const result = await signUp(formData.email, formData.password, formData.displayName);
        if (result.success) {
          setUnverifiedUser(result.user);
          setFormData({ email: "", password: "", displayName: "" });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('An unexpected error occurred with Google sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (unverifiedUser) {
      await sendEmailVerification();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setValidationErrors({});
    setUnverifiedUser(null);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setValidationErrors({});
  };

  // Show forgot password form
  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={handleBackToLogin} className={className} {...props} />;
  }

  // Show email verification prompt if user needs verification
  if (unverifiedUser) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              We sent a verification link to{" "}
              <span className="font-medium text-gray-900 dark:text-white">{unverifiedUser.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleResendVerification}
            variant="outline" 
            className="w-full"
          >
            Resend verification email
          </Button>
          <Button 
            onClick={() => setUnverifiedUser(null)}
            variant="ghost" 
            className="w-full"
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm text-balance">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Sign up to get started with LeetSpace"}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Display Name Field (Sign Up Only) */}
        {!isLogin && (
          <div className="grid gap-3">
            <Label htmlFor="displayName" className="text-gray-700 dark:text-gray-300">Display Name</Label>
            <Input 
              id="displayName" 
              type="text" 
              placeholder="John Doe"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              className={validationErrors.displayName ? "border-red-500" : ""}
            />
            {validationErrors.displayName && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.displayName}</p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={validationErrors.email ? "border-red-500" : ""}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {validationErrors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
          )}

          {/* Password Strength Indicator (Sign Up Only) */}
          {!isLogin && formData.password && (
            <PasswordStrengthIndicator 
              password={formData.password} 
              showRequirements={true}
            />
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {isLogin ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm">
          <div className="absolute inset-0 top-1/2 border-t border-gray-200 dark:border-gray-700 z-0" />
          <span className="relative z-10 bg-white dark:bg-gray-800 px-2 text-gray-600 dark:text-gray-400">
            Or continue with
          </span>
        </div>

        {/* Google Sign In */}
        <Button 
          type="button"
          variant="outline" 
          className="w-full gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>

      {/* Toggle Login/Sign Up */}
      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}

