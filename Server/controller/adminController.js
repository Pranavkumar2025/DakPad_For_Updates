import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../Middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/profile → Fetch logged-in admin profile
router.get("/profile", authenticateToken, async (req, res) => {
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
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/admin/profile → Update name, position, department
router.patch("/profile", authenticateToken, async (req, res) => {
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
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PATCH /api/admin/password → Change password
router.patch("/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords are required" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
    });

    if (!admin || admin.password !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { password: newPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;