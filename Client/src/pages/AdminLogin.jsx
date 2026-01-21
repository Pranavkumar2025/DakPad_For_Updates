// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { adminLogin } from "../utils/api";
import SupervisorLogin from "./SupervisorLogin";

const AdminLogin = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  // Admin Login State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin({ adminId, password: adminPassword });

      if (res.data.success) {
        const redirectPath = res.data.redirect || "/dashboard";
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid credentials. Please try again.";
      setError(msg);
      console.error("Admin login failed:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 px-4 py-12">
      {/* Mobile-only Top Bar: Back to Home (left) + Logo (right) */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 md:hidden">
        {/* Back to Home - Left */}
        <motion.a
          href="/"
          className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors group"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </motion.a>

        {/* Logo - Right */}
        <div className="w-12 h-12 bg-indigo-100 rounded-full shadow-md p-2 flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Jan Samadhan Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* 3D Flip Container */}
        <motion.div
          className="relative h-[720px] md:h-[620px] preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front: Admin Login */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-2xl border border-gray-300 p-8 md:p-10">
              {/* Desktop-only Back Link (inside card) */}
              <motion.a
                href="/"
                className="hidden md:flex absolute top-5 left-5 items-center gap-2 text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors group"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </motion.a>

              {/* Logo & Title - Hidden on mobile since logo is now in top bar */}
              <div className="text-center mt-12 mb-10 md:mt-0">
                {/* Mobile logo hidden, desktop logo shown */}
                <motion.div
                  className="hidden md:inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full shadow-md mb-6 p-4 mx-auto"
                >
                  <img
                    src="/logo.svg"
                    alt="Jan Samadhan Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase">
                  Jan Samadhan
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-medium">Admin Portal</p>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your Admin ID"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value.trim())}
                    className="w-full px-5 py-4 border border-gray-400 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all text-base"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-5 py-4 border border-gray-400 pr-14 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all text-base"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !adminId || !adminPassword}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Signing in..." : "Admin Login"}
                </button>
              </form>

              {/* Supervisor Toggle */}
              <div className="mt-12 text-center">
                <p className="text-gray-600 text-base">
                  Are you a Supervisor?{" "}
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition"
                  >
                    Login here →
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Back: Supervisor Login */}
          <div
            className="absolute inset-0 backface-hidden flex items-center justify-center px-4"
            style={{ transform: "rotateY(180deg)" }}
          >
            <SupervisorLogin onBack={() => setIsFlipped(false)} />
          </div>
        </motion.div>
      </div>

      {/* Custom 3D Styles */}
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;