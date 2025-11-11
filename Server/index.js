// server/index.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ---------- Middleware ----------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://dak-pad-for-updates.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

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

// ---------- JWT Config ----------
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

const setTokenCookie = (res, name, token, maxAgeSeconds) => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAgeSeconds * 1000,
  });
};

const generateTokens = (admin) => {
  const payload = { adminId: admin.adminId, role: admin.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

// ==================== PROTECTED MIDDLEWARE (MUST BE BEFORE ROUTES) ====================
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token expired" });
    req.user = user;
    next();
  });
};

// ==================== AUTH CHECK ROUTE (for ProtectedRoute) ====================
app.get("/api/admin/auth-check", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ==================== PROTECT ALL APPLICATION ROUTES ====================
app.use("/api/applications", authenticateToken);

// ---------- Helper: default "Application Received" entry ----------
const receivedEntry = (date, block, pdfPath) => ({
  section: "Application Received",
  comment: `Received at ${block || "N/A"} on ${new Date(date).toLocaleDateString("en-GB")}`,
  date: new Date(date).toLocaleDateString("en-GB"),
  pdfLink: pdfPath,
  department: "N/A",
  officer: "N/A",
});

// ==================== APPLICATION ROUTES ====================

// POST /api/applications
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
    const entry = receivedEntry(applicationDate, block, pdfPath);

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
        timeline: [entry],
      },
    });

    res.status(201).json({ success: true, applicantId, message: "Saved" });
  } catch (err) {
    console.error("POST /applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/application
app.get("/api/applications", async (req, res) => {
  try {
    const apps = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    res.json(apps);
  } catch (err) {
    console.error("GET /applications:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// GET /api/applications/:id
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

// PATCH /api/applications/:id/assign
app.patch("/api/applications/:id/assign", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { concernedOfficer, status = "In Process", note, department } = req.body;

  if (!concernedOfficer) return res.status(400).json({ error: "Officer required" });

  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true },
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
        timeline: { push: newEntry },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /assign:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /api/applications/:id/compliance
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

// PATCH /api/applications/:id/dispose
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

// ==================== ADMIN LOGIN ====================
app.post("/api/admin/login", async (req, res) => {
  const { adminId, password } = req.body;

  if (!adminId || !password) {
    return res.status(400).json({ error: "adminId and password required" });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { adminId } });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(admin);

    setTokenCookie(res, "access_token", accessToken, 15 * 60);
    setTokenCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60);

    await prisma.admin.update({
      where: { adminId },
      data: { refreshToken },
    });

    const routeMap = {
      admin: "/Admin",
      superadmin: "/SuperAdmin",
      workassigned: "/work-assigned",
      receive: "/application-receive",
    };

    res.json({ success: true, redirect: routeMap[admin.role] || "/Admin" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== REFRESH TOKEN ====================
app.post("/api/admin/refresh", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const admin = await prisma.admin.findUnique({ where: { adminId: decoded.adminId } });

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const { accessToken } = generateTokens(admin);
    setTokenCookie(res, "access_token", accessToken, 15 * 60);

    res.json({ success: true });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// ==================== LOGOUT ====================
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ success: true });
});

// ---------- Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));