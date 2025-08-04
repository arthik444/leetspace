import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Problems from './pages/Problems';
import AddProblem from './pages/AddProblem';
import ProblemDetail from './pages/problemDetail';
import EditProblem from "./pages/EditProblem";
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/useAuth";
import { Toaster } from "sonner";
import "./index.css" 
function AppWrapper() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors">
          <Router>
            <App />
          </Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>

  );
}
function App() {

  const location = useLocation();

  // const shouldShowNavbar = location.pathname !== "/auth";
  const shouldShowNavbar = !location.pathname.match(/^\/(auth|forgot-password|reset-password)$/);

  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* <Route path="/problems" element={<Problems />} />
        <Route path="/add-problem" element={<AddProblem />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/edit-problem/:id" element={<EditProblem />} /> */}
        {/* Protected routes - require authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/problems" element={
          <ProtectedRoute>
            <Problems />
          </ProtectedRoute>
        } />
        <Route path="/add-problem" element={
          <ProtectedRoute>
            <AddProblem />
          </ProtectedRoute>
        } />
        <Route path="/problems/:id" element={
          <ProtectedRoute>
            <ProblemDetail />
          </ProtectedRoute>
        } />
        <Route path="/edit-problem/:id" element={
          <ProtectedRoute>
            <EditProblem />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default AppWrapper;
