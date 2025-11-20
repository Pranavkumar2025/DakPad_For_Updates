// src/components/SupervisorLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, Shield, Users } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onBack}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-6 px-6">
            <motion.img
              src="/logo.svg"
              alt="Jan Samadhan Logo"
              className="w-16 h-16 mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            />
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">Supervisor Portal</h1>
            </div>
            <p className="text-sm text-gray-600">Secure access for field supervisors</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSupervisorLogin} className="px-6 pb-8 space-y-5">
            {/* Supervisor Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Select Supervisor
              </label>
              <select
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-gray-800 bg-white"
                required
                disabled={loading}
              >
                <option value="">Choose supervisor</option>
                <option>Person 1</option>
                <option>Person 2</option>
                <option>Person 3</option>
                <option>Person 4</option>
                <option>Person 5</option>
              </select>
            </div>

            {/* Admin ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Admin ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value.trim())}
                placeholder="e.g. SUP001"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={supervisorPassword}
                  onChange={(e) => setSupervisorPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-indigo-600 transition"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70"
            >
              {loading ? "Authenticating..." : "Login as Supervisor"}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 mx-auto transition"
          >
            Back to Admin Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SupervisorLogin;