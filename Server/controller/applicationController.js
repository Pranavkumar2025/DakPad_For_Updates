import express from "express";
import { PrismaClient } from "@prisma/client";
import { upload, uploadNone } from "../Middleware/multerConfig.js";
import { createReceivedEntry } from "../utils/timelineEntry.js";
import { authenticateToken } from "../Middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Public: Track application by applicantId
router.get("/track/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({
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

    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json(app);
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new application (form-data, no file required)
router.post("/", uploadNone.single(""), async (req, res) => {
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
      attachment, // optional filename from frontend
    } = req.body;

    const errors = {};

    if (!applicant?.trim()) errors.applicant = "Name required";
    if (!applicationDate) errors.applicationDate = "Date required";
    if (!source) errors.source = "Select source";
    if (!subject?.trim()) errors.subject = "Subject required";
    if (!block) errors.block = "Select block";

    if (phone && !/^\d{10}$/.test(phone)) errors.phone = "10-digit phone required";
    if (email && !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await prisma.application.findUnique({
      where: { applicantId },
    });
    if (existing) {
      return res.status(409).json({ message: "ID already exists" });
    }

    const pdfPath = attachment ? `/uploads/${attachment}` : null;
    const entry = createReceivedEntry(applicationDate, block, pdfPath);

    await prisma.application.create({
      data: {
        applicantId,
        applicant,
        applicationDate: new Date(applicationDate),
        phoneNumber: phone || null,
        emailId: email || null,
        sourceAt: source,
        subject,
        block,
        attachment: pdfPath,
        status: "Not Assigned Yet",
        concernedOfficer: "N/A",
        timeline: [entry],
      },
    });

    res.status(201).json({
      success: true,
      applicantId,
      message: "Application saved successfully",
    });
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all applications (Admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(apps);
  } catch (err) {
    console.error("Get all applications error:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Get single application by ID (Public + Admin)
router.get("/:id", async (req, res) => {
  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: req.params.id },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json(app);
  } catch (err) {
    console.error("Get application by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign Officer
router.patch("/:id/assign", authenticateToken, upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { concernedOfficer, status = "In Process", note, department } = req.body;

  if (!concernedOfficer?.trim()) {
    return res.status(400).json({ error: "Officer name is required" });
  }

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

    const newEntry = {
      section: `Assigned to ${concernedOfficer}`,
      comment: note?.trim() || `Assigned to ${concernedOfficer}`,
      date: new Date().toLocaleDateString("en-GB"),
      pdfLink: req.file ? `/uploads/${req.file.filename}` : null,
      department: department || "N/A",
      officer: concernedOfficer,
    };

    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        concernedOfficer,
        status,
        attachment: req.file ? `/uploads/${req.file.filename}` : app.attachment,
        timeline: { push: newEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Assign officer error:", err);
    res.status(500).json({ error: "Failed to assign officer" });
  }
});

// Compliance Update
router.patch("/:id/compliance", authenticateToken, upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

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
    console.error("Compliance update error:", err);
    res.status(500).json({ error: "Failed to update compliance" });
  }
});

// Dispose Application
router.patch("/:id/dispose", authenticateToken, upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

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
    console.error("Dispose error:", err);
    res.status(500).json({ error: "Failed to dispose application" });
  }
});

export default router;