import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import loginImg from "../assets/login_img2.webp";

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
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="flex w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#eaf0f7] p-6">
          <img src={loginImg} alt="Admin Login" className="w-[80%]" />
        </div>

        {/* Right Form */}
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Dak Pad</h1>
          <p className="text-sm text-gray-600 mb-6">Admin Login Panel</p>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div
                className="absolute top-9 right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition"
            >
              Login
            </button>
          </form>

          <div className="text-sm text-center text-gray-400 mt-6">
            Powered by{" "}
            <span className="text-orange-500 font-semibold">
              Dak Pad System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
