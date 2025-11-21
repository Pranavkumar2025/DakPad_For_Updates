// server/routes/dashboard.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/performance
router.get("/performance", async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        applicantId: true,
        applicant: true,
        applicationDate: true,
        block: true,
        concernedOfficer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        timeline: true,
      },
      orderBy: { applicationDate: "desc" },
    });

    // Convert Date objects to clean format
    const formattedApps = applications.map((app) => ({
      ...app,
      applicationDate: app.applicationDate.toISOString().split("T")[0],
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    // Calculate Pending Days
    const today = new Date();
    const appsWithPendingDays = formattedApps.map((app) => {
      const start = new Date(app.applicationDate);
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...app, pendingDays: diffDays };
    });

    // Metrics
    const total = appsWithPendingDays.length;
    const pending = appsWithPendingDays.filter(
      (a) => a.status === "In Process" || a.status === "Not Assigned Yet"
    ).length;
    const resolved = appsWithPendingDays.filter(
      (a) => a.status === "Compliance"
    ).length;
    const avgDays =
      resolved > 0
        ? Math.round(
            appsWithPendingDays
              .filter((a) => a.status === "Compliance")
              .reduce((sum, a) => sum + a.pendingDays, 0) / resolved
          )
        : 0;

    // Block Performance
    const blockStats = {};
    appsWithPendingDays.forEach((app) => {
      const block = app.block || "Unknown";
      if (!blockStats[block]) {
        blockStats[block] = { total: 0, pending: 0, resolved: 0 };
      }
      blockStats[block].total++;
      if (app.status === "Compliance") blockStats[block].resolved++;
      else if (app.status === "In Process" || app.status === "Not Assigned Yet")
        blockStats[block].pending++;
    });

    const blocks = Object.entries(blockStats)
      .map(([name, stats]) => ({
        blockName: name,
        totalApplications: stats.total,
        pendingApplications: stats.pending,
        resolvedApplications: stats.resolved,
        resolvedPercentage:
          stats.total > 0
            ? Math.round((stats.resolved / stats.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.resolvedPercentage - a.resolvedPercentage);

    // Top & Worst Blocks
    const topBlocks = blocks.slice(0, 5);
    const worstBlocks = blocks.slice(-5).reverse();

    // Pending Days Distribution
    const ranges = [
      { label: "0-15 Days", min: 0, max: 15 },
      { label: "15-30 Days", min: 15, max: 30 },
      { label: "30-45 Days", min: 30, max: 45 },
      { label: "45-60 Days", min: 45, max: 60 },
      { label: "60+ Days", min: 60, max: Infinity },
    ];

    const pendingDaysData = ranges.map((r) => ({
      range: r.label,
      value: appsWithPendingDays.filter((a) => {
        const days = a.pendingDays;
        return days >= r.min && (r.max === Infinity || days < r.max);
      }).length,
    }));

    // Status Pie
    const statusCount = {};
    appsWithPendingDays.forEach((a) => {
      const status =
        a.status === "In Process"
          ? "Pending"
          : a.status === "Compliance"
          ? "Resolved"
          : a.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCount).map(([status, value]) => ({
      category: status,
      value,
      color:
        status === "Pending"
          ? "#f59e0b"
          : status === "Resolved"
          ? "#10b981"
          : "#ef4444",
    }));

    // In dashboard.js — just return applications
res.json({
  success: true,
  data: { applications: appsWithPendingDays }
});
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard data" });
  }
});

export default router;
