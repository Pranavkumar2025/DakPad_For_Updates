// src/pages/AdminProfilePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  User,
  Key,
  Shield,
  Building2,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminProfilePage = () => {
  const { t } = useTranslation();

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
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ==================== Sidebar ==================== */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={profile.name || "Admin"}
        userPosition={profile.position || "Administrator"}
      />

      {/* ==================== Main Content ==================== */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto overflow-x-hidden">
        <Navbar
          userName={profile.name || "Admin"}
          userPosition={profile.position || "Administrator"}
          logoLink="/Admin"
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />

        {/* ==================== Profile Content ==================== */}
        <div className="mt-4 sm:mt-6 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 font-['Montserrat']">
              {t("admin.profile.title") || "Admin Profile"}
            </h1>
            <p className="text-gray-600 mt-2 font-['Montserrat']">
              Manage your account details and security settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-800 font-['Montserrat']">
                    {profile.name || "Admin User"}
                  </h2>
                  <p className="text-sm text-gray-500 font-['Montserrat']">
                    {profile.position || "Administrator"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    <Shield size={14} />
                    <span className="font-medium capitalize font-['Montserrat']">
                      {profile.role || "admin"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-['Montserrat']">Admin ID</span>
                      <span className="font-medium text-gray-900 font-['Montserrat']">
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
              </div>
            </motion.div>

            {/* Edit Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 font-['Montserrat'] flex items-center gap-2">
                  <User size={22} />
                  Edit Profile Information
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                        Position / Post
                      </label>
                      <input
                        type="text"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                        placeholder="e.g., Block Development Officer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                        placeholder="e.g., Rural Development"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-['Montserrat']"
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

                {/* Password Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 font-['Montserrat'] flex items-center gap-2">
                      <Key size={22} />
                      Change Password
                    </h3>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium font-['Montserrat']"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-['Montserrat']"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-['Montserrat']"
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

          {/* Feedback Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-6 right-6 bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-['Montserrat']"
              >
                <XCircle size={22} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-6 right-6 bg-green-100 border border-green-300 text-green-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-['Montserrat']"
              >
                <CheckCircle size={22} />
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