import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // You can adjust this (higher = more secure but slower)

export const getProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
      select: { adminId: true, name: true, position: true, department: true, role: true },
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, position, department } = req.body;

  try {
    const updated = await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { name, position, department },
      select: { adminId: true, name: true, position: true, department: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId: req.user.adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Compare current password with the stored hash
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Verify new password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long, contain 1 uppercase letter, and 1 special character.",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the password with the hashed version
    await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { password: hashedNewPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
};