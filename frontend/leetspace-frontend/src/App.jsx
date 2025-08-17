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
import Landing from './pages/Landing';
import Sample from './pages/Sample';
import SampleProblem from './pages/SampleProblem';
import Oops from './pages/Oops';
import ResetPassword from './pages/ResetPassword';

import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
// import { AuthProvider } from "@/lib/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./index.css" 
function AppShell() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors">
    <Router>
      <App />
    </Router>
    <Toaster 
      position="top-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
      closeButton={false}
      duration={2200}
      offset={60}
      toastOptions={{
        className: "pointer-events-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 shadow-sm",
      }}
    />
  </div>
);
}

function AppWrapper() {
return (
  <ThemeProvider>
    <AuthProvider>
      <AppShell />
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
          element={<Landing />} 
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/sample" element={<Sample />} />
        <Route path="/sample/problem" element={<SampleProblem />} />
        <Route path="/oops" element={<Oops />} />
        {/* Protected Routes - require authentication and email verification */}
        <Route 
          path="/problems" 
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute >
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute >
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default AppWrapper;
