// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Clock,
  QrCode,
  Download,
  CheckCircle,
  Shield,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import UserNavbar from "../components/UserNavbar";
import ApplicationResultModal from "../components/ApplicationResultModal";
import api from "../utils/api";
import QRCode from "qrcode";

// Import Images
import pic1 from "../assets/pic1.png";
import pic2 from "../assets/pic2.png";
import pic3 from "../assets/pic3.png";
import pic4 from "../assets/pic4.png";
import pic5 from "../assets/pic5.png";

const images = [pic1, pic2, pic3, pic4, pic5];

const UserDashboard = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();

  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateQRCodeForApplication = async (applicationData) => {
    try {
      const qrData = {
        applicationId: applicationData.applicationId,
        applicantName: applicationData.applicantName,
        submissionDate: applicationData.dateOfApplication,
        type: "Jan Samadhan Application",
        verificationUrl: `https://dakpad.com/verify/${applicationData.applicationId}`,
      };
      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: { dark: "#ea580c", light: "#FFFFFF" },
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error("QR Code error:", err);
    }
  };

  const handleApplicationIdSearch = async () => {
    if (!applicationIdInput.trim()) return;

    setIsLoading(true);
    setError("");
    setFoundApplication(null);
    setQrCodeUrl("");

    try {
      const { data: app } = await api.get(`/api/track/${applicationIdInput.trim()}`);

      const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "N/A");

      const determineStatus = () => {
        if (!app.concernedOfficer || app.concernedOfficer === "N/A")
          return isHindi ? "लंबित" : "Pending";
        if (!app.timeline || app.timeline.length === 0)
          return isHindi ? "प्रक्रिया में" : "In Process";

        const latest = (app.timeline[app.timeline.length - 1]?.section || "").toLowerCase();
        if (latest.includes("compliance")) return isHindi ? "अनुपालन" : "Compliance";
        if (latest.includes("disposed")) return isHindi ? "निष्पादित" : "Disposed";
        if (latest.includes("dismissed")) return isHindi ? "खारिज" : "Dismissed";
        return isHindi ? "प्रक्रिया में" : "In Process";
      };

      const processed = {
        applicationId: app.applicantId,
        applicantName: app.applicant || "Unknown",
        dateOfApplication: formatDate(app.applicationDate),
        subject: app.subject || "N/A",
        description: app.subject || "N/A",
        status: determineStatus(),
        timeline: app.timeline?.length
          ? app.timeline
          : [
              {
                section: isHindi ? "आवेदन प्राप्त हुआ" : "Application Received",
                comment: `${isHindi ? "प्राप्त हुआ" : "Received"} at ${app.block || "N/A"} on ${formatDate(app.applicationDate)}`,
                date: formatDate(app.applicationDate),
                pdfLink: app.attachment ? `http://localhost:5000${app.attachment}` : null,
              },
            ],
        lastUpdated:
          app.timeline?.length > 0
            ? formatDate(app.timeline[app.timeline.length - 1].date)
            : formatDate(app.applicationDate),
      };

      setFoundApplication(processed);
      await generateQRCodeForApplication(processed);
    } catch (err) {
      setError(isHindi ? "आवेदन नहीं मिला" : "Application not found");
      setFoundApplication(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleApplicationIdSearch();
  };

  const closeModal = () => {
    setFoundApplication(null);
    setQrCodeUrl("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <UserNavbar />

      {/* Top Government Strip */}
      <div className="bg-orange-700 text-white py-3 text-center font-semibold text-sm">
        <span className="flex items-center justify-center gap-2">
          <Shield size={18} />
          भारत सरकार | जन समाधान - लोक शिकायत एवं आवेदन ट्रैकिंग पोर्टल
        </span>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="text-gray-800">
                  {isHindi ? "ट्रैक करें अपना" : "Track Your"}
                </span>{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  {isHindi ? "आवेदन" : "Application"}
                </span>
              </motion.h1>

              <p className="text-xl text-gray-700 mb-10 max-w-2xl">
                {isHindi
                  ? "अब घर बैठे अपने आवेदन की स्थिति तुरंत जानें"
                  : "Check your application status instantly from home"}
                <br />
                {isHindi ? "अपना आवेदन आईडी दर्ज करें" : "Enter your Application ID below"}
              </p>

              {/* Search Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-8 border border-orange-100"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-5 text-orange-600" size={24} />
                    <input
                      type="text"
                      value={applicationIdInput}
                      onChange={(e) => setApplicationIdInput(e.target.value.toUpperCase())}
                      onKeyDown={handleKeyPress}
                      placeholder={isHindi ? "उदाहरण: BPXXXX" : "e.g. BPXXXX"}
                      className="w-full pl-14 pr-6 py-5 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-medium"
                    />
                  </div>
                  <button
                    onClick={handleApplicationIdSearch}
                    disabled={isLoading || !applicationIdInput.trim()}
                    className="px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        {isHindi ? "खोज रहे हैं..." : "Searching..."}
                      </>
                    ) : (
                      <>
                        <Search size={22} />
                        {isHindi ? "ट्रैक करें" : "Track Now"}
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-5 p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 flex items-center gap-3"
                    >
                      <XCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right Side - Image Slider */}
            <div className="relative h-96 lg:h-full overflow-hidden rounded-2xl shadow-2xl">
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`Jan Samadhan - Image ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === currentImageIndex ? "bg-orange-600 w-10" : "bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Hardcoded Beautiful Text */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-orange-700 mb-12">
            {isHindi ? "जन समाधान की प्रमुख विशेषताएँ" : "Key Features of Jan Samadhan"}
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: isHindi ? "रीयल-टाइम अपडेट" : "Real-Time Updates",
                desc: isHindi
                  ? "आवेदन से निस्तारण तक तुरंत स्थिति"
                  : "Instant status from submission to disposal",
              },
              {
                icon: QrCode,
                title: isHindi ? "क्यूआर सत्यापन" : "QR Verification",
                desc: isHindi ? "प्रमाणिकता के लिए सुरक्षित क्यूआर" : "Secure QR code for authenticity",
              },
              {
                icon: Download,
                title: isHindi ? "डिजिटल दस्तावेज़" : "Digital Documents",
                desc: isHindi
                  ? "आधिकारिक पत्र डाउनलोड करें"
                  : "Download official letters & orders",
              },
              {
                icon: Shield,
                title: isHindi ? "पूर्णतः सुरक्षित" : "100% Secure",
                desc: isHindi
                  ? "सरकारी मानक अनुसार एन्क्रिप्टेड"
                  : "Encrypted as per government standards",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-b from-orange-50 to-white p-8 rounded-2xl shadow-xl border border-orange-100"
              >
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <f.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-orange-800 text-white py-4 text-center">
        <p className="text-lg font-medium">
          © 2025 जन समाधान - लोक शिकायत निवारण प्रणाली | भारत सरकार
        </p>
        <p className="text-sm mt-2 opacity-90">
          Department of Administrative Reforms and Public Grievances
        </p>
      </footer>

      {/* Modal */}
      <ApplicationResultModal
        isOpen={!!foundApplication}
        application={foundApplication}
        qrCodeUrl={qrCodeUrl}
        onClose={closeModal}
      />
    </div>
  );
};

export default UserDashboard;