import prisma from "../prisma/client.js";
import { generateTokens, setTokenCookie } from "../utils/token.utils.js";

// Admin Login
export const adminLogin = async (req, res) => {
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
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Supervisor Login
export const supervisorLogin = async (req, res) => {
  const { supervisorName, adminId, password } = req.body;

  if (!supervisorName || !adminId || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: adminId.toUpperCase() },
    });

    if (!supervisor || supervisor.password !== password || supervisor.department !== supervisorName) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(supervisor);

    setTokenCookie(res, "access_token", accessToken, 15 * 60);
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

export const logout = (req, res) => {
  res.clearCookie("access_token", { path: "/", sameSite: "none", secure: true });
  res.clearCookie("refresh_token", { path: "/", sameSite: "none", secure: true });
  res.json({ success: true });
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "fallback-secret");

    let user;
    if (decoded.adminId) {
      user = await prisma.admin.findUnique({ where: { adminId: decoded.adminId } });
    } else if (decoded.supervisorId) {
      user = await prisma.supervisor.findUnique({ where: { supervisorId: decoded.supervisorId } });
    }

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const { accessToken } = generateTokens(user);
    setTokenCookie(res, "access_token", accessToken, 15 * 60);

    res.json({ success: true });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};