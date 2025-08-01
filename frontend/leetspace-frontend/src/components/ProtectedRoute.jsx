import { useAuth } from "@/lib/useAuth";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated, userProfile } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('🛡️ ProtectedRoute check:', {
    loading,
    user: !!user,
    userProfile: !!userProfile,
    isAuthenticated,
    pathname: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  // Render protected content
  return children;
}