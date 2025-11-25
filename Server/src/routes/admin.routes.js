import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { getProfile, updateProfile, changePassword } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/password", changePassword);
router.get("/auth-check", (req, res) => res.json({ user: req.user }));

export default router;