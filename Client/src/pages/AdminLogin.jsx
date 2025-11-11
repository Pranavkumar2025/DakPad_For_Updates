// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../utils/api"; // <-- NEW

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/admin/login", {
        adminId,
        password,
      });

      if (res.data.success) {
        navigate(res.data.redirect, { replace: true });
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Network error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative">
        {/* Back to Home Link */}
        <motion.a
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff5010] transition-colors group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </motion.a>

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8 mt-10">
          <motion.img
            src="/logo.svg"
            alt="Jan Samadhan Logo"
            className="w-16 h-16 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <FaUsers className="text-3xl text-[#ff5010]" />
            <span
              className="text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#ff5010] to-[#fc641c] tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Jan Samadhan
            </span>
          </motion.div>
          <p className="text-sm text-gray-500 mt-1">Admin Login Panel</p>
        </div>

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin ID
            </label>
            <input
              type="text"
              placeholder="Enter Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition text-gray-800"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#ff5010] focus:border-transparent transition text-gray-800"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 text-gray-500 hover:text-[#ff5010] transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff5010] to-[#fc641c] text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl hover:from-[#e6490f] hover:to-[#e65c1a] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 mt-8 space-y-1">
          <p>
            Powered by{" "}
            <span className="text-[#ff5010] font-semibold">Jan Samadhan System</span>
          </p>
          <p className="text-[10px] mt-2">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default AdminLogin;