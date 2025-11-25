
import prisma from "../prisma/client.js";

export const getMyProfile = async (req, res) => {
  try {
    const payload = req.user;

    if (payload.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { adminId: payload.adminId },
        select: { adminId: true, name: true, position: true, department: true, role: true },
      });
      if (!admin) return res.status(404).json({ error: "Admin not found" });
      return res.json({ user: { ...admin, role: admin.role || "admin" } });
    }

    if (payload.supervisorId) {
      const supervisor = await prisma.supervisor.findUnique({
        where: { supervisorId: payload.supervisorId },
        select: {
          name: true,
          supervisorId: true,
          designation: true,
          department: true,
          phone: true,
          email: true,
          block: true,
        },
      });
      if (!supervisor) return res.status(404).json({ error: "Supervisor not found" });
      return res.json({
        user: {
          ...supervisor,
          id: supervisor.supervisorId,
          role: "Supervisor",
        },
      });
    }

    return res.status(403).json({ error: "Invalid user type" });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};