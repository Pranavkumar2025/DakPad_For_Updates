import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authenticateToken, generateTokens, setTokenCookie } from "../Middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { adminId, password } = req.body;
  if (!adminId || !password) return res.status(400).json({ error: "adminId and password required" });

  try {
    const admin = await prisma.admin.findUnique({ where: { adminId } });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(admin);
    setTokenCookie(res, "access_token", accessToken, 15 * 60);
    setTokenCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60);

    await prisma.admin.update({ where: { adminId }, data: { refreshToken } });

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

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/", sameSite: "none", secure: true });
  res.clearCookie("refresh_token", { path: "/", sameSite: "none", secure: true });
  res.json({ success: true });
});

// POST /api/admin/refresh
router.post("/refresh", async (req, res) => {
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

// GET /api/admin/auth-check
router.get("/auth-check", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;