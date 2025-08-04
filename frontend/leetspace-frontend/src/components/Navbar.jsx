import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  // const [user, setUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, setUser);
  //   return () => unsub();
  // }, []);

  const handleLogout = async () => {
    // await signOut(auth);
    // navigate("/auth");
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      // Navigate to auth page anyway
      navigate("/auth");
    }
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

        {user ? (
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.full_name || user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        ) : (
          <Link to="/auth" className="underline">Login</Link>
        )}
      </div>
    </nav>
  );
}
