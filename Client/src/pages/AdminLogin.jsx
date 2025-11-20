// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../utils/api";
import SupervisorLogin from "./SupervisorLogin"; // Import the new component

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
      const res = await api.post("/api/admin/login", {
        adminId,
        password: adminPassword,
      });

      if (res.data.success) {
        navigate(res.data.redirect || "/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-50 px-4 py-12">
      <div className="relative w-full max-w-4xl h-[620px] perspective-1000">
        {/* 3D Flip Card Container */}
        <motion.div
          className="absolute inset-0 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 90 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front: Admin Login */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
              <motion.a
                href="/"
                className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                <span className="font-medium">Back</span>
              </motion.a>

              <div className="flex flex-col items-center mb-8 mt-12">
                <motion.img
                  src="/logo.svg"
                  alt="Logo"
                  className="w-16 h-16 mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                />
                <div className="flex items-center gap-3">
                  <FaUsers className="text-4xl text-orange-600" />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Jan Samadhan
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-2">Admin Portal</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <input
                  type="text"
                  placeholder="Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-12 focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-orange-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Admin Login"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                Are you a Supervisor?{" "}
                <button
                  onClick={() => setIsFlipped(true)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Login here →
                </button>
              </p>
            </div>
          </div>

          {/* Back: Supervisor Login (as reusable component) */}
          <div
            className="absolute inset-0 backface-hidden flex items-center justify-center"
            style={{ transform: "rotateY(180deg)" }}
          >
            <SupervisorLogin onBack={() => setIsFlipped(false)} />
          </div>
        </motion.div>
      </div>

      {/* 3D Flip CSS */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
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