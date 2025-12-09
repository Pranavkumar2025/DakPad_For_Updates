import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  assignApplication,
  complianceApplication,
  disposeApplication,
  trackApplication, // public
} from "../controllers/application.controller.js";
import { upload, uploadNone } from "../config/multer.config.js";

const router = express.Router();


router.get("/track/:id", trackApplication);

router.use((req, res, next) => {
  if (req.method === "GET" && req.path.match(/^\/[A-Z0-9]+$/i)) {
    return next();
  }
  authenticateToken(req, res, next);
});

// router.post("/", uploadNone.any(), createApplication);
router.post("/", upload.single("attachment"), createApplication);  // Now handles PDF!
router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.patch("/:id/assign", upload.single("file"), assignApplication);
router.patch("/:id/compliance", upload.single("file"), complianceApplication);
router.patch("/:id/dispose", upload.single("file"), disposeApplication);

export default router;