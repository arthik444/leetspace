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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center gap-2 mb-6">
          <a href="#" className="flex items-center gap-2 font-medium text-gray-900 dark:text-white cursor-pointer">
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
  