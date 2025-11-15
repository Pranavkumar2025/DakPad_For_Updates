// src/pages/AdminProfilePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Key,
  Shield,
  Building2,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminProfilePage = () => {
  const navigate = useNavigate();

  // --- Sidebar & Navbar State ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // --- Profile Data ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    adminId: "",
    position: "",
    department: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // --- Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/api/admin/profile");
        setProfile({
          name: data.name || "",
          adminId: data.adminId || "",
          position: data.position || "",
          department: data.department || "",
          role: data.role || "",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- Update Profile ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await api.patch("/api/admin/profile", profile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
        setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Change Password ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.new !== passwordData.confirm) {
      setError("New passwords do not match");
      return;
    }
    if (passwordData.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await api.patch("/api/admin/password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      setSuccess("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    }
  };

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* ==================== Sidebar ==================== */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={profile.name || "Admin"}
        userPosition={profile.position || "Administrator"}
      />

      {/* ==================== Main Content ==================== */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
        <Navbar
          userName={profile.name || "Admin"}
          userPosition={profile.position || "Administrator"}
          logoLink="/Admin"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="max-w-5xl mx-auto mt-6">
          {/* ==================== Back + Header ==================== */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center flex-1"
            >
              <h1 className="text-3xl sm:text-4xl font-bold  bg-clip-text text-gray-800 font-['Montserrat'] tracking-tight">
                My Account
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base font-['Montserrat']">
                Manage your profile, security, and preferences
              </p>
            </motion.div>

            <div className="w-20" /> {/* Spacer */}
          </div>

          {/* ==================== Profile Grid ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ==================== Profile Card ==================== */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900 font-['Montserrat']">
                    {profile.name || "Admin User"}
                  </h2>
                  <p className="text-sm text-gray-600 font-['Montserrat']">
                    {profile.position || "Administrator"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                    <Shield size={14} />
                    <span className="capitalize">{profile.role || "admin"}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-['Montserrat']">Admin ID</span>
                    <span className="font-semibold text-gray-900 font-['Montserrat']">
                      {profile.adminId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-['Montserrat']">Department</span>
                    <span className="font-medium text-gray-900 font-['Montserrat']">
                      {profile.department || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ==================== Edit Form ==================== */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Montserrat'] flex items-center gap-2">
                  <User size={22} className="text-blue-600" />
                  Edit Profile Information
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat'] text-gray-900"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                        Admin ID
                      </label>
                      <input
                        type="text"
                        value={profile.adminId}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed font-['Montserrat']"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                        Position / Post
                      </label>
                      <input
                        type="text"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat']"
                        placeholder="e.g., Block Development Officer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat']"
                        placeholder="e.g., Rural Development"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-['Montserrat']"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* ==================== Password Section ==================== */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 font-['Montserrat'] flex items-center gap-2">
                      <Key size={22} className="text-red-600" />
                      Change Password
                    </h3>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium font-['Montserrat'] underline"
                    >
                      {showPasswordForm ? "Cancel" : "Change Password"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showPasswordForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handlePasswordChange}
                        className="space-y-4 mt-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat']"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat']"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Montserrat']">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-['Montserrat']"
                            required
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <motion.button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all font-['Montserrat']"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Key size={18} />
                            Update Password
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ==================== Toast Messages ==================== */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-['Montserrat'] text-sm"
              >
                <XCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-['Montserrat'] text-sm"
              >
                <CheckCircle size={20} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");
      `}</style>
    </div>
  );
};

export default AdminProfilePage;