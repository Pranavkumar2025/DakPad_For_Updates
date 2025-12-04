// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Shield,
  QrCode,
  Download,
  Clock,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import UserNavbar from "../components/UserNavbar";
import ApplicationResultModal from "../components/ApplicationResultModal";
import api from "../utils/api";
import QRCode from "qrcode";

// Import Images (kept exactly as original)
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

  // Auto slide every 4 seconds (unchanged)
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
        color: { dark: "#0f4a91", light: "#FFFFFF" },
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <UserNavbar />

      {/* Official Government Header Strip */}
      
      <div className="bg-[#0f4a91] text-white py-4 border-b-4 border-[#ff9933]">
  <div className="container mx-auto px-4">

    {/* Desktop: Left + Right + Center Badge */}
    <div className="hidden md:flex items-center justify-between relative">

      <div className="flex items-center gap-3 text-sm">
        <div className="w-9 h-9 bg-[#ff9933] rounded-full flex items-center justify-center font-bold text-[#0f4a91] text-lg">
          IN
        </div>
        <div className="leading-tight">
          <div className="font-bold text-base">भारत सरकार</div>
          <div className="text-xs opacity-90">जन समाधान पोर्टल</div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-white/20 px-5 py-1.5 rounded-full text-xs font-semibold border border-white/30">
        <Shield size={15} className="text-green-300" />
        सुरक्षित पोर्टल
      </div>

      <div className="flex items-center gap-3 text-sm text-right leading-tight">
        <div>
          <div className="font-bold text-base">Government of India</div>
          <div className="text-xs opacity-90">Jan Samadhan Portal</div>
        </div>
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-bold text-[#0f4a91]">
          GOI
        </div>
      </div>
    </div>

    {/* Mobile: Only centered badge + small text below */}
    <div className="md:hidden flex flex-col items-center gap-1">
      <div className="flex items-center gap-2.5 bg-white/20 px-5 py-1.5 rounded-full text-xs font-semibold border border-white/30">
        <Shield size={15} className="text-green-300" />
        सुरक्षित पोर्टल
      </div>
      <div className="text-xs opacity-90">भारत सरकार | Government of India</div>
    </div>

  </div>
</div>


      
      {/* Main Hero Section */}
      <section className="bg-gradient-to-b from-[#fff8f0] to-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0f4a91] leading-tight mb-6">
                {isHindi ? "अपने आवेदन की स्थिति" : "Track Your Application Status"}
                <br />
                <span className="text-[#ff9933]">
                  {isHindi ? "ट्रैक करें" : "Instantly & Securely"}
                </span>
              </h1>

              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {isHindi
                  ? "अब घर बैठे अपने जन समाधान आवेदन की वर्तमान स्थिति, समयरेखा एवं आधिकारिक दस्तावेज़ देखें।"
                  : "Check real-time status, timeline, and download official documents of your Jan Samadhan application from anywhere."}
              </p>

              {/* Search Card */}
              <div className="bg-white border-2 border-[#ff9933]/30 rounded-lg shadow-xl p-8">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  {isHindi ? "आवेदन संख्या दर्ज करें" : "Enter Application ID"}
                </label>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-4 text-[#0f4a91]" size={22} />
                    <input
                      type="text"
                      value={applicationIdInput}
                      onChange={(e) => setApplicationIdInput(e.target.value.toUpperCase())}
                      onKeyDown={handleKeyPress}
                      placeholder={isHindi ? "उदाहरण: BP2025001234" : "e.g. BP2025001234"}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-md focus:border-[#ff9933] focus:outline-none text-lg uppercase tracking-wider"
                    />
                  </div>

                  <button
                    onClick={handleApplicationIdSearch}
                    disabled={isLoading || !applicationIdInput.trim()}
                    className="px-8 py-4 bg-[#0f4a91] hover:bg-[#1e40af] disabled:bg-gray-400 text-white font-bold rounded-md transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {isHindi ? "खोज रहे हैं..." : "Searching..."}
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        {isHindi ? "ट्रैक करें" : "Track Application"}
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
                      className="mt-5 p-4 bg-red-50 border border-red-300 rounded-md text-red-700 flex items-center gap-3"
                    >
                      <XCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <strong>{isHindi ? "नोट:" : "Note:"}</strong>{" "}
                {isHindi
                  ? "आवेदन संख्या आपके रसीद/SMS में दी गई है।"
                  : "Application ID is mentioned on your acknowledgment receipt/SMS."}
              </div>
            </div>

            {/* Right: Image Slider (Unchanged) */}
            <div className="relative h-96 lg:h-full overflow-hidden rounded-lg shadow-2xl border-4 border-white">
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
                    className={`w-3 h-3 rounded-full transition-all ${i === currentImageIndex ? "bg-[#ff9933] w-10" : "bg-white/70"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 ">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f4a91] mb-12">
            {isHindi ? "जन समाधान पोर्टल की विशेषताएँ" : "Features of Jan Samadhan Portal"}
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: isHindi ? "रीयल-टाइम ट्रैकिंग" : "Real-Time Tracking",
                desc: isHindi
                  ? "आवेदन की हर स्थिति का तुरंत अपडेट"
                  : "Get instant updates on every stage of your application",
              },
              {
                icon: QrCode,
                title: isHindi ? "क्यूआर कोड सत्यापन" : "QR Code Verification",
                desc: isHindi
                  ? "दस्तावेज़ की प्रामाणिकता की जाँच करें"
                  : "Verify authenticity of documents via QR code",
              },
              {
                icon: Download,
                title: isHindi ? "डिजिटल दस्तावेज़" : "Digital Documents",
                desc: isHindi
                  ? "आधिकारिक पत्र एवं आदेश डाउनलोड करें"
                  : "Download official letters and disposal orders",
              },
              {
                icon: Shield,
                title: isHindi ? "पूर्णतः सुरक्षित" : "Fully Secure",
                desc: isHindi
                  ? "सरकारी मानकों के अनुसार डेटा संरक्षण"
                  : "Data protected as per Government of India standards",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-[#ff9933] text-white rounded-full flex items-center justify-center mx-auto mb-5">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#0f4a91] mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="bg-[#0f4a91] text-white py-5 border-t-5 border-[#ff9933]">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold">जन समाधान पोर्टल</h3>
            <p className="text-sm opacity-90">
              Jan Samadhan - Public Grievance Redressal System
            </p>
          </div>
          <hr className="border-white/20 my-6 max-w-2xl mx-auto" />
          <p className="text-sm">
            © 2025 | Department of Administrative Reforms and Public Grievances
            <br />
            Ministry of Personnel, Public Grievances and Pensions | Government of India
          </p>
          <p className="text-xs mt-4 opacity-80">
            Developed & Maintained by National Informatics Centre (NIC)
          </p>
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