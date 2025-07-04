import prisma from '../utils/prismaClient.js';

// GET /api/cases
export const getAllCases = async (req, res) => {
  const cases = await prisma.case.findMany({ include: { timeline: true } });
  res.json(cases);
};

// PUT /api/cases/:id
export const updateCaseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await prisma.case.update({
    where: { id },
    data: { status }
  });
  res.json(updated);
};

// POST /api/cases/:id/timeline
export const addTimelineEntry = async (req, res) => {
  const { id } = req.params;
  const { section, comment, date } = req.body;

  const entry = await prisma.timeline.create({
    data: {
      section,
      comment,
      date,
      caseId: id
    }
  });
  res.json(entry);
};

// PUT /api/cases/:id/message
export const updateAdminMessage = async (req, res) => {
  const { id } = req.params;
  const { adminMessage } = req.body;
  const updated = await prisma.case.update({
    where: { id },
    data: { adminMessage }
  });
  res.json(updated);
};
