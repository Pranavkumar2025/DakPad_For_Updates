// src/pages/AdminProfilePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Key,
  Building2,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../utils/api";

const AdminProfilePage = () => {
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

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/api/me");
        const user = data.user;

        setProfile({
          name: user.name || "User",
          adminId: user.adminId || user.supervisorId || user.id || "N/A",
          position: user.position || user.designation || "Officer",
          department: user.department || "N/A",
          role: user.role || "user",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await api.patch("/api/admin/profile", profile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password
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
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mx-auto" size={56} />
          <p className="text-gray-700 mt-6 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight">
          My Account
        </h1>
        <p className="text-gray-600 text-lg mt-4 font-medium">
          Government of India • Secure Administrative Portal
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-300 rounded-full flex items-center justify-center text-5xl font-bold text-orange-700 shadow-xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600 mt-1 font-medium">{profile.position}</p>

              <div className="mt-6 inline-flex items-center gap-3 bg-blue-50 text-blue-800 px-6 py-3 rounded-full font-semibold text-sm">
                <Shield size={18} />
                <span className="capitalize">{profile.role || "Administrator"}</span>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 space-y-5 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Admin ID</span>
                  <span className="font-bold text-gray-800">{profile.adminId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <Building2 size={16} />
                    Department
                  </span>
                  <span className="font-medium text-gray-800">{profile.department || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Edit Forms */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8 space-y-8"
        >
          {/* Edit Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-orange-100 rounded-xl">
                <User className="text-orange-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Edit Profile Information</h3>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin ID</label>
                  <input
                    type="text"
                    value={profile.adminId}
                    readOnly
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Position / Designation</label>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                    placeholder="e.g., Block Development Officer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                    placeholder="e.g., Rural Development Department"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <motion.button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={22} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl">
                  <Key className="text-green-700" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-orange-600 hover:text-orange-700 font-bold underline text-lg"
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
                  transition={{ duration: 0.4 }}
                  onSubmit={handlePasswordChange}
                  className="space-y-6"
                >
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-gray-300 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-11 text-gray-600 hover:text-gray-800"
                    >
                      {showCurrent ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-gray-300 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-11 text-gray-600 hover:text-gray-800"
                    >
                      {showNew ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-gray-300 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-11 text-gray-600 hover:text-gray-800"
                    >
                      {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  <div className="flex justify-end pt-6">
                    <motion.button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Key size={22} />
                      Update Password
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 right-8 bg-red-600 text-white px-8 py-5 rounded-xl shadow-2xl flex items-center gap-3 font-bold z-50"
          >
            <XCircle size={26} />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-8 py-5 rounded-xl shadow-2xl flex items-center gap-3 font-bold z-50"
          >
            <CheckCircle size={26} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font Import (Optional - keep if not in index.html) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
        body {
          font-family: 'Hind Siliguri', 'Roboto', system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default AdminProfilePage;