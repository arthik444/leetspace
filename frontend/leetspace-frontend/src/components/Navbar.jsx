import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useDemo } from "@/context/DemoContext";
import { Moon, Sun, User, LogOut, Mail, Shield, Settings, Menu, X } from "lucide-react";

function LogoMark({ className = "" }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<rect x="4" y="4" width="16" height="16" rx="3" ry="3" />
		</svg>
	);
}

export default function Navbar() {
  const { user, signOut, isEmailVerified, hasGoogleProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isDemo, setDemo } = useDemo();

  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate("/auth");
    }
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowUserMenu(false);
  };

  const showNavLinks = isDemo || !!user;

  return (
    <nav className="relative flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-black">
      <Link to={showNavLinks ? "/dashboard" : "/"} className="group flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white cursor-pointer">
        <LogoMark className="h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ease-out group-hover:-translate-y-px group-hover:rotate-1 motion-reduce:transform-none" />
        <span>LeetSpace</span>
        {isDemo && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200/70 dark:border-indigo-700/50">
            Demo
          </span>
        )}
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 sm:hidden rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      {showNavLinks && (
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/dashboard" className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
            Dashboard
          </Link>
          <Link to="/problems" className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
            Problems
          </Link>
          <Link 
            to="/add-problem" 
            onClick={() => sessionStorage.setItem("addProblemIntent", "fresh")}
            className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          >
            Add Problem
          </Link>
        </div>
      )}
        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-white" />
          )}
        </button>

        {isDemo && !user && (
          <button
            onClick={() => { setDemo(false); navigate("/"); }}
            className="px-3 py-1 text-xs rounded border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
          >
            Exit demo
          </button>
        )}

        {user ? (
                    <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5 dark:text-white" />
                        )}
                        <span className="dark:text-white hidden sm:inline">
                          {user.displayName || user.email?.split('@')[0]}
                        </span>
                      </div>
                    </button>
        
                    {/* User dropdown menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {user.displayName || "User"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          {/* User status indicators */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-4 h-4" />
                              <span className={`px-2 py-1 rounded-full ${
                                isEmailVerified 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                              </span>
                            </div>
                            
                            {hasGoogleProvider && (
                              <div className="flex items-center gap-2 text-xs">
                                <Shield className="w-4 h-4" />
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Google Account
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-2 space-y-1">
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            Account Settings
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
        
        ) : (!isDemo && (
          <Link 
            to="/auth" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Sign In
          </Link>
        ))}
      </div>
      {/* Mobile menu panel */}
      {showMobileMenu && (
        <div className="sm:hidden absolute left-0 right-0 top-full border-b bg-white dark:bg-black z-50">
          <div className="px-6 py-3 flex flex-col gap-3">
            {showNavLinks && (
              <>
                <Link to="/dashboard" className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => setShowMobileMenu(false)}>
                  Dashboard
                </Link>
                <Link to="/problems" className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => setShowMobileMenu(false)}>
                  Problems
                </Link>
                <Link 
                  to="/add-problem" 
                  onClick={() => { sessionStorage.setItem("addProblemIntent", "fresh"); setShowMobileMenu(false); }}
                  className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Add Problem
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 sm:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </nav>
  );
}
