// controllers/adminController.js (or your existing file)

import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // Recommended strength

// Get Profile (Password field excluded for security)
export const getProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
      select: {
        adminId: true,
        name: true,
        position: true,
        department: true,
        role: true,
        // NEVER select password
      },
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json({ user: admin }); // Matches your frontend expectation
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update Profile (Name, Position, Department)
export const updateProfile = async (req, res) => {
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

    res.json({ user: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Secure Password Change
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
      select: { password: true },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { password: hashedNewPassword },
    });

    // DO NOT regenerate or destroy session here → user stays logged in
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};