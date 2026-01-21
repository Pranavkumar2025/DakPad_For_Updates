import express from "express";
import { adminLogin, supervisorLogin, logout, refreshToken } from "../controllers/auth.controller.js";
import { validateLogin } from "../middleware/validator.middleware.js";

const router = express.Router();

router.post("/admin/login", validateLogin, adminLogin);
router.post("/supervisor/login", validateLogin, supervisorLogin);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

export default router;