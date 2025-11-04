import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ---------- Middleware ----------
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ---------- Multer (PDF only, 5 MB) ----------
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniq = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniq}${path.extname(file.originalname)}`);
  },
});
const fileFilter = (_, file, cb) =>
  file.mimetype === "application/pdf"
    ? cb(null, true)
    : cb(new Error("Only PDF files are allowed"), false);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

app.use("/uploads", express.static(uploadDir));

// ---------- Helper: default "Application Received" entry ----------
const receivedEntry = (date, block, pdfPath) => ({
  section: "Application Received",
  comment: `Received at ${block || "N/A"} on ${new Date(date).toLocaleDateString("en-GB")}`,
  date: new Date(date).toLocaleDateString("en-GB"),
  pdfLink: pdfPath,
  department: "N/A",
  officer: "N/A",
});

// ---------- POST /api/applications ----------
app.post("/api/applications", upload.single("attachment"), async (req, res) => {
  try {
    const {
      applicantId,
      name: applicant,
      applicationDate,
      phone,
      email,
      source,
      subject,
      block,
    } = req.body;

    // ---- validation (same as before) ----
    const errors = {};
    if (!applicant?.trim()) errors.applicant = "Name required";
    if (!applicationDate) errors.applicationDate = "Date required";
    if (!/^\d{10}$/.test(phone)) errors.phone = "10-digit phone";
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email";
    if (!source) errors.source = "Select source";
    if (!subject?.trim()) errors.subject = "Subject required";
    if (!block) errors.block = "Select block";
    if (!req.file) errors.attachment = "Upload PDF";

    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const existing = await prisma.application.findUnique({ where: { applicantId } });
    if (existing) return res.status(409).json({ message: "ID already exists" });

    const pdfPath = `/uploads/${req.file.filename}`;

    // FIRST TIMELINE ENTRY
    const receivedEntry = {
      section: "Application Received",
      comment: `Received at ${block} on ${new Date(applicationDate).toLocaleDateString("en-GB")}`,
      date: new Date(applicationDate).toLocaleDateString("en-GB"),
      pdfLink: pdfPath,
      department: "N/A",
      officer: "N/A",
    };

    await prisma.application.create({
      data: {
        applicantId,
        applicant,
        applicationDate: new Date(applicationDate),
        phoneNumber: phone,
        emailId: email,
        sourceAt: source,
        subject,
        block,
        attachment: pdfPath,
        status: "Not Assigned Yet",
        concernedOfficer: "N/A",
        timeline: [receivedEntry],   // ← THIS LINE ADDS THE FIRST ENTRY
      },
    });

    res.status(201).json({ success: true, applicantId, message: "Saved" });
  } catch (err) {
    console.error("POST /applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- GET /api/applications ----------
app.get("/api/applications", async (req, res) => {
  try {
    const apps = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    res.json(apps);
  } catch (err) {
    console.error("GET /applications:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// ---------- GET /api/applications/:id ----------
app.get("/api/applications/:id", async (req, res) => {
  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: req.params.id },
    });
    if (!app) return res.status(404).json({ error: "Not found" });
    res.json(app);
  } catch (err) {
    console.error("GET /:id:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// ---------- PATCH /api/applications/:id/assign ----------
app.patch("/api/applications/:id/assign", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { concernedOfficer, status = "In Process", note, department } = req.body;

  if (!concernedOfficer) return res.status(400).json({ error: "Officer required" });

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true }, // we only need the old attachment
    });
    if (!app) return res.status(404).json({ error: "Not found" });

    const newEntry = {
      section: `Assigned to ${concernedOfficer}`,
      comment: note || `Assigned to ${concernedOfficer}`,
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
        timeline: { push: newEntry }, // <-- **APPENDS**
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /assign:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// ---------- PATCH /api/applications/:id/compliance ----------
app.patch("/api/applications/:id/compliance", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });
    if (!app) return res.status(404).json({ error: "Not found" });

    const newEntry = {
      section: "Compliance",
      comment: note || "Compliance achieved",
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
    console.error("PATCH /compliance:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// ---------- PATCH /api/applications/:id/dispose ----------
app.patch("/api/applications/:id/dispose", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { concernedOfficer: true, attachment: true },
    });
    if (!app) return res.status(404).json({ error: "Not found" });

    const newEntry = {
      section: "Disposed",
      comment: note || "Application disposed",
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
    console.error("PATCH /dispose:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// ---------- Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));