require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const verifyAdmin = require("./Middleware/authMiddleware.js"); // Import the middleware

// dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes

// Get all cases
app.get("/api/cases", async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      include: {
        timeline: true,
        messages: true,
      },
    });
    res.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ error: "Failed to fetch cases", message: error.message });
  }
});

// Create a new case
app.post("/api/cases", async (req, res) => {
  try {
    const {
      applicantName,
      phone,
      title,
      description,
      table,
      dateOfApplication,
      caseType,
      department,
      fileUrl, // optional
    } = req.body;

    // Validation (basic)
    if (!applicantName || !phone || !title || !description || !dateOfApplication || !department) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newCase = await prisma.case.create({
      data: {
        applicantName,
        phone,
        title,
        description,
        addAt: table ?? null,
        dateOfApplication: new Date(dateOfApplication),
        caseType: caseType ?? null,
        departmentInOut: department,
        fileUrl: fileUrl ?? null,
        status: "Pending",
      },
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ error: "Failed to submit application", message: error.message });
  }
});

// Update case status
app.put("/api/cases/:id/status",verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.case.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status", message: error.message });
  }
});

// Add timeline entry
app.post("/api/cases/:id/timeline", async (req, res) => {
  const { id } = req.params;
  const { section, comment } = req.body;

  try {
    const newTimeline = await prisma.timeline.create({
      data: {
        section,
        comment,
        date: new Date().toISOString().split("T")[0],
        caseId: id,
      },
    });

    res.status(201).json(newTimeline);
  } catch (error) {
    console.error("Error adding timeline:", error);
    res.status(500).json({ error: "Failed to add timeline entry", message: error.message });
  }
});

// Send message
app.post("/api/cases/:id/message", async (req, res) => {
  const { id } = req.params;
  const { message, from } = req.body;

  try {
    const newMessage = await prisma.message.create({
      data: {
        message,
        from,
        date: new Date().toISOString().split("T")[0],
        caseId: id,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message", message: error.message });
  }
});


app.get("/api/cases/:id/messages", async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { caseId: id },
      orderBy: { date: 'asc' } // Optional: sort by date
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages", message: error.message });
  }
});


// Delete case
app.delete("/api/cases/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.case.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ error: "Failed to delete case", message: error.message });
  }
});

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret";

app.post("/api/admin/login", (req, res) => {
  const { adminId, password } = req.body;

  if (adminId === "0519" && password === "@Dakpad5") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "6h" });

    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid Admin ID or Password" });
  }
});


// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
