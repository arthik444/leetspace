import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
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
import AuthAction from './pages/ResetPassword';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import BackToTop from '@/components/BackToTop';

import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
// import { AuthProvider } from "@/lib/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import { DemoProvider } from "@/context/DemoContext";
import { Toaster } from "sonner";
import "./index.css" 
function AppShell() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors">
    <Router>
      <ScrollToTop />
      <App />
    </Router>
    <BackToTop />
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
    <DemoProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </DemoProvider>
    </ThemeProvider>

  );
}
function App() {

  const location = useLocation();

  const shouldShowNavbar = location.pathname !== "/auth" && location.pathname !== "/reset-password";
  const isLanding = location.pathname === "/";

  
  if (isLanding) {
    return (
      <>
        {shouldShowNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<AuthAction />} />
          <Route path="/sample" element={<Sample />} />
          <Route path="/sample/problem" element={<SampleProblem />} />
          <Route path="/oops" element={<Oops />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
          <Route path="/add-problem" element={<ProtectedRoute><AddProblem /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
          <Route path="/edit-problem/:id" element={<ProtectedRoute><EditProblem /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute ><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute ><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {shouldShowNavbar && <Footer />}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<AuthAction />} />
          <Route path="/sample" element={<Sample />} />
          <Route path="/sample/problem" element={<SampleProblem />} />
          <Route path="/oops" element={<Oops />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
          <Route path="/add-problem" element={<ProtectedRoute><AddProblem /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
          <Route path="/edit-problem/:id" element={<ProtectedRoute><EditProblem /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute ><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute ><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {shouldShowNavbar && <Footer />}
    </div>
  );
}

export default AppWrapper;
