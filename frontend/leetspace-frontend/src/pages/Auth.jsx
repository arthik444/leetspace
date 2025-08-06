import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "../components/login-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login logic
    if (email && password) {
      // You'd replace this with real API auth
      navigate("/home");
    }
  };
  
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50 dark:bg-gray-900">
      {/* Left side - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
            <div className="bg-blue-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            LeetSpace
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      
      {/* Right side - Image/Background */}
      <div className="relative hidden lg:block bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <img
          src="/src/assets/leetspaceTheme.png"
          alt="LeetSpace Authentication"
          className="absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Welcome to LeetSpace</h2>
            <p className="text-lg opacity-90">
              Your coding practice companion for technical interviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
  