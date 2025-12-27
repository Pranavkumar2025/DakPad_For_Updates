// src/pages/AdminProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Shield,
  Building2,
  Briefcase,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../utils/api";

const AdminProfilePage = () => {
  const navigate = useNavigate();

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await api.patch("/api/admin/profile", profile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

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
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin text-slate-700 mx-auto" />
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 sm:ml-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-800 font-medium mb-6 transition-colors hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 shadow-lg p-8">
              <div className="flex flex-col items-center text-center">
                {/* Simple solid professional slate color avatar */}
                <div className="w-32 h-32 bg-slate-700 text-white text-5xl font-bold rounded-lg flex items-center justify-center shadow-xl mb-6">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-lg text-slate-700 font-medium mt-1">{profile.position}</p>
                <span className="mt-3 inline-block px-5 py-2 bg-slate-100 text-slate-800 font-semibold rounded-full text-sm uppercase tracking-wide">
                  {profile.role}
                </span>
              </div>

              <div className="mt-10 space-y-6 border-t border-gray-200 pt-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <User className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Admin ID</p>
                    <p className="font-mono font-bold text-gray-900 text-lg">{profile.adminId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900 text-lg">{profile.department || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Shield className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Access Level</p>
                    <p className="font-semibold text-gray-900 capitalize text-lg">{profile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Forms */}
          <div className="lg:col-span-8 space-y-8">
            {/* Edit Profile Card */}
            <div className="bg-white border border-gray-200 shadow-lg p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-slate-100 rounded-xl">
                  <Briefcase className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-300 focus:border-slate-600 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-gray-900"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin ID</label>
                    <input
                      type="text"
                      value={profile.adminId}
                      readOnly
                      className="w-full px-5 py-4 border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position / Designation</label>
                    <input
                      type="text"
                      value={profile.position}
                      onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-300 focus:border-slate-600 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                      placeholder="e.g., District Magistrate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-300 focus:border-slate-600 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                      placeholder="e.g., Revenue Department"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <motion.button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-4 bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 cursor-pointer flex items-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        Save Profile
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Password Change Card */}
            <div className="bg-white border border-gray-200 shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 rounded-xl">
                    <Lock className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Change Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-slate-700 hover:text-blue-900 cursor-pointer font-semibold underline"
                >
                  {showPasswordForm ? "Cancel" : "Update Password"}
                </button>
              </div>

              <AnimatePresence>
                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 pt-6 border-t border-gray-200"
                  >
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full px-5 py-4 pr-14 border border-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrent ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input
                          type={showNew ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full px-5 py-4 pr-14 border border-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                        >
                          {showNew ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full px-5 py-4 pr-14 border border-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                      </div>

                      <div className="pt-4">
                        <motion.button
                          type="submit"
                          className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 flex items-center gap-3 transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Lock className="w-6 h-6" />
                          Update Password
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 bg-red-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-semibold text-lg z-50"
          >
            <XCircle className="w-8 h-8" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-semibold text-lg z-50"
          >
            <CheckCircle className="w-8 h-8" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfilePage;