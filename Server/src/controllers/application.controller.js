import prisma from "../prisma/client.js";
import { receivedEntry } from "../utils/timeline.utils.js";
import { uploadPdfToCloudinary } from "../config/multer.config.js";

// ==================== CREATE APPLICATION (Original PDF Saved Forever) ====================
export const createApplication = async (req, res) => {
  try {
    const {
      applicantId,
      name: applicant,
      applicationDate,
      phone = "",
      email = "",
      source,
      subject,
      block,
    } = req.body;

    const errors = {};

    if (!applicant?.trim()) errors.applicant = "Name is required";
    if (!applicationDate) errors.applicationDate = "Application date is required";
    if (!source) errors.source = "Source is required";
    if (!subject?.trim()) errors.subject = "Subject is required";
    if (!block) errors.block = "Block is required";

    if (phone && !/^\d{10}$/.test(phone)) errors.phone = "Phone must be exactly 10 digits";
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) errors.email = "Invalid email format";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await prisma.application.findUnique({
      where: { applicantId },
    });
    if (existing) {
      return res.status(409).json({ message: "Applicant ID already exists" });
    }

    let originalPdfUrl = null;
    let originalPdfPublicId = null;

    if (req.file) {
      try {
        const result = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
        originalPdfUrl = result.secure_url;
        originalPdfPublicId = result.public_id;
        // console.log("ORIGINAL PDF SAVED:", originalPdfUrl);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ error: "Failed to upload PDF" });
      }
    }

    const timelineEntry = receivedEntry(applicationDate, block, originalPdfUrl);

    await prisma.application.create({
      data: {
        applicantId,
        applicant: applicant.trim(),
        applicationDate: new Date(applicationDate),
        phoneNumber: phone || null,
        emailId: email || null,
        sourceAt: source,
        subject: subject.trim(),
        block,
        // ORIGINAL PDF — NEVER CHANGES
        attachment: originalPdfUrl,
        attachmentPublicId: originalPdfPublicId,
        status: "Not Assigned Yet",
        concernedOfficer: "N/A",
        timeline: [timelineEntry],
      },
    });

    res.status(201).json({
      success: true,
      applicantId,
      message: "Application created successfully",
    });
  } catch (err) {
    console.error("CREATE APPLICATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== HELPER: Upload New PDF (Only for Timeline) ====================
const handleFileUpload = async (req) => {
  if (!req.file) return { pdfUrl: null, pdfPublicId: null };

  try {
    const result = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
    return {
      pdfUrl: result.secure_url,
      pdfPublicId: result.public_id,
    };
  } catch (err) {
    throw new Error("PDF upload failed");
  }
};

// ==================== ASSIGN APPLICATION (DO NOT TOUCH attachment!) ====================
export const assignApplication = async (req, res) => {
  const { id } = req.params;
  const {
    concernedOfficer,
    status = "In Process",
    note,
    department,
    supervisor,
    supervisorDepartment,
  } = req.body;

  if (!concernedOfficer?.trim()) return res.status(400).json({ error: "Concerned officer is required" });

  try {
    const existing = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true, attachmentPublicId: true }, // We keep original
    });

    if (!existing) return res.status(404).json({ error: "Application not found" });

    const { pdfUrl, pdfPublicId } = await handleFileUpload(req);

    let comment = note?.trim() || `Assigned to ${concernedOfficer}`;
    if (supervisor?.trim()) comment += ` under supervision of ${supervisor}`;

    const newTimelineEntry = {
      section: `Assigned to ${concernedOfficer}`,
      comment,
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: pdfUrl, // ← New PDF goes only here
      department: department || "N/A",
      officer: concernedOfficer.trim(),
      supervisor: supervisor?.trim() || "N/A",
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        concernedOfficer: concernedOfficer.trim(),
        department: department || undefined,
        status,
        supervisor: supervisor?.trim() || "",
        supervisorDepartment: supervisorDepartment?.trim() || "",
        // DO NOT UPDATE attachment & attachmentPublicId — ORIGINAL PDF STAYS!
        timeline: { push: newTimelineEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("ASSIGN ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to assign" });
  }
};

// ==================== COMPLIANCE & DISPOSE (Same Rule) ====================
export const complianceApplication = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

    const { pdfUrl } = await handleFileUpload(req);

    const newEntry = {
      section: "Compliance",
      comment: note?.trim() || "Compliance achieved",
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: pdfUrl, // ← Only in timeline
      department: app.concernedOfficer || "N/A",
      officer: app.concernedOfficer || "N/A",
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        status: "Compliance",
        timeline: { push: newEntry },
        // attachment NEVER changes
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("COMPLIANCE ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to update" });
  }
};

export const disposeApplication = async (req, res) => {
  const { id } = req.params;
  const { note, date } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

    // Format date from YYYY-MM-DD to DD/MM/YYYY if provided
    let formattedDate = new Date().toLocaleDateString("en-GB");
    if (date) {
      const parts = date.split("-");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const { pdfUrl } = await handleFileUpload(req);

    const newEntry = {
      section: "Disposed",
      comment: note?.trim() || "Application disposed",
      date: formattedDate,
      pdfLink: pdfUrl, // ← Only in timeline
      department: app.concernedOfficer || "N/A",
      officer: app.concernedOfficer || "N/A",
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        status: "Disposed",
        timeline: { push: newEntry },
        // attachment NEVER changes
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("DISPOSE ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to dispose" });
  }
};

// ==================== GET ROUTES (Unchanged) ====================
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({ where: { applicantId: id } });
    if (!application) return res.status(404).json({ error: "Not found" });
    res.json(application);
  } catch (err) {
    console.error("GET BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const trackApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({
      where: { applicantId: id },
      select: {
        applicantId: true,
        applicant: true,
        applicationDate: true,
        subject: true,
        block: true,
        attachment: true,
        timeline: true,
        concernedOfficer: true,
        status: true,
      },
    });
    if (!application) return res.status(404).json({ error: "Not found" });
    res.json(application);
  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};