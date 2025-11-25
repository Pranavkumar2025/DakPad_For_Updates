import prisma from "../prisma/client.js";
import { upload } from "../config/multer.config.js";
import { receivedEntry } from "../utils/timeline.utils.js";

// ==================== CREATE APPLICATION (Admin - No File Upload) ====================
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
      attachment, 
    } = req.body;

    const errors = {};

    if (!applicant?.trim()) errors.applicant = "Name is required";
    if (!applicationDate) errors.applicationDate = "Application date is required";
    if (!source) errors.source = "Source is required";
    if (!subject?.trim()) errors.subject = "Subject is required";
    if (!block) errors.block = "Block is required";

    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone = "Phone must be exactly 10 digits";
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }


    const existing = await prisma.application.findUnique({
      where: { applicantId },
    });
    if (existing) {
      return res.status(409).json({ message: "Applicant ID already exists" });
    }

    const pdfPath = attachment ? `/uploads/${attachment}` : null;
    const timelineEntry = receivedEntry(applicationDate, block, pdfPath);

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
        attachment: pdfPath,
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

// ==================== GET ALL APPLICATIONS (Admin/Supervisor) ====================
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (err) {
    console.error("GET ALL APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// ==================== GET SINGLE APPLICATION BY ID (Public + Protected) ====================
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { applicantId: id },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    console.error("GET APPLICATION BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== PUBLIC TRACK APPLICATION (No Auth Required) ====================
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

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    console.error("TRACK APPLICATION ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ==================== ASSIGN APPLICATION (Admin/Supervisor) ====================
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

  if (!concernedOfficer?.trim()) {
    return res.status(400).json({ error: "Concerned officer is required" });
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    let comment = note?.trim() || `Assigned to ${concernedOfficer}`;
    if (supervisor?.trim()) {
      comment += ` under supervision of ${supervisor}`;
    }

    const newTimelineEntry = {
      section: `Assigned to ${concernedOfficer}`,
      comment,
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: req.file ? `/uploads/${req.file.filename}` : null,
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
        attachment: req.file ? `/uploads/${req.file.filename}` : existing.attachment,
        timeline: { push: newTimelineEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("ASSIGN APPLICATION ERROR:", err);
    res.status(500).json({ error: "Failed to assign application" });
  }
};

// ==================== MARK AS COMPLIANCE ====================
export const complianceApplication = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const newEntry = {
      section: "Compliance",
      comment: note?.trim() || "Compliance achieved",
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: req.file ? `/uploads/${req.file.filename}` : null,
      department: app.concernedOfficer || "N/A",
      officer: app.concernedOfficer || "N/A",
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        status: "Compliance",
        attachment: req.file ? `/uploads/${req.file.filename}` : app.attachment,
        timeline: { push: newEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("COMPLIANCE UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update compliance" });
  }
};

// ==================== MARK AS DISPOSED ====================
export const disposeApplication = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const newEntry = {
      section: "Disposed",
      comment: note?.trim() || "Application disposed",
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: req.file ? `/uploads/${req.file.filename}` : null,
      department: app.concernedOfficer || "N/A",
      officer: app.concernedOfficer || "N/A",
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        status: "Disposed",
        attachment: req.file ? `/uploads/${req.file.filename}` : app.attachment,
        timeline: { push: newEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("DISPOSE APPLICATION ERROR:", err);
    res.status(500).json({ error: "Failed to dispose application" });
  }
};