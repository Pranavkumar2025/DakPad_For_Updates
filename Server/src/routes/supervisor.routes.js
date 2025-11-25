import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { getProfile } from "../controllers/supervisor.controller.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/profile", getProfile);
router.get("/auth-check", (req, res) => {
  if (req.user.supervisorId) {
    res.json({ user: req.user });
  } else {
    res.status(403).json({ error: "Not a supervisor" });
  }
});

export default router;