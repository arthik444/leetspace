import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, User, LogOut, Mail, Shield, Settings } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut, isEmailVerified, hasGoogleProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-black">
      <Link to="/" className="font-bold text-xl dark:text-white">
        LeetSpace
      </Link>
      
      <div className="flex items-center gap-4 text-sm">
        <Link to="/problems" className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
          Problems
        </Link>
        <Link 
          to="/add-problem" 
          onClick={() => sessionStorage.setItem("addProblemIntent", "fresh")}
          className="dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          Add Problem
        </Link>

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

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/auth" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
