// src/pages/AdminProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ← Added for back button
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Lock,
  Building2,
  Briefcase,
  Badge,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import api from "../utils/api";

const AdminProfilePage = () => {
  const navigate = useNavigate(); // ← For back navigation

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
      setTimeout(() => setSuccess(""), 5000);
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
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-700 mx-auto" size={56} />
          <p className="text-gray-600 mt-6 text-lg font-medium">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl sm:ml-24 mx-auto">
        {/* Back Button + Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-indigo-500 hover:text-indigo-800 cursor-pointer font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={22} />
            Back to Dashboard
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Account</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium">
              Government of India • Secure Administrative Portal
            </p>
            <div className="mt-5 w-32 h-1 bg-indigo-700 mx-auto"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 shadow-sm bg-gradient-to-br from-indigo-50/30 to-white">
              <div className="p-8 text-center border-b border-gray-200">
                <div className="w-32 h-32 mx-auto bg-indigo-700 text-white flex items-center justify-center text-5xl font-bold shadow-xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600 mt-1 text-lg">{profile.position}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center gap-3">
                    <Badge className="w-5 h-5 text-indigo-700" />
                    Role
                  </span>
                  <span className="font-semibold text-gray-900 capitalize">{profile.role}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center gap-3">
                    <UserCircle2 className="w-5 h-5 text-indigo-700" />
                    Admin ID
                  </span>
                  <span className="font-mono font-bold text-gray-900">{profile.adminId}</span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <span className="text-gray-600 font-medium flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-indigo-700" />
                    Department
                  </span>
                  <span className="font-medium text-gray-900">{profile.department || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit Profile */}
            <div className="bg-white border border-gray-200 shadow-sm bg-gradient-to-br from-indigo-50/20 to-white">
              <div className="px-8 py-6 border-b border-gray-200 bg-indigo-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-700 rounded">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Profile Information</h3>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors font-medium"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Admin ID</label>
                      <input
                        type="text"
                        value={profile.adminId}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Position / Designation</label>
                      <input
                        type="text"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors font-medium"
                        placeholder="e.g., Block Development Officer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors font-medium"
                        placeholder="e.g., Rural Development Department"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-3 bg-indigo-700 text-white font-bold flex items-center gap-3 hover:bg-indigo-800 disabled:opacity-60 transition-colors shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white border border-gray-200 shadow-sm bg-gradient-to-br from-emerald-50/20 to-white">
              <div className="px-8 py-6 border-b border-gray-200 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded">
                    <Lock size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-indigo-700 hover:text-indigo-800 font-medium underline"
                >
                  {showPasswordForm ? "Cancel" : "Change Password"}
                </button>
              </div>

              <AnimatePresence>
                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 border-t border-gray-100"
                  >
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input
                          type={showNew ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                          {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      <div className="flex justify-end pt-4">
                        <motion.button
                          type="submit"
                          className="px-8 py-3 bg-emerald-700 text-white font-bold flex items-center gap-3 hover:bg-emerald-800 transition-colors shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Lock size={20} />
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

        {/* Toast Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 shadow-2xl flex items-center gap-3 font-medium z-50 border border-red-700"
            >
              <XCircle size={24} />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 shadow-2xl flex items-center gap-3 font-medium z-50 border border-green-700"
            >
              <CheckCircle size={24} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminProfilePage;