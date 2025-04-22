// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { BsChatSquareDotsFill } from "react-icons/bs";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);

      // Basic validation (would be replaced with actual auth logic)
      if (email && password) {
        router.push("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    }, 1000);
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                      <FiMail className="text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 pl-10 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-slate-900"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
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
                    <a
                      href="#"
                      className="text-sm text-primary-500 hover:text-primary-600"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock className="text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 pl-10 pr-10 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-slate-900"
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
