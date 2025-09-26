import React, { useState, useEffect } from "react";
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
import UserNavbar from "../components/UserNavbar";
import QRCode from "qrcode";

const UserDashboard = () => {
  const [cases, setCases] = useState([]);
  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Generate QR code for application
  const generateQRCodeForApplication = async (applicationData) => {
    try {
      const qrData = {
        applicationId: applicationData.applicationId,
        applicantName: applicationData.applicantName,
        submissionDate: applicationData.dateOfApplication,
        type: "DakPad Application",
        verificationUrl: `https://dakpad.com/verify/${applicationData.applicationId}`,
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Load applications from localStorage
  useEffect(() => {
    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );
    setCases(storedApplications);
  }, []);

  // Real-time localStorage updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "applications") {
        setCases(JSON.parse(localStorage.getItem("applications") || "[]"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Search for application by ApplicantId
  const handleApplicationIdSearch = async () => {
    if (!applicationIdInput.trim()) return;
    setIsLoading(true);
    setIsModalLoading(true);
    setTimeout(async () => {
      const match = cases.find(
        (c) => c.ApplicantId === applicationIdInput.trim()
      );
      const foundApp = match
        ? {
          applicationId: match.ApplicantId,
          applicantName: match.applicant,
          dateOfApplication: match.applicationDate,
          subject: match.subject,
          description: match.subject,
          status:
            match.status === "Compliance Completed"
              ? "Compliance"
              : match.status || "Pending",
          timeline: match.timeline || [
            {
              section: "Application Received",
              comment: `Application received at ${match.block || "N/A"} on ${match.applicationDate
                }`,
              date: match.applicationDate,
              pdfLink: match.attachment || null,
            },
          ],
          lastUpdated:
            match.timeline?.length > 0
              ? match.timeline[match.timeline.length - 1].date
              : match.applicationDate,
        }
        : false;

      setFoundApplication(foundApp);

      // Generate QR code if application found
      if (foundApp) {
        await generateQRCodeForApplication(foundApp);
      }

      setIsLoading(false);
      setTimeout(() => setIsModalLoading(false), 300); // Simulate modal data load
    }, 500); // Simulate API delay
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleApplicationIdSearch();
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
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
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          badge: "bg-gray-500 text-white",
          icon: <FileText size={20} />,
        };
    }
  };

  // Simulate downloading timeline as PDF
  const handleDownloadTimeline = (applicationId) => {
    alert(`Downloading timeline for Application ID: ${applicationId}`);
    // In production, implement PDF generation (e.g., using jsPDF)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <UserNavbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-60"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-100 to-transparent rounded-full transform translate-x-32 -translate-y-32 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-50 to-transparent rounded-full transform -translate-x-48 translate-y-48 opacity-30"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 font-['Montserrat'] flex justify-center gap-2">
                <motion.span
                  className="text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  Track Your
                </motion.span>
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#fc641c]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {Array.from("Application").map((letter, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>
              </h1>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-['Montserrat']"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Track your application in real time. <br />Enter your Application ID
                to see status and timeline.{" "}
              </motion.p>
            </motion.div>
                  
            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff5010] to-[#fc641c] rounded-2xl flex items-center justify-center shadow-lg">
                  <Search className="text-white" size={28} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-['Montserrat']">
                Enter Application ID
              </h2>
              <p className="text-gray-600 mb-8 font-['Montserrat']">
                Track your application status instantly
              </p>

              {/* Enhanced Search Input */}
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-orange-300 focus-within:bg-white transition-all duration-300 overflow-hidden">
                  <Search className="ml-6 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={applicationIdInput}
                    onChange={(e) => setApplicationIdInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 px-4 py-5 bg-transparent text-gray-900 focus:outline-none text-lg font-['Montserrat'] placeholder-gray-400"
                    placeholder="e.g., BP12345"
                    aria-label="Application ID"
                  />
                  <motion.button
                    onClick={handleApplicationIdSearch}
                    disabled={isLoading || !applicationIdInput.trim()}
                    className="mr-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff5010] to-[#fc641c] hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-['Montserrat']"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Search application"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Searching...
                      </div>
                    ) : (
                      "Track Now"
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {foundApplication === false &&
                  applicationIdInput.trim() &&
                  !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="flex items-center">
                        <XCircle className="text-red-500 mr-2" size={20} />
                        <p className="text-red-700 font-['Montserrat'] font-medium">
                          No application found with this ID. Please check and
                          try again.
                        </p>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: Clock,
                  title: "Real-time Updates",
                  desc: "Get instant status updates",
                },
                {
                  icon: QrCode,
                  title: "QR Code Access",
                  desc: "Quick access via QR code",
                },
                {
                  icon: Download,
                  title: "Download Reports",
                  desc: "Get detailed timeline PDFs",
                },
                {
                  icon: CheckCircle,
                  title: "Secure Tracking",
                  desc: "Safe and encrypted data",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="text-center p-6"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <feature.icon className="text-orange-500" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 font-['Montserrat']">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-['Montserrat']">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {foundApplication && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isModalLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="animate-spin text-green-600" size={40} />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 font-['Montserrat']">
                      Application ID:{" "}
                      <span className="text-green-700">
                        {foundApplication.applicationId}
                      </span>
                    </h2>
                    <motion.button
                      onClick={() => {
                        setFoundApplication(null);
                        setQrCodeUrl("");
                      }}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Close modal"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={28} />
                    </motion.button>
                  </div>

                  {/* Modal Content */}
                  <div className="space-y-8">
                    {/* Status Card */}
                    <motion.div
                      className={`p-6 rounded-xl shadow-md ${
                        getStatusStyle(foundApplication.status).bg
                      } flex items-center gap-5`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {getStatusStyle(foundApplication.status).icon}
                      <div>
                        <div className="flex items-center gap-3">
                          <h2
                            className={`text-xl font-semibold ${
                              getStatusStyle(foundApplication.status).text
                            } font-['Montserrat']`}
                          >
                            Status: {foundApplication.status}
                          </h2>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              getStatusStyle(foundApplication.status).badge
                            }`}
                          >
                            {foundApplication.status}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            getStatusStyle(foundApplication.status).text
                          } mt-1 font-['Montserrat']`}
                        >
                          {foundApplication.status === "Pending" &&
                            "Your application is under review. Check the timeline for updates."}
                          {foundApplication.status === "Compliance" &&
                            "Your application has been approved and is compliant."}
                          {foundApplication.status === "Dismissed" &&
                            "Your application has been dismissed. See details below."}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-['Montserrat']">
                          Last Updated: {foundApplication.lastUpdated}
                        </p>
                      </div>
                    </motion.div>

                    {/* Application Details Card */}
                    <motion.div
                      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                        Application Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
                        {[
                          {
                            label: "ID",
                            value: foundApplication.applicationId,
                            icon: (
                              <FileText
                                size={18}
                                className="text-green-600 mt-0.5"
                              />
                            ),
                          },
                          {
                            label: "Name",
                            value: foundApplication.applicantName,
                            icon: (
                              <User
                                size={18}
                                className="text-green-600 mt-0.5"
                              />
                            ),
                          },
                          {
                            label: "Date",
                            value: foundApplication.dateOfApplication,
                            icon: (
                              <Calendar
                                size={18}
                                className="text-green-600 mt-0.5"
                              />
                            ),
                          },
                          {
                            label: "Subject",
                            value: foundApplication.subject,
                            icon: (
                              <FileText
                                size={18}
                                className="text-green-600 mt-0.5"
                              />
                            ),
                          },
                          {
                            label: "Description",
                            value: foundApplication.description,
                            icon: (
                              <FileText
                                size={18}
                                className="text-green-600 mt-0.5"
                              />
                            ),
                            colSpan: true,
                          },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            className={`flex items-start gap-3 ${
                              item.colSpan ? "sm:col-span-2" : ""
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.06 }}
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

                    {/* QR Code Card */}
                    {qrCodeUrl && (
                      <motion.div
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat'] flex items-center gap-2">
                          <QrCode size={20} className="text-green-600" />
                          Application QR Code
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="flex-shrink-0">
                            <img
                              src={qrCodeUrl}
                              alt="Application QR Code"
                              className="border rounded-lg shadow-sm w-32 h-32"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <p className="text-sm text-gray-600 mb-3 font-['Montserrat']">
                              Scan this QR code for quick access to your
                              application details
                            </p>
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.download = `dakpad-application-${foundApplication.applicationId}.png`;
                                link.href = qrCodeUrl;
                                link.click();
                              }}
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium font-['Montserrat'] gap-2"
                            >
                              <Download size={16} />
                              Download QR Code
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Timeline Card */}
                    {foundApplication.timeline &&
                      foundApplication.timeline.length > 0 && (
                        <motion.div
                          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-5 font-['Montserrat']">
                            Progress Timeline
                          </h3>
                          <div className="relative pl-8">
                            <div className="absolute left-3.5 top-0 bottom-0 w-1 bg-green-200" />
                            {foundApplication.timeline.map((step, index) => {
                              const isCompleted =
                                index < foundApplication.timeline.length - 1 ||
                                step.section === "Compliance Completed";
                              const isPending =
                                step.section === "Application Received" ||
                                step.section.includes("Assigned");
                              const isRejected = step.section === "Dismissed";
                              const dotClass = isCompleted
                                ? "bg-green-600 border-2 border-white"
                                : isPending
                                ? "bg-orange-500"
                                : isRejected
                                ? "bg-red-600"
                                : "bg-gray-300";
                              const icon = isCompleted ? (
                                <CheckCircle size={18} className="text-white" />
                              ) : null;

                              return (
                                <motion.div
                                  key={index}
                                  className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 relative hover:bg-gray-100 transition-colors"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.06,
                                  }}
                                >
                                  <div className="relative">
                                    <div
                                      className={`w-6 h-6 rounded-full ${dotClass} flex items-center justify-center shadow-md`}
                                      style={{ zIndex: 1 }}
                                    >
                                      {icon}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
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
                                      <motion.a
                                        href={step.pdfLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative inline-block text-sm text-green-600 hover:text-green-800 hover:underline transition-colors font-['Montserrat'] mt-1 group"
                                        whileHover={{ scale: 1.05 }}
                                        aria-label="View timeline document"
                                      >
                                        View Document
                                        <span className="absolute hidden group-hover:block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md -top-8 left-1/2 transform -translate-x-1/2 font-['Montserrat']">
                                          Open PDF
                                        </span>
                                      </motion.a>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                    {/* Footer Actions */}
                    <motion.div
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {foundApplication.timeline && (
                        <motion.button
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-['Montserrat'] shadow-sm"
                          onClick={() =>
                            handleDownloadTimeline(
                              foundApplication.applicationId
                            )
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Download timeline"
                        >
                          <Download size={18} /> Download Timeline
                        </motion.button>
                      )}
                      <motion.button
                        className="px-5 py-2.5 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors font-['Montserrat'] shadow-sm"
                        onClick={() => {
                          setFoundApplication(null);
                          setQrCodeUrl("");
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Close modal"
                      >
                        Close
                      </motion.button>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        input:focus,
        button:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
