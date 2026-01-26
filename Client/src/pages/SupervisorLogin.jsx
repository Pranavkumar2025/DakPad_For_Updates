import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supervisorLogin } from "../utils/api";
import toast from "react-hot-toast";

const SupervisorLogin = ({ onBack, embedded = false }) => {
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
      // CORRECT ENDPOINT after backend refactor
      const res = await supervisorLogin({ supervisorName, adminId, password: supervisorPassword });

      if (res.data.success) {
        toast.success(`Welcome, ${res.data.supervisor?.name || supervisorName}!`, {
          icon: "Welcome",
          duration: 4000,
        });
        navigate("/supervisor-dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid credentials or access denied.";
      setError(msg);
      toast.error("Login failed");
      console.error("Supervisor login error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSupervisorLogin} className="space-y-5">
      {/* Supervisor Select */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Select Supervisor
        </label>
        <select
          value={supervisorName}
          onChange={(e) => setSupervisorName(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-base hover:border-slate-300 transition-all"
        >
          <option value="">Choose a supervisor</option>
          <option>ADM Bhojpur</option>
          <option>DDC Bhojpur</option>
          <option>DEO Bhojpur</option>
          <option>Civil Sergent</option>
          <option>DPM</option>
        </select>
      </div>

      {/* Admin ID */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Supervisor ID
        </label>
        <input
          type="text"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          placeholder="e.g. SUP001"
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-base hover:border-slate-300 transition-all"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={supervisorPassword}
          onChange={(e) => setSupervisorPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg pr-14 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-base hover:border-slate-300 transition-all"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-slate-400 hover:text-indigo-600 transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !supervisorName || !adminId || !supervisorPassword}
        className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Authenticating...
          </>
        ) : (
          "Login as Supervisor"
        )}
      </button>
    </form>
  );

  if (embedded) {
    return <div className="mt-4">{formContent}</div>;
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Back Button */}
      <motion.a
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition group z-10"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
        <span className="font-medium">Back to Home</span>
      </motion.a>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="bg-white rounded-2xl shadow-2xl p-10 lg:p-12"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <motion.img
            src="/logo.svg"
            alt="Jan Samadhan"
            className="w-14 h-14 mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <h1 className="text-3xl font-bold text-slate-900">
            Supervisor Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">Jan Samadhan — Field Operations</p>
        </div>

        {formContent}

        {/* Back to Admin Login */}
        <p className="text-center text-sm text-slate-500 mt-7">
          Not a supervisor?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-600 font-bold hover:underline transition"
          >
            Back to Admin Login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SupervisorLogin;