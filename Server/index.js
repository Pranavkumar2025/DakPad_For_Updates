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
      "http://localhost:5174",
      "https://dak-pad-for-updates.vercel.app",
    ],
    credentials: true,
  })
);
app.options("*", cors());
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
    secure: true,
    sameSite: "none",
    maxAge: maxAgeSeconds * 1000,
  });
};

const generateTokens = (user) => {
  let payload = {};

  if (user.adminId) {
    payload = { adminId: user.adminId, role: user.role || "admin" };
  } else if (user.supervisorId) {
    payload = {
      supervisorId: user.supervisorId,
      name: user.name,
      role: "Supervisor",
      department: user.department,
    };
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

// ==================== PROTECTED MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token expired or invalid" });

    // Allow both admin and supervisor
    if (user.adminId || user.supervisorId) {
      req.user = user;
      next();
    } else {
      res.status(403).json({ error: "Invalid token payload" });
    }
  });
};

// ==================== PUBLIC TRACKING ROUTE (NO AUTH) ====================
app.get("/api/track/:id", async (req, res) => {
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

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    console.error("GET /api/track/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== AUTH CHECK ROUTE (for ProtectedRoute) ====================
app.get("/api/admin/auth-check", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ==================== PROTECT ALL /api/applications EXCEPT PUBLIC GET BY ID ====================
app.use("/api/applications", (req, res, next) => {
  if (req.method === "GET" && req.path.match(/^\/[A-Z0-9]+$/i)) {
    return next();
  }
  authenticateToken(req, res, next);
});

// ---------- Helper: default "Application Received" entry ----------
const receivedEntry = (date, block, pdfPath) => ({
  section: "Application Received",
  comment: `Received at ${block || "N/A"} on ${new Date(date).toLocaleDateString("en-GB")}`,
  date: new Date(date).toLocaleDateString("en-GB"),
  pdfLink: pdfPath,
  department: "N/A",
  officer: "N/A",
});

// ==================== APPLICATION ROUTES (ADMIN ONLY) ====================

// POST /api/applications — PHONE & EMAIL OPTIONAL (MongoDB)
app.post("/api/applications", upload.none(), async (req, res) => {
  try {
    const {
      applicantId,
      name: applicant,
      applicationDate,
      phone = "",        // ← default empty
      email = "",        // ← default empty
      source,
      subject,
      block,
      attachment,
    } = req.body;

    const errors = {};

    // Required fields
    if (!applicant?.trim()) errors.applicant = "Name required";
    if (!applicationDate) errors.applicationDate = "Date required";
    if (!source) errors.source = "Select source";
    if (!subject?.trim()) errors.subject = "Subject required";
    if (!block) errors.block = "Select block";

    // Optional: validate only if provided
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone = "10-digit phone required";
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Valid email required";
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    // ID uniqueness
    const existing = await prisma.application.findUnique({
      where: { applicantId },
    });
    if (existing) return res.status(409).json({ message: "ID already exists" });

    const pdfPath = attachment ? `/uploads/${attachment}` : null;

    const entry = receivedEntry(applicationDate, block, pdfPath);

    await prisma.application.create({
      data: {
        applicantId,
        applicant,
        applicationDate: new Date(applicationDate),
        phoneNumber: phone || null,     // ← null if empty
        emailId: email || null,         // ← null if empty
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
    console.error("POST /applications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/applications (admin list)
app.get("/api/applications", async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(apps);
  } catch (err) {
    console.error("GET /applications:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// GET /api/applications/:id (PUBLIC + ADMIN)
app.get("/api/applications/:id", async (req, res) => {
  try {
    const app = await prisma.application.findUnique({
      where: { applicantId: req.params.id },
    });
    if (!app) return res.status(404).json({ error: "Not found" });
    res.json(app);
  } catch (err) {
    console.error("GET /applications/:id:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// PATCH /api/applications/:id/assign  ← FULLY FIXED FOR SUPERVISOR
app.patch("/api/applications/:id/assign", upload.single("file"), async (req, res) => {
  const { id } = req.params;

  // NOW WE READ ALL FIELDS INCLUDING SUPERVISOR
  const {
    concernedOfficer,
    status = "In Process",
    note,
    department,
    supervisor,           // ← RECEIVED FROM FRONTEND
    supervisorDepartment  // ← RECEIVED FROM FRONTEND
  } = req.body;

  if (!concernedOfficer?.trim()) {
    return res.status(400).json({ error: "Concerned officer is required" });
  }

  try {
    // Fetch current attachment (to preserve if no new file)
    const existing = await prisma.application.findUnique({
      where: { applicantId: id },
      select: { attachment: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Build meaningful comment
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
      officer: concernedOfficer,
      supervisor: supervisor?.trim() || "N/A",  // ← Saved in timeline
    };

    // Update the application
    const updated = await prisma.application.update({
      where: { applicantId: id },
      data: {
        concernedOfficer,
        department: department || undefined,
        status,
        supervisor: supervisor?.trim() || "",                   // ← Saved
        supervisorDepartment: supervisorDepartment?.trim() || "", // ← Saved
        attachment: req.file ? `/uploads/${req.file.filename}` : existing.attachment,
        timeline: {
          push: newTimelineEntry,
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /assign error:", err);
    res.status(500).json({ error: "Failed to assign application" });
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

// ==================== ADMIN PROFILE ROUTES ====================

app.get("/api/admin/profile", authenticateToken, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
      select: {
        adminId: true,
        name: true,
        position: true,
        department: true,
        role: true,
      },
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("GET /api/admin/profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.patch("/api/admin/profile", authenticateToken, async (req, res) => {
  const { name, position, department } = req.body;

  try {
    const updated = await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { name, position, department },
      select: {
        adminId: true,
        name: true,
        position: true,
        department: true,
        role: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/admin/profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.patch("/api/admin/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords required" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
    });

    if (!admin || admin.password !== currentPassword) {
      return res.status(401).json({ error: "Current password incorrect" });
    }

    await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { password: newPassword },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/password error:", err);
    res.status(500).json({ error: "Failed to change password" });
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
  res.clearCookie("access_token", { path: "/", sameSite: "none", secure: true });
  res.clearCookie("refresh_token", { path: "/", sameSite: "none", secure: true });
  res.json({ success: true });
});



// ==================== SUPERVISOR LOGIN ====================
// ==================== SUPERVISOR LOGIN (FIXED) ====================
app.post("/api/supervisor/login", async (req, res) => {
  const { supervisorName, adminId, password } = req.body;

  if (!supervisorName || !adminId || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Find supervisor by supervisorId (which is "SUP001")
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: adminId.toUpperCase() }, // ensure case match
    });

    if (!supervisor) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password (plain text, like admin)
    if (supervisor.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Match selected name with department field
    if (supervisor.department !== supervisorName) {
      return res.status(401).json({ error: "Selected supervisor doesn't match" });
    }

    // Generate tokens
    const payload = {
      supervisorId: supervisor.supervisorId,
      name: supervisor.name,
      role: "Supervisor",
      department: supervisor.department,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Save refresh token to DB
    await prisma.supervisor.update({
      where: { supervisorId: supervisor.supervisorId },
      data: { refreshToken: refreshToken }, // ← was missing this!
    });

    // Set cookies
    setTokenCookie(res, "access_token", accessToken, 15 * 60);
    setTokenCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60);

    res.json({
      success: true,
      supervisor: {
        name: supervisor.name,
        supervisorId: supervisor.supervisorId,
        department: supervisor.department,
      },
    });
  } catch (err) {
    console.error("Supervisor login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==================== SUPERVISOR PROFILE ====================
// 1. SUPERVISOR PROFILE ROUTE (MUST HAVE)
app.get("/api/supervisor/profile", authenticateToken, async (req, res) => {
  if (!req.user.supervisorId) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: req.user.supervisorId },
      select: {
        name: true,
        supervisorId: true,
        designation: true,
        department: true,
        phone: true,
        email: true,
        block: true,
      },
    });

    if (!supervisor) return res.status(404).json({ error: "Not found" });

    res.json({ user: { ...supervisor, role: "Supervisor" } });
  } catch (err) {
    console.error("Supervisor profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. SUPERVISOR AUTH CHECK (for ProtectedRoute)
app.get("/api/supervisor/auth-check", authenticateToken, (req, res) => {
  if (req.user.supervisorId) {
    res.json({
      user: {
        supervisorId: req.user.supervisorId,
        name: req.user.name,
        role: "Supervisor",
        department: req.user.department,
      },
    });
  } else {
    res.status(403).json({ error: "Not a supervisor" });
  }
});

// 3. UNIVERSAL PROFILE ROUTE (Best Fix - Use This One!)
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    let userData;

    if (req.user.adminId) {
      // It's an Admin
      const admin = await prisma.admin.findUnique({
        where: { adminId: req.user.adminId },
        select: { adminId: true, name: true, position: true, department: true, role: true },
      });
      userData = { ...admin, role: admin.role || "admin" };
    } 
    else if (req.user.supervisorId) {
      // It's a Supervisor
      const supervisor = await prisma.supervisor.findUnique({
        where: { supervisorId: req.user.supervisorId },
        select: { name: true, supervisorId: true, designation: true, department: true, phone: true, email: true },
      });
      userData = { ...supervisor, id: supervisor.supervisorId, role: "Supervisor" };
    } 
    else {
      return res.status(403).json({ error: "Invalid token" });
    }

    res.json({ user: userData });
  } catch (err) {
    console.error("GET /api/me error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ==================== SUPERVISOR REFRESH TOKEN ====================
app.post("/api/supervisor/refresh", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (!decoded.supervisorId) {
      return res.status(403).json({ error: "Invalid token type" });
    }

    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: decoded.supervisorId },
    });

    if (!supervisor || supervisor.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const payload = {
      supervisorId: supervisor.supervisorId,
      name: supervisor.name,
      role: "Supervisor",
      department: supervisor.department,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    setTokenCookie(res, "access_token", accessToken, 15 * 60);

    res.json({ success: true });
  } catch (err) {
    console.error("Supervisor refresh error:", err);
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// ==================== SUPERVISOR AUTH CHECK (Add this too!) ====================
app.get("/api/supervisor/auth-check", authenticateToken, (req, res) => {
  if (req.user.role !== "Supervisor") {
    return res.status(403).json({ error: "Not a supervisor" });
  }
  res.json({ user: req.user });
});


// ---------- Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});