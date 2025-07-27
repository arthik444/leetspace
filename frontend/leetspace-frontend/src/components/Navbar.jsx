import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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

        {user ? (
          <button onClick={handleLogout} className="text-red-500 cursor-pointer underline">Logout</button>
        ) : (
          <Link to="/auth" className="underline">Login</Link>
        )}
      </div>
    </nav>
  );
}
