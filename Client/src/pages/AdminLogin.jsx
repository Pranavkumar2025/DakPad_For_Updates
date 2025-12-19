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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 px-4 py-12">
      <div className="relative w-full max-w-5xl">
        {/* 3D Flip Container */}
        <motion.div
          className="relative h-[640px] md:h-[620px] preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front: Admin Login */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 md:p-10">
              {/* Back Link */}
              <motion.a
                href="/"
                className="absolute top-5 left-5 flex items-center gap-2 text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors group"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </motion.a>

              {/* Logo & Title */}
              <div className="text-center mt-8 mb-10">
                <motion.div
                  // initial={{ scale: 0, rotate: -180 }}
                  // animate={{ scale: 1, rotate: 0 }}
                  // transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20  rounded-2xl shadow-lg mb-6 p-3"
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
                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/70"
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
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl pr-14 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/70"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !adminId || !adminPassword}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Signing in..." : "Admin Login"}
                </button>
              </form>

              {/* Supervisor Toggle */}
              <div className="mt-10 text-center">
                <p className="text-gray-600">
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