// src/components/SupervisorLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, Shield, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

const SupervisorLogin = ({ onBack }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [supervisorName, setSupervisorName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [supervisorPassword, setSupervisorPassword] = useState("");

  const handleSupervisorLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/supervisor/login", {
        supervisorName,
        adminId,
        password: supervisorPassword,
      });

      if (res.data.success) {
        toast.success(`Welcome, ${res.data.supervisor.name || supervisorName}!`);
        navigate("/supervisor-dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="  flex items-center justify-center px-6 py-12 relative overflow-hidden mt-12">
      

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-2xl" // Increased width
      >
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-10 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <img src="/logo.svg" alt="Jan Samadhan" className="w-16 h-16 rounded-xl shadow-lg" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="w-9 h-9" />
                    Supervisor Portal
                  </h1>
                  <p className="text-indigo-100 text-lg mt-1">Jan Samadhan — Field Operations Login</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onBack}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-10 py-10">
            <form onSubmit={handleSupervisorLogin} className="space-y-7">
              {/* Supervisor Select */}
              <div>
                <label className="flex items-center gap-3 text-base font-semibold text-gray-800 mb-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Select Supervisor
                </label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-gray-800 text-base bg-gray-50/50 disabled:bg-gray-100"
                >
                  <option value="">Choose a supervisor</option>
                  <option>Person 1</option>
                  <option>Person 2</option>
                  <option>Person 3</option>
                  <option>Person 4</option>
                  <option>Person 5</option>
                </select>
              </div>

              {/* Admin ID */}
              <div>
                <label className="flex items-center gap-3 text-base font-semibold text-gray-800 mb-3">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Admin ID
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value.trim())}
                  placeholder="e.g. SUP001"
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition placeholder-gray-500 text-base bg-gray-50/50 disabled:bg-gray-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-base font-semibold text-gray-800 mb-3 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={supervisorPassword}
                    onChange={(e) => setSupervisorPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    required
                    disabled={loading}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 pr-14 transition text-base bg-gray-50/50 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-indigo-600 transition"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login as Supervisor"
                )}
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-8 text-center">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-semibold text-base transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-10">
          © 2025 Jan Samadhan | Government of India Initiative
        </p>
      </motion.div>
    </div>
  );
};

export default SupervisorLogin;