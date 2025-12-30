import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import helmet from "helmet"; // ← Added

import prisma from "./prisma/client.js";
import corsConfig from "./config/cors.config.js";
import { upload } from "./config/multer.config.js";
import authenticateToken from "./middleware/authenticateToken.js";
import errorHandler from "./middleware/errorHandler.js";

// Routes
import applicationRoutes from "./routes/application.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import supervisorRoutes from "./routes/supervisor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Controller
import { getMyProfile } from "./controllers/profile.controller.js";

dotenv.config();
const app = express();

// === Ensure Uploads Folder ===
const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// === SECURITY: Helmet.js with secure defaults + custom settings ===
app.use(
  helmet({
    // Recommended strong defaults are enabled automatically

    // Content-Security-Policy: Safe for JSON API + static uploads
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Allows inline scripts if needed, but safe for API
        styleSrc: ["'self'", "'unsafe-inline'"], // Allows CSS in uploads if any
        imgSrc: ["'self'", "data:", "https:"], // Allows images from uploads + external
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // HSTS: Enforce HTTPS (critical for production)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // Referrer Policy
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },

    // Permissions Policy: Disable unnecessary features
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      fullscreen: [],
    },

    // Frame options: Prevent clickjacking
    frameguard: { action: "DENY" },

    // Already enabled by default:
    // - xContentTypeOptions: nosniff
    // - hidePoweredBy
    // - noSniff
    // - dnsPrefetchControl
    // - ieNoOpen
  })
);

// === Middleware ===
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadDir));

// === PUBLIC TRACKING ROUTE (No Auth Needed) ===
app.get("/api/track/:id", async (req, res) => {
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
    console.error("Public tracking error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// === PROTECTED ROUTES ===
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// === UNIVERSAL PROFILE ROUTE ===
app.get("/api/me", authenticateToken, getMyProfile);

// === Global Error Handler ===
app.use(errorHandler);

// === 404 Handler ===
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});