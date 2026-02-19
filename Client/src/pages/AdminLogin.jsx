// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LayoutDashboard, UserCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogin } from "../utils/api";
import SupervisorLogin from "./SupervisorLogin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin"); // 'admin' | 'supervisor'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl bg-white border border-slate-300 flex flex-col md:flex-row min-h-[600px] shadow-none"
      >
        {/* Left Side - Stark Branding */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 p-12 flex-col justify-center items-center text-center text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-8 rounded-sm">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 opacity-90" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-4 text-white uppercase">
              Jan Samadhan
            </h1>
            <div className="w-12 h-1 bg-blue-600 mb-6"></div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-light">
              Official Administrative Portal for District Grievance Redressal and Management.
            </p>
          </div>

          {/* Subtle background detail */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Right Side - Login Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center relative bg-white">

          {/* Top Bar */}
          <div className="absolute top-6 right-6">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Sign In</h2>
              <p className="text-slate-500 text-sm">Access your control panel.</p>
            </div>

            {/* Flat Tabs */}
            <div className="flex border-b border-slate-200 mb-8 w-full">
              <button
                onClick={() => setActiveTab("admin")}
                className={`pb-3 text-sm font-semibold transition-colors mr-6 relative ${activeTab === "admin" ? "text-slate-900 border-b-2 border-slate-900 -mb-[1px]" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Administrator
              </button>
              <button
                onClick={() => setActiveTab("supervisor")}
                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "supervisor" ? "text-slate-900 border-b-2 border-slate-900 -mb-[1px]" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Supervisor
              </button>
            </div>

            {/* Form Container */}
            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait">
                {activeTab === "admin" ? (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Admin ID
                        </label>
                        <input
                          type="text"
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value.trim())}
                          className="w-full px-0 py-3 border-b border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent text-sm placeholder:text-slate-300 rounded-none"
                          placeholder="ENTER ID"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full px-0 py-3 border-b border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent text-sm placeholder:text-slate-300 rounded-none pr-10"
                            placeholder="PASSWORD"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors bg-white pl-2"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="text-red-700 text-xs bg-red-50 p-3 border-l-2 border-red-700 font-medium">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !adminId || !adminPassword}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs uppercase tracking-widest mt-4"
                      >
                        {loading ? "AUTHENTICATING..." : "LOGIN"}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="supervisor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SupervisorLogin embedded={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;