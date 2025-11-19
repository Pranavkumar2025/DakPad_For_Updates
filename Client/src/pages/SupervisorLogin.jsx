// src/components/SupervisorLogin.jsx
import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const SupervisorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [supervisorName, setSupervisorName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // You can later connect this to real supervisor auth
    // For now, demo: Person 1–5 with password "123"
    const validSupervisors = ["Person 1", "Person 2", "Person 3", "Person 4", "Person 5"];
    if (validSupervisors.includes(supervisorName) && password === "123") {
      localStorage.setItem("supervisor", supervisorName);
      navigate("/supervisor-dashboard");
    } else {
      setError("Invalid supervisor name or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative">
        <motion.a
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </motion.a>

        <div className="flex flex-col items-center mb-8 mt-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
          >
            <FaUserShield className="text-4xl text-indigo-600" />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-indigo-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Supervisor Login
          </motion.h1>
          <p className="text-sm text-gray-500 mt-2">Monitor assigned applications</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervisor Name
            </label>
            <select
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
              disabled={loading}
            >
              <option value="">Select Supervisor</option>
              <option>Person 1</option>
              <option>Person 2</option>
              <option>Person 3</option>
              <option>Person 4</option>
              <option>Person 5</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password (demo: 123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 text-gray-500 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p className="text-red-500 text-sm text-center font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
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
              "Login as Supervisor"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 mt-8">
          <p>Demo Password: <span className="font-bold text-indigo-600">123</span></p>
        </div>
      </div>
    </div>
  );
};

export default SupervisorLogin;