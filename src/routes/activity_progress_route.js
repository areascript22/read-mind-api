import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  createActivityProgress,
  getAllActivityProgresses,
  updateActivityProgress,
} from "../controllers/activity_progress_controller.js";

const router = express.Router();
router.post("/:aiReadingId", validateJwt, createActivityProgress);
router.put("/:aiReadingId", validateJwt, updateActivityProgress);
router.get("/:userId/:courseId", validateJwt, getAllActivityProgresses);

export default router;
