import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Problems from './pages/Problems';
import AddProblem from './pages/AddProblem';
import ProblemDetail from './pages/problemDetail';
import EditProblem from "./pages/EditProblem";
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider } from "@/components/ThemeProvider";
// import { AuthProvider } from "@/lib/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./index.css" 
function AppWrapper() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 transition-colors">
          <Router>
            <App />
          </Router>
          <Toaster 
            position="top-right"
            theme="system"
            closeButton={false}
            duration={2200}
            offset={60}
            toastOptions={{
              className: "pointer-events-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 shadow-sm",
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>

  );
}
function App() {

  const location = useLocation();

  const shouldShowNavbar = location.pathname !== "/auth";

  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute requireEmailVerification={false}>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="/auth" element={<Auth />} />
        {/* Protected Routes - require authentication and email verification */}
        <Route 
          path="/problems" 
          element={
            <ProtectedRoute requireEmailVerification={false}>
              <Problems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-problem" 
          element={
            <ProtectedRoute>
              <AddProblem />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problems/:id" 
          element={
            <ProtectedRoute requireEmailVerification={false}>
              <ProblemDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-problem/:id" 
          element={
            <ProtectedRoute>
              <EditProblem />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireEmailVerification={false}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireEmailVerification={false}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default AppWrapper;
