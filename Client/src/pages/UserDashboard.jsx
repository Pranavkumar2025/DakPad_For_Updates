// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Shield,
  QrCode,
  Clock,
  XCircle,
  ArrowRight,
  LogIn,
  ChevronRight,
  Activity,
  Building,
  Globe,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import UserNavbar from "../components/UserNavbar";
import ApplicationResultModal from "../components/ApplicationResultModal";
import api from "../utils/api";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [foundApplication, setFoundApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
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
        color: { dark: "#0f4c8a", light: "#FFFFFF" },
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
    setApplicationIdInput("");
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-slate-200 selection:text-slate-900">
      <UserNavbar />

      {/* Hero Section - Minimal Enterprise */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Column: Text & Call to Action */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider rounded-sm mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                Official District Portal
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                {isHindi ? "जन समाधान" : "Jan Samadhan"}
                <span className="block text-slate-500 font-medium text-2xl lg:text-4xl mt-2">
                  {isHindi ? "ई-गवर्नेंस पहल" : "e-Governance Initiative"}
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                {isHindi
                  ? "पारदर्शी, जवाबदेह और उत्तरदायी प्रशासन के लिए एक एकीकृत डिजिटल मंच।"
                  : "Bridging the gap between citizens and administration with a fully digital, transparent grievance redressal system."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  {isHindi ? "आवेदन ट्रैक करें" : "Track Application"}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin-login")}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-sm border border-slate-300 transition-colors flex items-center gap-2"
                >
                  <LogIn size={16} className="text-slate-500" />
                  {isHindi ? "विभागीय लॉगिन" : "Department Login"}
                </button>
              </div>

              <div className="mt-10 flex items-center gap-8 text-sm text-slate-500 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-slate-400" />
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" />
                  <span>24/7 Digital Access</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Image Frame */}
            <div className="hidden lg:block">
              <div className="relative aspect-[4/3] bg-slate-100 border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt="District Administration"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>

                {/* Minimal Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 p-4 backdrop-blur-md border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="logo" className="w-8 h-8 opacity-90" />
                    <div>
                      <p className="text-white text-sm font-semibold tracking-wide">District Administration</p>
                      <p className="text-slate-400 text-xs">Official Portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search / Tracking Section - Clean & Functional */}
      <section id="search-section" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
              {isHindi ? "आवेदन की स्थिति जांचें" : "Check Application Status"}
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your unique application reference ID to track real-time progress.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className={`flex items-center bg-white border rounded-sm transition-all focus-within:ring-1 focus-within:ring-slate-400 ${isInputFocused ? 'border-slate-800 ring-1 ring-slate-400' : 'border-slate-300'}`}>
              <div className="pl-4 text-slate-500">
                <Search size={18} />
              </div>

              <input
                type="text"
                value={applicationIdInput}
                onChange={(e) => setApplicationIdInput(e.target.value.toUpperCase())}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleKeyPress}
                placeholder={isHindi ? "आवेदन संख्या (उदा: BP2025...)" : "Enter Application ID (e.g. BP2025...)"}
                className="w-full px-4 py-3 bg-transparent border-none outline-none text-base text-slate-800 placeholder:text-slate-400 uppercase tracking-wide font-mono"
              />

              <div className="p-1">
                <button
                  onClick={handleApplicationIdSearch}
                  disabled={isLoading || !applicationIdInput.trim()}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={14} /> : (isHindi ? "खोजें" : "TRACK")}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center h-6">
              {error && (
                <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-medium">
                  <XCircle size={14} /> {error}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Minimal Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-12 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {isHindi ? "नागरिक केंद्रित सेवाएं" : "Citizen Centric Services"}
            </h2>
            <p className="text-slate-500 text-sm">
              Empowering citizens with technology-driven governance solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-sm border border-slate-200 bg-white hover:border-slate-800/20 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-colors duration-300">
                <Clock size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3 group-hover:text-black transition-colors">
                {isHindi ? "समयबद्ध निपटान" : "Time-Bound Disposal"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                {isHindi
                  ? "सेवा के अधिकार अधिनियम के तहत निर्धारित समय सीमा के भीतर शिकायतों का निवारण।"
                  : "Mandatory disposal of grievances within the stipulated time frame as per the Right to Service Act protocols."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-sm border border-slate-200 bg-white hover:border-slate-800/20 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-colors duration-300">
                <QrCode size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3 group-hover:text-black transition-colors">
                {isHindi ? "डिजिटल सत्यापन" : "Digital Verification"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                {isHindi
                  ? "प्रत्येक दस्तावेज और रसीद पर क्यूआर कोड के माध्यम से तत्काल प्रमाणिकता की जांच।"
                  : "Instant verification of authenticity via secure encrypted QR codes embedded on every document generated."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-sm border border-slate-200 bg-white hover:border-slate-800/20 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-colors duration-300">
                <Shield size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3 group-hover:text-black transition-colors">
                {isHindi ? "सुरक्षित एवं गोपनीय" : "Secure & Confidential"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                {isHindi
                  ? "आपकी व्यक्तिगत जानकारी और शिकायत डेटा पूर्णतः सुरक्षित और एन्क्रिप्टेड है।"
                  : "State-of-the-art encryption ensures that your personal data and grievance details remain confidential and secure."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional Government Standard */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t-2 border-slate-800">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-10 mb-12">

            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <img src="/logo.svg" alt="Jan Samadhan Logo" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight uppercase tracking-wide">Jan Samadhan</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">District Administration</p>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-xs max-w-sm">
                Designed to bridge the gap between administration and citizens through technology.
                Ensuring every grievance is heard, tracked, and resolved with transparency.
              </p>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Quick Access</h4>
              <ul className="space-y-3 text-xs">
                <li><a onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors">Track Application</a></li>
                <li><a onClick={() => navigate("/admin-login")} className="hover:text-white cursor-pointer transition-colors">Department Login</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer transition-colors">Citizen Charter</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Contact</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2">
                  <Building size={14} className="mt-0.5 text-slate-600" />
                  <span>Collectorate, Main Building,<br />Ara, Bhojpur - 802301</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe size={14} className="text-slate-600" />
                  <a href="https://bhojpur.nic.in" className="hover:text-white transition-colors">bhojpur.nic.in</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            <div>
              &copy; {new Date().getFullYear()} District Administration, Bhojpur. All Rights Reserved.
            </div>

            <div className="flex items-center gap-2">
              <span>Technical Partner</span>
              <span className="font-bold text-slate-500">NIC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Result Modal - Keeping existing logic, just ensuring it renders */}
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