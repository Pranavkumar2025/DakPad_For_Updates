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
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <UserNavbar />

      {/* Hero Section - Enterprise Gradient & Clean Layout */}
      <section className="pt-8 pb-16 lg:pt-12 lg:pb-24 overflow-hidden relative bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-12 translate-x-32 -z-10" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Column: Text & Call to Action */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Official District Portal
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                {isHindi ? "जन समाधान" : "Jan Samadhan"}
                <span className="block text-slate-400 font-medium text-3xl lg:text-5xl mt-2">
                  {isHindi ? "ई-गवर्नेंस पहल" : "e-Governance Initiative"}
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg font-light">
                {isHindi
                  ? "पारदर्शी, जवाबदेह और उत्तरदायी प्रशासन के लिए एक एकीकृत डिजिटल मंच।"
                  : "Bridging the gap between citizens and administration with a fully digital, transparent grievance redressal system."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-sm transition-all flex items-center gap-3 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5"
                >
                  {isHindi ? "आवेदन ट्रैक करें" : "Track Application"}
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/admin-login")}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-sm border border-slate-200 transition-all flex items-center gap-3 hover:border-slate-300 hover:shadow-sm"
                >
                  <LogIn size={18} className="text-slate-400" />
                  {isHindi ? "विभागीय लॉगिन" : "Department Login"}
                </button>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm text-slate-500 font-medium border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="p-1 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                    <CheckCircle size={14} className="text-green-700" />
                  </div>
                  <span className="group-hover:text-slate-800 transition-colors">ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Globe size={14} className="text-blue-700" />
                  </div>
                  <span className="group-hover:text-slate-800 transition-colors">24/7 Digital Access</span>
                </div>
              </div>
            </div>

            {/* Right Column: Precise Frame */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] p-2 bg-white border border-slate-200 rounded-lg shadow-2xl shadow-slate-200/50">
                <div className="w-full h-full relative rounded-md overflow-hidden bg-slate-100">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]}
                      alt="District Administration"
                      className="absolute inset-0 w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  </AnimatePresence>

                  {/* Branding Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 pt-20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-sm flex items-center justify-center border border-white/20">
                        <img src="/logo.svg" alt="logo" className="w-6 h-6 opacity-90" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold tracking-wide">District Administration</p>
                        <p className="text-slate-300 text-xs">Official Portal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Abstract decorative pattern */}
              <div className="absolute -z-10 top-6 -right-6 w-24 h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search / Tracking Section - Floating Bar Style */}
      <section id="search-section" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
              {isHindi ? "आवेदन की स्थिति जांचें" : "Check Application Status"}
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Enter your unique application reference ID to track real-time progress.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white p-2 rounded-lg shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className={`relative flex items-center transition-all duration-300 ${isInputFocused ? 'ring-2 ring-blue-500/10' : ''}`}>

              <div className="pl-6 text-slate-400">
                <Search size={20} />
              </div>

              <input
                type="text"
                value={applicationIdInput}
                onChange={(e) => setApplicationIdInput(e.target.value.toUpperCase())}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleKeyPress}
                placeholder={isHindi ? "आवेदन संख्या (उदा: BP2025...)" : "Enter Application ID (e.g. BP2025...)"}
                className="w-full pl-4 pr-4 py-4 bg-transparent border-none outline-none text-lg font-medium text-slate-800 placeholder:text-slate-400 uppercase tracking-wider"
              />

              <div className="pr-2">
                <button
                  onClick={handleApplicationIdSearch}
                  disabled={isLoading || !applicationIdInput.trim()}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-md transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : (isHindi ? "खोजें" : "TRACK")}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center h-8">
            {error && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                <XCircle size={14} /> {error}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid - Professional Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-slate-100 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {isHindi ? "नागरिक केंद्रित सेवाएं" : "Citizen Centric Services"}
              </h2>
              <p className="text-slate-500">
                Empowering citizens with technology-driven governance solutions.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center mb-6 text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                {isHindi ? "समयबद्ध निपटान" : "Time-Bound Disposal"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "सेवा के अधिकार अधिनियम के तहत निर्धारित समय सीमा के भीतर शिकायतों का निवारण।"
                  : "Mandatory disposal of grievances within the stipulated time frame as per the Right to Service Act protocols."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center mb-6 text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-orange-700 transition-colors">
                {isHindi ? "डिजिटल सत्यापन" : "Digital Verification"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "प्रत्येक दस्तावेज और रसीद पर क्यूआर कोड के माध्यम से तत्काल प्रमाणिकता की जांच।"
                  : "Instant verification of authenticity via secure encrypted QR codes embedded on every document generated."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center mb-6 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                {isHindi ? "सुरक्षित एवं गोपनीय" : "Secure & Confidential"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "आपकी व्यक्तिगत जानकारी और शिकायत डेटा पूर्णतः सुरक्षित और एन्क्रिप्टेड है।"
                  : "State-of-the-art encryption ensures that your personal data and grievance details remain confidential and secure."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional Government Standard */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 text-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">

            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                  <img src="/logo.svg" alt="Jan Samadhan Logo" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight uppercase tracking-wider">Jan Samadhan</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">District Administration</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                Designed to bridge the gap between administration and citizens through technology.
                Ensuring every grievance is heard, tracked, and resolved with transparency.
              </p>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Quick Access</h4>
              <ul className="space-y-4">
                <li><a onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">Track Application</a></li>
                <li><a onClick={() => navigate("/admin-login")} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">Department Login</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">Citizen Charter</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Building size={16} className="mt-0.5 text-slate-500" />
                  <span>Collectorate, Main Building,<br />Ara, Bhojpur - 802301</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe size={16} className="text-slate-500" />
                  <a href="https://bhojpur.nic.in" className="hover:text-white transition-colors">bhojpur.nic.in</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} District Administration, Bhojpur. All Rights Reserved.
            </div>

            <div className="flex items-center gap-2">
              <span>Technical Partner</span>
              <span className="font-bold text-slate-300">NIC</span>
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