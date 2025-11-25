import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

router.get("/performance", async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { applicationDate: "desc" },
    });

    const today = new Date();
    const formatted = applications.map(app => {
      const daysPending = Math.ceil((today - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24));
      return { ...app, pendingDays: daysPending };
    });

    const total = formatted.length;
    const pending = formatted.filter(a => ["In Process", "Not Assigned Yet"].includes(a.status)).length;
    const resolved = formatted.filter(a => a.status === "Compliance").length;
    const avgDays = resolved > 0
      ? Math.round(formatted.filter(a => a.status === "Compliance").reduce((s, a) => s + a.pendingDays, 0) / resolved)
      : 0;

    res.json({
      success: true,
      data: {
        total,
        pending,
        resolved,
        avgResolutionDays: avgDays,
        applications: formatted,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
});

export default router;