// components/Login/Login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { backendURL } from "@/app/utils/config";
import { handleError, handleSuccess } from "@/app/utils/messageUtils";
import { useAuth } from "@/app/providers/AuthContext";

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Mark field as touched
    setTouched({ ...touched, [id]: true });
  };

  // Handle input blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    setTouched({ ...touched, [id]: true });
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post<LoginResponse>(
        `${backendURL}/api/auth/login`,
        formData
      );

      const { access_token, user_id, name, email, role } = response.data;

      // Store user in context and localStorage
      login({ user_id, name, email, role }, access_token);

      handleSuccess("Login successful!");

      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/chat");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle API errors
        const errorMessage =
          error.response?.data?.message || "Invalid email or password";
        setErrors({ general: errorMessage });
        handleError(errorMessage);
      } else {
        // Handle other errors
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
        handleError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine if a field has an error
  const hasError = (field: keyof ValidationErrors): boolean => {
    return touched[field] === true && Boolean(errors[field]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Brand header */}
          <div className="bg-primary-500 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
              <BsChatSquareDotsFill className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-white/80 mt-1">Log in to your account</p>
          </div>

          {/* Form section */}
          <div className="p-6 sm:p-8">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMail
                        className={`${
                          hasError("email") ? "text-red-500" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 pl-10 rounded-md border ${
                        hasError("email")
                          ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                          : "border-slate-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                      } outline-none text-slate-900`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {hasError("email") && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-900"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock
                        className={`${
                          hasError("password")
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 pl-10 pr-10 rounded-md border ${
                        hasError("password")
                          ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                          : "border-slate-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                      } outline-none text-slate-900`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {hasError("password") && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-3 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center mt-8">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-sm text-slate-400">
                or
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Registration link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary-500 hover:text-primary-600"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
