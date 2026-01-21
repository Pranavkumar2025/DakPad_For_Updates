// controllers/auth.controller.js (or your login file)

import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import { generateTokens, setTokenCookie } from "../utils/token.utils.js";

const SALT_ROUNDS = 12;

// Admin Login - NOW SECURE WITH BCRYPT
export const adminLogin = async (req, res) => {
  const { adminId, password } = req.body;

  if (!adminId || !password) {
    return res.status(400).json({ error: "adminId and password required" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId },
      select: { adminId: true, name: true, role: true, password: true, refreshToken: true },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens({
      adminId: admin.adminId,
      role: admin.role,
    });

    setTokenCookie(res, "access_token", accessToken, 60 * 60); // 1 hour
    setTokenCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60); // 7 days

    // Update refreshToken in DB
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
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Supervisor Login - ALSO SECURE
export const supervisorLogin = async (req, res) => {
  const { supervisorName, adminId, password } = req.body;

  if (!supervisorName || !adminId || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: adminId.toUpperCase() },
      select: {
        supervisorId: true,
        name: true,
        department: true,
        password: true,
        refreshToken: true,
      },
    });

    if (!supervisor || supervisor.department !== supervisorName) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, supervisor.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens({
      supervisorId: supervisor.supervisorId,
      role: "supervisor",
    });

    setTokenCookie(res, "access_token", accessToken, 60 * 60);
    setTokenCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60);

    await prisma.supervisor.update({
      where: { supervisorId: supervisor.supervisorId },
      data: { refreshToken },
    });

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
    res.status(500).json({ error: "Server error" });
  }
};

// Logout & Refresh remain the same
export const logout = (req, res) => {
  const cookieOptions = {
    path: "/",
    sameSite: "none",
    secure: true,
  };

  // Clear with specific options
  res.clearCookie("access_token", cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);

  // Also try clearing without secure just in case (for localhost)
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });

  res.json({ success: true, message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  const refreshTokenCookie = req.cookies.refresh_token;
  if (!refreshTokenCookie) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET || "fallback-secret");

    let user;
    if (decoded.adminId) {
      user = await prisma.admin.findUnique({
        where: { adminId: decoded.adminId },
        select: { refreshToken: true },
      });
    } else if (decoded.supervisorId) {
      user = await prisma.supervisor.findUnique({
        where: { supervisorId: decoded.supervisorId },
        select: { refreshToken: true },
      });
    }

    if (!user || user.refreshToken !== refreshTokenCookie) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateTokens(decoded).accessToken; // reuse payload
    setTokenCookie(res, "access_token", newAccessToken, 15 * 60);

    res.json({ success: true });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};