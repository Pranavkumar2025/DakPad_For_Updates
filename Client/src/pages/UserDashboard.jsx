// src/pages/UserDashboard.jsx
import React, { useState } from "react";
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  Loader2,
  Download,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import UserNavbar from "../components/UserNavbar";
import QRCode from "qrcode";
import api from "../utils/api";

const UserDashboard = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();

  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");

  /* ────────────────────── QR Code ────────────────────── */
  const generateQRCodeForApplication = async (applicationData) => {
    try {
      const qrData = {
        applicationId: applicationData.applicationId,
        applicantName: applicationData.applicantName,
        submissionDate: applicationData.dateOfApplication,
        type: "DakPad Application",
        verificationUrl: `https://dakpad.com/verify/${applicationData.applicationId}`,
      };
      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error("QR Code error:", err);
    }
  };

  /* ────────────────────── Search ────────────────────── */
  const handleApplicationIdSearch = async () => {
    if (!applicationIdInput.trim()) return;

    setIsLoading(true);
    setError("");
    setFoundApplication(null);
    setQrCodeUrl("");

    try {
      const { data: app } = await api.get(
        `/api/applications/${applicationIdInput.trim()}`
      );

      const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-GB") : "N/A";

      const determineStatus = (timeline = [], officer) => {
        if (!officer || officer === "N/A") return "Pending";
        if (!Array.isArray(timeline) || timeline.length === 0) return "In Process";

        const latest = (timeline[timeline.length - 1]?.section ?? "")
          .toLowerCase();
        if (latest.includes("compliance")) return "Compliance";
        if (latest.includes("disposed")) return "Disposed";
        if (latest.includes("dismissed")) return "Dismissed";
        return "In Process";
      };

      const timeline = Array.isArray(app.timeline) ? app.timeline : [];
      const status = determineStatus(timeline, app.concernedOfficer);

      const processed = {
        applicationId: app.applicantId,
        applicantName: app.applicant || "Unknown",
        dateOfApplication: formatDate(app.applicationDate),
        subject: app.subject || "N/A",
        description: app.subject || "N/A",
        status,
        timeline: timeline.length
          ? timeline
          : [
              {
                section: "Application Received",
                comment: `Received at ${app.block || "N/A"} on ${formatDate(
                  app.applicationDate
                )}`,
                date: formatDate(app.applicationDate),
                pdfLink: app.attachment
                  ? `http://localhost:5000${app.attachment}`
                  : null,
              },
            ],
        lastUpdated:
          timeline.length > 0
            ? formatDate(timeline[timeline.length - 1].date)
            : formatDate(app.applicationDate),
      };

      setFoundApplication(processed);
      await generateQRCodeForApplication(processed);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Application not found"
      );
      setFoundApplication(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsModalLoading(false), 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleApplicationIdSearch();
  };

  /* ────────────────────── Styling ────────────────────── */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
      case "Not Assigned Yet":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          badge: "bg-amber-500 text-white",
          icon: <Clock size={20} />,
        };
      case "Compliance":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          badge: "bg-green-600 text-white",
          icon: <CheckCircle size={20} />,
        };
      case "Dismissed":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          badge: "bg-red-600 text-white",
          icon: <XCircle size={20} />,
        };
      case "Disposed":
        return {
          bg: "bg-purple-100",
          text: "text-purple-700",
          badge: "bg-purple-500 text-white",
          icon: <CheckCircle size={20} />,
        };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          badge: "bg-blue-500 text-white",
          icon: <Clock size={20} />,
        };
    }
  };

  const handleDownloadTimeline = (id) => {
    alert(`Downloading timeline for Application ID: ${id}`);
  };

  /* ────────────────────── Render ────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <UserNavbar />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-60" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-100 to-transparent rounded-full translate-x-32 -translate-y-32 opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-50 to-transparent rounded-full -translate-x-48 translate-y-48 opacity-30" />

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 font-bold font-['Montserrat'] text-3xl sm:text-4xl md:text-5xl flex flex-wrap justify-center gap-2"
            >
              <span className="text-gray-800">{t("dashboard.trackYour")}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c]">
                {isHindi
                  ? t("dashboard.application")
                  : Array.from(t("dashboard.application")).map((l, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="inline-block"
                      >
                        {l}
                      </motion.span>
                    ))}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-['Montserrat']"
            >
              {t("dashboard.subtitle")} <br className="hidden sm:block" />
              {t("dashboard.enterApplicationId")}
            </motion.p>

            {/* ───── Search Card ───── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-xl mx-auto"
            >
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-r from-[#ff5010] to-[#fc641c] rounded-xl flex items-center justify-center shadow-md">
                  <Search className="text-white" size={28} />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 font-['Montserrat']">
                {t("dashboard.enterAppId")}
              </h2>
              <p className="text-gray-600 mb-6 font-['Montserrat']">
                {t("dashboard.trackInstantly")}
              </p>

              {/* Search Input + Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-orange-300 focus-within:bg-white transition-all overflow-hidden">
                  <Search className="ml-4 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={applicationIdInput}
                    onChange={(e) => setApplicationIdInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 px-3 py-4 bg-transparent text-gray-900 focus:outline-none font-['Montserrat'] placeholder-gray-400"
                    placeholder={t("dashboard.placeholder")}
                  />
                </div>

                <motion.button
                  onClick={handleApplicationIdSearch}
                  disabled={isLoading || !applicationIdInput.trim()}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff5010] to-[#fc641c] hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-['Montserrat']"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      {t("dashboard.searching")}
                    </div>
                  ) : (
                    t("dashboard.trackNow")
                  )}
                </motion.button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                  >
                    <XCircle className="text-red-500" size={18} />
                    <p className="text-red-700 font-medium font-['Montserrat']">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ───── Feature Cards ───── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {[
                {
                  icon: Clock,
                  title: t("dashboard.features.realTime.title"),
                  desc: t("dashboard.features.realTime.desc"),
                },
                {
                  icon: QrCode,
                  title: t("dashboard.features.qrCode.title"),
                  desc: t("dashboard.features.qrCode.desc"),
                },
                {
                  icon: Download,
                  title: t("dashboard.features.download.title"),
                  desc: t("dashboard.features.download.desc"),
                },
                {
                  icon: CheckCircle,
                  title: t("dashboard.features.secure.title"),
                  desc: t("dashboard.features.secure.desc"),
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-white p-5 rounded-xl shadow-md border border-gray-100 text-center"
                >
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <f.icon className="text-orange-500" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 font-['Montserrat']">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-['Montserrat']">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── RESULT MODAL ───── */}
      <AnimatePresence>
        {foundApplication && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
            >
              {isModalLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="animate-spin text-green-600" size={40} />
                </div>
              ) : (
                <div className="p-5 sm:p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 font-['Montserrat']">
                      {t("dashboard.modal.applicationId")}{" "}
                      <span className="text-green-700">
                        {foundApplication.applicationId}
                      </span>
                    </h2>
                    <motion.button
                      onClick={() => {
                        setFoundApplication(null);
                        setQrCodeUrl("");
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X size={28} />
                    </motion.button>
                  </div>

                  {/* Status */}
                  <motion.div
                    className={`p-4 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 ${getStatusStyle(
                      foundApplication.status
                    ).bg}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {getStatusStyle(foundApplication.status).icon}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-lg sm:text-xl font-semibold ${getStatusStyle(
                            foundApplication.status
                          ).text} font-['Montserrat']`}
                        >
                          {t("dashboard.modal.status")} {foundApplication.status}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            foundApplication.status
                          ).badge}`}
                        >
                          {foundApplication.status}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${getStatusStyle(
                          foundApplication.status
                        ).text} mt-1 font-['Montserrat']`}
                      >
                        {foundApplication.status === "Pending" &&
                          t("dashboard.statusMessages.pending")}
                        {foundApplication.status === "Compliance" &&
                          t("dashboard.statusMessages.compliance")}
                        {foundApplication.status === "Dismissed" &&
                          t("dashboard.statusMessages.dismissed")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-['Montserrat']">
                        {t("dashboard.modal.lastUpdated")}{" "}
                        {foundApplication.lastUpdated}
                      </p>
                    </div>
                  </motion.div>

                  {/* Details */}
                  <motion.div className="mt-6 bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">
                      {t("dashboard.modal.applicationDetails")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                      {[
                        {
                          label: t("dashboard.modal.id"),
                          value: foundApplication.applicationId,
                          icon: <FileText size={18} className="text-green-600" />,
                        },
                        {
                          label: t("dashboard.modal.name"),
                          value: foundApplication.applicantName,
                          icon: <User size={18} className="text-green-600" />,
                        },
                        {
                          label: t("dashboard.modal.date"),
                          value: foundApplication.dateOfApplication,
                          icon: <Calendar size={18} className="text-green-600" />,
                        },
                        {
                          label: t("dashboard.modal.subject"),
                          value: foundApplication.subject,
                          icon: <FileText size={18} className="text-green-600" />,
                        },
                        {
                          label: t("dashboard.modal.description"),
                          value: foundApplication.description,
                          icon: <FileText size={18} className="text-green-600" />,
                          colSpan: true,
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className={`flex items-start gap-2 ${
                            item.colSpan ? "sm:col-span-2" : ""
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          {item.icon}
                          <div>
                            <span className="text-xs font-medium text-gray-500 font-['Montserrat']">
                              {item.label}
                            </span>
                            <p className="text-base font-medium text-gray-900 font-['Montserrat']">
                              {item.value}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <motion.div className="mt-6 bg-white rounded-xl p-5 shadow-md border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 font-['Montserrat']">
                        <QrCode size={20} className="text-green-600" />
                        {t("dashboard.modal.qrCodeTitle")}
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <img
                          src={qrCodeUrl}
                          alt="QR"
                          className="border rounded-lg shadow-sm w-28 h-28 sm:w-32 sm:h-32"
                        />
                        <div className="text-center sm:text-left flex-1">
                          <p className="text-sm text-gray-600 mb-3 font-['Montserrat']">
                            {t("dashboard.modal.qrCodeDesc")}
                          </p>
                          <button
                            onClick={() => {
                              const a = document.createElement("a");
                              a.download = `dakpad-${foundApplication.applicationId}.png`;
                              a.href = qrCodeUrl;
                              a.click();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium font-['Montserrat']"
                          >
                            <Download size={16} />
                            {t("dashboard.modal.downloadQr")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Timeline */}
                  {foundApplication.timeline && foundApplication.timeline.length > 0 && (
                    <motion.div className="mt-6 bg-white rounded-xl p-5 shadow-md border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Montserrat']">
                        {t("dashboard.modal.progressTimeline")}
                      </h3>
                      <div className="relative pl-7">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-green-200" />
                        {foundApplication.timeline.map((step, i) => {
                          const isLast = i === foundApplication.timeline.length - 1;
                          const isCompleted =
                            isLast ||
                            step.section.includes("Compliance") ||
                            step.section.includes("Disposed");
                          const dot = isCompleted
                            ? "bg-green-600"
                            : "bg-orange-500";
                          return (
                            <motion.div
                              key={i}
                              className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 hover:bg-gray-100"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                            >
                              <div
                                className={`w-5 h-5 rounded-full ${dot} flex items-center justify-center shadow-sm border-2 border-white`}
                              >
                                {isCompleted && (
                                  <CheckCircle size={12} className="text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                                  <p className="text-sm font-semibold text-gray-800 font-['Montserrat']">
                                    {step.section}
                                  </p>
                                  <p className="text-xs text-gray-400 font-['Montserrat']">
                                    {step.date}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 font-['Montserrat']">
                                  {step.comment}
                                </p>
                                {step.pdfLink && (
                                  <a
                                    href={step.pdfLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:text-green-800 mt-1 inline-block font-['Montserrat']"
                                  >
                                    {t("dashboard.modal.viewDocument")}
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <motion.button
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-['Montserrat'] shadow-sm"
                      onClick={() =>
                        handleDownloadTimeline(foundApplication.applicationId)
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={18} /> {t("dashboard.modal.downloadTimeline")}
                    </motion.button>
                    <motion.button
                      className="px-5 py-2.5 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 font-['Montserrat'] shadow-sm"
                      onClick={() => {
                        setFoundApplication(null);
                        setQrCodeUrl("");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t("dashboard.modal.close")}
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Global Styles (Montserrat) ───── */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      `}</style>
    </div>
  );
};

export default UserDashboard;