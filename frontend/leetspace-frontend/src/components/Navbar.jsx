import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, User } from "lucide-react";

export default function Navbar() {
  const { user, userProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-black">
      <Link to="/" className="font-bold text-xl dark:text-white">Leetspace</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/problems" className="dark:text-white">Problems</Link>
        <Link to="/add-problem" 
            onClick={() => sessionStorage.setItem("addProblemIntent", "fresh")}
            className="dark:text-white"
        >Add Problem</Link>

        {/* Theme toggle button */}
        <button onClick={toggleTheme} className="p-1 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-white" />}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm dark:text-white">
              <User className="w-4 h-4" />
              <span>{userProfile?.display_name || user?.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-500 cursor-pointer underline text-sm hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="underline text-sm hover:text-blue-600 transition-colors">Login</Link>
        )}
      </div>
    </nav>
  );
}
