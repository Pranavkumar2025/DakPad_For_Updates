import express from "express";
import { adminLogin, supervisorLogin, logout, refreshToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/supervisor/login", supervisorLogin);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

export default router;