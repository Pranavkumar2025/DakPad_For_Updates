import prisma from "../prisma/client.js";

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
    return res.status(400).json({ error: "Both passwords required" });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { adminId: req.user.adminId } });
    if (!admin || admin.password !== currentPassword) {
      return res.status(401).json({ error: "Current password incorrect" });
    }

    await prisma.admin.update({
      where: { adminId: req.user.adminId },
      data: { password: newPassword },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
};