import prisma from "../prisma/client.js";

export const getProfile = async (req, res) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { supervisorId: req.user.supervisorId },
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

    if (!supervisor) return res.status(404).json({ error: "Not found" });

    res.json({ user: { ...supervisor, role: "Supervisor" } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};