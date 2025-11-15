// src/pages/ApplicationReceive.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { File, PlusCircle, Loader2 } from "lucide-react";

import AddCaseForm from "../components/AddCaseForm";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ApplicationTable from "../components/ApplicationRecieveComponents/ApplicationTable";
import EditCaseForm from "../components/ApplicationRecieveComponents/EditCaseForm";
import Pagination from "../components/ApplicationRecieveComponents/Pagination";
import api from "../utils/api";

const ApplicationReceive = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [editApplication, setEditApplication] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // New: Admin profile state
  const [admin, setAdmin] = useState({
    name: "Loading…",
    position: "Loading…",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const recordsPerPage = 10;

  // --------------------------------------------------------------
  // 1. Fetch Admin Profile (name + position)
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setAdmin({
          name: data.name || "Receiver",
          position: data.position || "Application Receiver",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdmin({ name: "Receiver", position: "Application Receiver" });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // --------------------------------------------------------------
  // 2. Fetch Applications
  // --------------------------------------------------------------
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/applications");
      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((app) => ({
        ...app,
        ApplicantId: app.applicantId || "N/A",
        applicant: app.applicant || app.name || "Unknown Applicant",
        applicationDate: app.applicationDate
          ? new Date(app.applicationDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        block: app.block || "—",
        sourceAt: app.sourceAt || app.source || "unknown",
        phoneNumber: app.phoneNumber || app.phone || "—",
        emailId: app.emailId || app.email || "—",
        subject: app.subject || "No subject provided",
        attachment: app.attachment || null,
      }));

      setApplications(normalized);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // --------------------------------------------------------------
  // 3. Real-time updates
  // --------------------------------------------------------------
  useEffect(() => {
    const handleUpdate = () => fetchApplications();
    window.addEventListener("applicationUpdated", handleUpdate);
    return () => window.removeEventListener("applicationUpdated", handleUpdate);
  }, [fetchApplications]);

  // --------------------------------------------------------------
  // 4. Modal Handlers
  // --------------------------------------------------------------
  const handleAddClose = () => {
    setShowAddForm(false);
    fetchApplications();
  };

  const handleEdit = (app) => {
    setEditApplication(app);
    setShowEditForm(true);
  };

  const handleEditClose = async (updatedData) => {
    if (updatedData) {
      setApplications((prev) =>
        prev.map((a) => (a.ApplicantId === updatedData.ApplicantId ? updatedData : a))
      );
    }
    setShowEditForm(false);
    setEditApplication(null);
    fetchApplications();
  };

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  // --------------------------------------------------------------
  // 5. Pagination
  // --------------------------------------------------------------
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / recordsPerPage);

  // --------------------------------------------------------------
  // 6. Early return if profile is loading
  // --------------------------------------------------------------
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse">Loading profile…</div>
      </div>
    );
  }

  // --------------------------------------------------------------
  // 7. Main Render
  // --------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        userName={admin.name}
        userPosition={admin.position}
      />

      <main className="flex-1 md:ml-16 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto md:mr-20">
          <Navbar
            userName={admin.name}
            userPosition={admin.position}
            logoLink="/application-receive"
            isMenuOpen={isMenuOpen}
            toggleMenu={toggleMenu}
          />
        </div>

        <div className="max-w-7xl mx-auto mt-6">
          {/* Header */}
          <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
            <h1 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-4 h-4 sm:w-5 sm:h-5 text-[#2810ff]" />
              Applications
            </h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-6 sm:py-2 bg-green-600 text-white rounded-md text-xs sm:text-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="inline sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Application</span>
            </motion.button>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2810ff]" />
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600">
              Error: {error}
              <button
                onClick={fetchApplications}
                className="ml-4 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <ApplicationTable
                currentRecords={currentRecords}
                indexOfFirstRecord={indexOfFirstRecord}
                handleEdit={handleEdit}
              />

              {applications.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  applications={applications}
                  indexOfFirstRecord={indexOfFirstRecord}
                  indexOfLastRecord={indexOfLastRecord}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* ---------- MODALS ---------- */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <AddCaseForm isOpen={showAddForm} onClose={handleAddClose} />
          </motion.div>
        )}

        {showEditForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <EditCaseForm
              isOpen={showEditForm}
              onClose={handleEditClose}
              editApplication={editApplication}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationReceive;