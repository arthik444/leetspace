import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const { login, register, googleLogin } = useAuth();
  const location = useLocation();

  // Get the intended destination from location state, default to home
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    // setResetSent(false);

    try {
      if (isLogin) {
        // await signInWithEmailAndPassword(auth, email, password);
        // Login
        await login(email, password);
        navigate("/"); // Redirect to home after successful login
      } else {
        // await createUserWithEmailAndPassword(auth, email, password);
        // Register
        await register(email, password, fullName);
        navigate("/"); // Redirect to home after successful registration
      }
    //   navigate("/");
    // } catch (err) {
    //   console.error("Firebase Auth Error:", err.code, err.message);
    //   switch (err.code) {
    //     case "auth/invalid-credential":
    //       setErrorMsg("No account found with this email.");
    //       break;
    //     case "auth/wrong-password":
    //       setErrorMsg("Incorrect password. Please try again.");
    //       break;
    //     case "auth/invalid-email":
    //       setErrorMsg("Invalid email format.");
    //       break;
    //     case "auth/email-already-in-use":
    //       setErrorMsg("An account with this email already exists.");
    //       break;
    //     case "auth/weak-password":
    //       setErrorMsg("Password should be at least 6 characters.");
    //       break;
    //     case "auth/network-request-failed":
    //       setErrorMsg("Network error. Please check your connection.");
    //       break;
    //     default:
    //       setErrorMsg("Something went wrong. Please try again.");
    //   }
     // Redirect to intended destination or home
     navigate(from, { replace: true });
  } catch (error) {
    console.error("Authentication error:", error);
    setErrorMsg(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleResetPassword = async () => {
  //   setErrorMsg("");
  //   try {
  //     if (!email) {
  //       setErrorMsg("Enter email to reset password.");
  //       return;
  //     }
  //     await sendPasswordResetEmail(auth, email);
  //     setResetSent(true);
  //   } catch (err) {
  //     setErrorMsg(err.message);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg("");
      
      if (!window.google) {
        throw new Error("Google Sign-In SDK not loaded");
      }

      // Initialize Google Sign-In if not already done
      if (!window.googleInitialized) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
        
        // Check if we have a valid client ID
        if (clientId === "your-google-client-id.apps.googleusercontent.com" || 
            clientId === "development-placeholder.apps.googleusercontent.com") {
          throw new Error("Google Client ID not configured. Please set up Google OAuth in your .env file.");
        }
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (credentialResponse) => {
            try {
              if (credentialResponse.credential && googleLogin) {
                await googleLogin(credentialResponse.credential);
                navigate(from, { replace: true });
              } else {
                setErrorMsg("Failed to get Google credential");
              }
            } catch (error) {
              console.error("Google login callback error:", error);
              setErrorMsg("Google login failed. Please try again.");
            } finally {
              setIsGoogleLoading(false);
            }
          }
        });
        window.googleInitialized = true;
      }

      // Trigger the Google Sign-In prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("Google Sign-In prompt not displayed:", notification.getNotDisplayedReason());
          setErrorMsg("Google Sign-In was not displayed. Please try again or use email login.");
          setIsGoogleLoading(false);
        }
      });

    } catch (error) {
      console.error("Google login error:", error);
      setErrorMsg(error.message || "Google login failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isLogin ? "Login to your account" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isLogin
            ? "Enter your email below to login to your account"
            : "Sign up with your email to get started"}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Full Name field for registration */}
        {!isLogin && (
          <div className="grid gap-3">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              type="text" 
              placeholder="John Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>
        )}
        {/* Email field */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          {/* <Input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} /> */}
            <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com"
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        {/* Password field */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {isLogin && (
              <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-blue-600"
              >
                Forgot your password?
              </Link>
            )}
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!isLogin) {
                setShowPasswordStrength(e.target.value.length > 0);
              }
            }}
            onFocus={() => !isLogin && setShowPasswordStrength(true)}
          />

          {/* Password Strength Indicator for Registration */}
          {!isLogin && showPasswordStrength && (
            <PasswordStrengthIndicator 
              password={password}
              email={email}
              fullName={fullName}
              className="mt-2"
            />
          )}

        </div>

        {/* {resetSent && <div className="text-sm text-green-600 text-center">✅ Reset email sent</div>}
        {errorMsg && <div className="text-sm text-red-500 text-center">{errorMsg}</div>} */}
        {/* Error message */}
        {errorMsg && (
          <div className="text-sm text-red-500 text-center">{errorMsg}</div>
        )}
        {/* Submit button */}
        <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
          {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Sign Up"}
        </Button>
        
        <div className="relative text-center text-sm">
          <div className="absolute inset-0 top-1/2 border-t border-border z-0" />
          <span className="relative z-10 bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={handleGoogleLogin}
          disabled={loading || isGoogleLoading}
        >
          <GoogleIcon />
          {isGoogleLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>

      {isLogin && (
        <div className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>
      )}

      <div className="text-center text-sm">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          // onClick={() => setIsLogin(!isLogin)}
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg("");
            setFullName("");
          }}
          className="underline underline-offset-4"
        >
          {isLogin ? "Sign up" : "Login"}
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

