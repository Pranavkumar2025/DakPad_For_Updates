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
  FileText,
  Building,
  CheckCircle,
  Globe,
  LayoutGrid
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
  };

  return (
    // Body Background with Subtle Dot Pattern
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px]">
      <UserNavbar />

      {/* Hero Section - Dark Corporate Overlay */}
      <section className="relative pt-20 pb-40 overflow-hidden bg-slate-900 border-b border-white/5">
        {/* Abstract Dark Background Image/Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900" />

        {/* Animated Gradient Mesh */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />


        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 backdrop-blur-md text-blue-200 text-xs font-bold uppercase tracking-widest rounded-sm border border-white/10"
              >
                <Shield size={14} className="text-[#ff5010]" />
                {isHindi ? "आधिकारिक जिला पोर्टल" : "Official Govt Portal"}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
              >
                {isHindi ? "जन समाधान" : "Jan Samadhan"}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff5010] to-[#ff8c42]">
                  {isHindi ? "पोर्टल" : "Portal"}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-300/80 max-w-lg leading-relaxed font-light"
              >
                {isHindi
                  ? "डिजिटल भारत की ओर एक कदम। अपनी शिकायतों का निवारण पारदर्शी और समयबद्ध तरीके से पाएं।"
                  : "Empowering citizens with a fully digital, transparent, and responsive grievance redressal system."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <button
                  onClick={() => document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-[#ff5010] hover:bg-[#e6450f] text-white font-bold rounded-sm shadow-xl shadow-orange-900/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {isHindi ? "स्थिति देखें" : "Track Application"}
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/admin-login")}
                  className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-sm border border-white/20 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  <LogIn size={18} />
                  {isHindi ? "प्रशासन लॉगिन" : "Admin Login"}
                </button>
              </motion.div>
            </div>

            {/* Right: Modern Slider with Glass Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video rounded-md overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-slate-900/80"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt="Slide"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-[#ff5010] text-xs font-bold uppercase tracking-widest mb-2">
                  <Activity size={14} className="animate-pulse" /> Live Dashboard
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Digital Governance Initiative</h3>
                <p className="text-slate-400 text-sm mt-1">Connecting Citizens with Administration</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Glass Search Card */}
      <section id="track-section" className="relative z-20 -mt-24 px-4 mb-24">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-100 p-8 md:p-12 relative overflow-hidden"
          >
            {/* Minimal accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#ff5010] rounded-b-full" />

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-3">
                {isHindi ? "आवेदन स्थिति" : "Check Application Status"}
              </h2>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">
                {isHindi
                  ? "अपनी आवेदन आईडी दर्ज करें"
                  : "Official Application Tracking System"}
              </p>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <div
                className={`relative flex items-center transition-all duration-300 ${isInputFocused ? 'scale-[1.02]' : ''
                  }`}
              >
                <Search
                  className={`absolute left-0 transition-colors duration-300 ${isInputFocused ? 'text-[#ff5010]' : 'text-slate-300'
                    }`}
                  size={24}
                />
                <input
                  type="text"
                  value={applicationIdInput}
                  onChange={(e) => setApplicationIdInput(e.target.value.toUpperCase())}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleKeyPress}
                  placeholder={isInputFocused ? "" : (isHindi ? "आवेदन संख्या (उदहारण: BP2025...)" : "Enter Application ID (e.g. BP2025...)")}
                  className="w-full pl-10 pr-36 py-4 bg-transparent border-none outline-none ring-0 focus:ring-0 text-2xl font-medium text-slate-800 uppercase transition-all placeholder:text-slate-300 placeholder:font-normal placeholder:text-2xl"
                />

                <button
                  onClick={handleApplicationIdSearch}
                  disabled={isLoading || !applicationIdInput.trim()}
                  className="absolute right-0 bottom-3 px-8 py-2 bg-[#0f4c8a] hover:bg-[#0a3563] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isHindi ? "खोजें" : "SEARCH")}
                </button>
              </div>

              <div className={`mt-2 text-xs text-slate-400 font-medium transition-opacity duration-300 ${isInputFocused ? 'opacity-100' : 'opacity-0'}`}>
                {isHindi ? "कृपया अपनी पावती रसीद पर दी गई आवेदन संख्या दर्ज करें।" : "Please enter the application number referenced on your acknowledgement receipt."}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-sm text-red-700 text-sm font-medium flex items-center gap-3 shadow-sm"
                  >
                    <XCircle size={18} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Government Features - Official 3-Column Grid */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">
              {isHindi ? "नागरिक सुविधायें" : "Government Services & Assurance"}
            </h2>
            <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Service 1 */}
            <div className="relative p-8 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:border-[#0f4c8a]/20 group-hover:scale-110 transition-all">
                <Clock className="text-[#0f4c8a]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {isHindi ? "समयबद्ध निवारण" : "Time-Bound Disposal"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "प्रत्येक आवेदन की निगरानी की जाती है और समय सीमा के भीतर हल किया जाता है।"
                  : "All applications are strictly monitored and processed within the stipulated timeline mandated by state service acts."}
              </p>
            </div>

            {/* Service 2 */}
            <div className="relative p-8 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:border-[#ff5010]/20 group-hover:scale-110 transition-all">
                <QrCode className="text-[#ff5010]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {isHindi ? "डिजिटल सत्यापन" : "Digital Verification"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "QR कोड सक्षम प्रमाण पत्र, जिसे कहीं भी और कभी भी सत्यापित किया जा सकता है।"
                  : "Encrypted QR Code integration on all issued documents ensures instant authenticity verification globally."}
              </p>
            </div>

            {/* Service 3 */}
            <div className="relative p-8 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:border-emerald-500/20 group-hover:scale-110 transition-all">
                <Shield className="text-emerald-700" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {isHindi ? "डेटा सुरक्षा" : "Secure Infrastructure"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isHindi
                  ? "आपका डेटा एन्क्रिप्शन के उच्चतम मानकों के साथ सुरक्षित है।"
                  : "Hosted on secure government servers with end-to-end encryption to protect citizen's sensitive information."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Assurance - Satyamev Jayate / Official Charter Style */}
      <section className="py-24 bg-[#1e293b] text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <div className="inline-block mb-8">
            <Shield size={48} className="text-[#bf9b30] mx-auto mb-4 opacity-90" strokeWidth={1} />
            <h3 className="text-xs font-bold tracking-[0.3em] text-[#bf9b30] uppercase">
              {isHindi ? "सत्यमेव जयते" : "Satyamev Jayate"}
            </h3>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8 leading-tight">
            {isHindi
              ? "पारदर्शिता। जवाबदेही। सुशासन।"
              : "Transparency. Accountability. Governance."}
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light mb-12">
            {isHindi
              ? "जिला प्रशासन नागरिकों को त्वरित और निष्पक्ष सेवाएं प्रदान करने के लिए प्रतिबद्ध है।"
              : "The District Administration is committed to providing prompt, fair, and transparent services to every citizen, ensuring that governance reaches the last mile."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-12">
            <div className="p-4">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Digital Process</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Accessibility</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white mb-1">ISO</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Standard Security</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white mb-1">Zero</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Hidden Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional Government Standard */}
      <footer className="bg-slate-900 border-t-4 border-[#ff5010] text-slate-300 pt-16 pb-8 text-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">

            {/* Column 1: Identity */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight uppercase tracking-wider">Jan Samadhan</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">District Unit</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm max-w-sm mt-4">
                Designed to bridge the gap between administration and citizens through technology.
                Ensuring every grievance is heard, tracked, and resolved.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Quick Access</h4>
              <ul className="space-y-3">
                <li><a onClick={() => document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#ff5010] cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={14} /> Track Application</a></li>
                <li><a onClick={() => navigate("/admin-login")} className="hover:text-[#ff5010] cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={14} /> Department Login</a></li>
                <li><a href="#" className="hover:text-[#ff5010] cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={14} /> Citizen Charter</a></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Building size={16} className="mt-0.5 text-slate-500" />
                  <span>Collectorate, Main Building,<br />Ara, Bhojpur - 802301</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe size={16} className="text-slate-500" />
                  <span>https://bhojpur.nic.in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} District Administration, Bhojpur. All Rights Reserved.
            </div>

            <div className="flex items-center gap-2">
              <span>Technical Partner</span>
              <span className="font-bold text-slate-200">NIC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Result Modal */}
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