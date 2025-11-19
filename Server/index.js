import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";

// Import all routers
import applicationRoutes from "./controller/applicationController.js";
import authRoutes from "./routes/authRoutes.js";        // ← NEW: Combined auth router
import adminRoutes from "./controller/adminController.js";

dotenv.config();
const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
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

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/api/track/:id", applicationRoutes);        // Public tracking
// app.use("/api",applicationRoutes);
app.use("/api/applications", applicationRoutes);     // All application routes
app.use("/api/admin", authRoutes);                   // All auth routes (login, logout, refresh, auth-check)
app.use("/api/admin", adminRoutes);                  // Profile & password routes

// 404 for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});