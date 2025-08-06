import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const { verifyEmail, resendVerification, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link - missing token');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified!');
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
        
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification failed');
        setCanResend(true);
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    if (!user?.email) {
      setMessage('Unable to resend - no email address found');
      return;
    }

    setResendLoading(true);
    try {
      await resendVerification(user.email);
      setMessage('Verification email sent! Please check your inbox.');
      setCanResend(false);
      
      // Allow resending again after 60 seconds
      setTimeout(() => setCanResend(true), 60000);
      
    } catch (error) {
      setMessage(error.message || 'Failed to send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Welcome to LeetSpace! Your account is now active.
              </CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                We couldn't verify your email address
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Redirecting you to the dashboard in 3 seconds...
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              {canResend && user?.email && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Didn't receive the email? We can send you another one.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <Link 
                  to="/auth" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {status === 'verifying' && (
            <div className="text-center">
              <Link 
                to="/auth" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}