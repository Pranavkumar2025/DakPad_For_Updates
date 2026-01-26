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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f6]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[650px]"
      >
        {/* Left Side - Professional Solid Color Branding */}
        <div className="hidden md:flex md:w-5/12 bg-[#1e293b] relative p-10 flex-col justify-between text-white">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-8 border border-white/10">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            </div>

            <h1 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
              Jan Samadhan
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Empowering efficient governance and seamless communication for a better tomorrow.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Admin Portal</h3>
                <p className="text-xs text-slate-400">Comprehensive management</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Supervisor Access</h3>
                <p className="text-xs text-slate-400">Field operations & reporting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col relative bg-white">

          {/* Back to Home Link */}
          <div className="absolute top-6 left-8 md:top-8 md:left-12">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors group font-medium"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          <div className="mt-12 md:mt-16 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Please sign in to continue to your dashboard.</p>
            </div>

            {/* Toggle Switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative w-full">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
                animate={{ x: activeTab === "admin" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ translateX: activeTab === "supervisor" ? "4px" : "0" }}
              />
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 rounded-lg ${activeTab === "admin" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Admin
              </button>
              <button
                onClick={() => setActiveTab("supervisor")}
                className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 rounded-lg ${activeTab === "supervisor" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Supervisor
              </button>
            </div>

            {/* Form Container with fixed height helper to prevent jarring layout shifts */}
            <div className="relative min-h-[350px]">
              <AnimatePresence mode="wait">
                {activeTab === "admin" ? (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleAdminLogin} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Admin ID
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your Admin ID"
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value.trim())}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white hover:border-slate-300"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white hover:border-slate-300 pr-12"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !adminId || !adminPassword}
                        className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                      >
                        {loading ? "Signing in..." : "Login as Admin"}
                        {!loading && <ArrowRight size={16} />}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="supervisor"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
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