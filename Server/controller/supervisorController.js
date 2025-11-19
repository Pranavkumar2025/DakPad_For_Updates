// controller/supervisorController.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateSupervisorToken } from "../Middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/supervisor/profile
router.get("/profile", authenticateSupervisorToken, async (req, res) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: req.user.supervisorId },
      select: {
        supervisorId: true,
        name: true,
        designation: true,
        department: true,
        phone: true,
        email: true,
        block: true,
        isActive: true,
      },
    });

    if (!supervisor) return res.status(404).json({ error: "Supervisor not found" });

    res.json(supervisor);
  } catch (err) {
    console.error("Supervisor profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/supervisor/profile
router.patch("/profile", authenticateSupervisorToken, async (req, res) => {
  const { name, designation, department, phone, email, block } = req.body;

  try {
    const updated = await prisma.supervisor.update({
      where: { supervisorId: req.user.supervisorId },
      data: { name, designation, department, phone, email, block },
      select: {
        supervisorId: true,
        name: true,
        designation: true,
        department: true,
        phone: true,
        email: true,
        block: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Supervisor update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// PATCH /api/supervisor/password
router.patch("/password", authenticateSupervisorToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords required" });
  }

  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: req.user.supervisorId },
    });

    if (!supervisor || supervisor.password !== currentPassword) {
      return res.status(401).json({ error: "Current password incorrect" });
    }

    await prisma.supervisor.update({
      where: { supervisorId: req.user.supervisorId },
      data: { password: newPassword },
    });

    res.json({ success: true, message: "Password changed" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;