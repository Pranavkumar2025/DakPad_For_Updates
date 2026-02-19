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
    <form onSubmit={handleSupervisorLogin} className="space-y-6">
      {/* Supervisor Select */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Supervisor
        </label>
        <select
          value={supervisorName}
          onChange={(e) => setSupervisorName(e.target.value)}
          required
          disabled={loading}
          className="w-full px-0 py-3 border-b border-slate-300 focus:border-slate-900 focus:ring-0 bg-transparent text-sm transition-colors outline-none cursor-pointer"
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
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Supervisor ID
        </label>
        <input
          type="text"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="w-full px-0 py-3 border-b border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent text-sm placeholder:text-slate-300 rounded-none"
          placeholder="ENTER ID"
          required
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={supervisorPassword}
            onChange={(e) => setSupervisorPassword(e.target.value)}
            className="w-full px-0 py-3 border-b border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent text-sm placeholder:text-slate-300 rounded-none pr-10"
            placeholder="PASSWORD"
            required
            disabled={loading}
            autoComplete="new-password"
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-700 text-xs bg-red-50 p-3 border-l-2 border-red-700 font-medium"
        >
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !supervisorName || !adminId || !supervisorPassword}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs uppercase tracking-widest mt-4"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
            AUTHENTICATING...
          </>
        ) : (
          "LOGIN"
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