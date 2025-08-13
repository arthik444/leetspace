import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "../components/login-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Auth() {

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    // Force light mode while on auth page
    root.classList.remove("dark");
    root.classList.add("light");

    return () => {
      root.classList.remove("light");
      if (hadDark) root.classList.add("dark");
      else root.classList.add("light");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login logic
    if (email && password) {
      // You'd replace this with real API auth
      navigate("/home");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center gap-2 mb-6">
          <a href="#" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
            <div className="bg-blue-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            LeetSpace
          </a>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
  