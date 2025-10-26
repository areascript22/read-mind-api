import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  createAIReading,
  createParaphrase,
  deleteActivity,
  getAllActivities,
  updateAIReading,
} from "../controllers/course_activities_controller.js";

const router = express.Router();

router.post("/:idCourse/aiReading", validateJwt, createAIReading);
router.post("/paraphrase", validateJwt, createParaphrase);
router.get("/:idCourse/getAllAiReadings", validateJwt, getAllActivities);
router.put("/:activityId/aiReading", validateJwt, updateAIReading);
router.delete("/:activityId", validateJwt, deleteActivity);

export default router;
