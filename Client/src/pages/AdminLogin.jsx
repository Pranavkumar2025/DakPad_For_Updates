import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { FaUsers } from "react-icons/fa"; // Added FaUsers for logo icon
import { motion } from "framer-motion";


const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // ✅ Hardcoded credentials check
    if (adminId === "0519" && password === "@Dakpad2025") {
      localStorage.setItem("adminToken", "hardcoded-token");
      navigate("/Admin");
    } else {
      setError("Invalid Admin ID or Password");
    }

    if (adminId === "0520" && password === "@Dakpad2026") {
      localStorage.setItem("adminToken", "hardcoded-token");
      navigate("/work-assigned");
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-50 px-4">
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
    {/* Logo + Title */}
    <div className="flex flex-col items-center mb-8">
      <img
        src="/logo.svg"
        alt="Dak Pad Logo"
        className="w-16 h-16 mb-4"
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
          className="text-2xl font-bold  uppercase bg-clip-text text-gray-800 tracking-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Jan Samadhan
        </span>
      </motion.div>
      <p className="text-sm text-gray-500">Admin Login Panel</p>
    </div>

    {/* Login Form */}
    <form className="space-y-5" onSubmit={handleLogin}>
      {/* Admin ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Admin ID
        </label>
        <input
          type="text"
          placeholder="Enter Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800"
        />
        <div
          className="absolute top-10 right-3 text-gray-500 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-medium text-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition"
      >
        Login
      </button>
    </form>

    {/* Footer */}
    <div className="text-sm text-center text-gray-400 mt-8">
      Powered by{" "}
      <span className="text-orange-500 font-semibold">
        Jan Samadhan System
      </span>
    </div>
  </div>
</div>

  );
};

export default AdminLogin;
