import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  createAIReading,
  createAIReadingAttempt,
  createMainIdeaAttempt,
  createParaphraseAttempt,
  createSummaryAttempt,
  deleteAIReadingActivitySimple,
  getAllActivities,
  updateAIReading,
} from "../controllers/activities/course_activities_controller.js";
import {
  completeFlashCardSession,
  createFlashCardAttempt,
  createFlashCards,
  deleteFlashCardActivity,
  isActivityOverDue,
  startFlashCardSession,
  updateFlashCardActivity,
} from "../controllers/activities/activity_flashcards.js";

const router = express.Router();

router.post("/:idCourse/aiReading", validateJwt, createAIReading);
router.post("/:idCourse/flashcards", validateJwt, createFlashCards);
router.post(
  "/:activityId/flashcard/session",
  validateJwt,
  startFlashCardSession
);
router.put(
  "/flashcard/:sessionId/complete",
  validateJwt,
  completeFlashCardSession
);
router.post(
  "/flashcard/:sessionId/attempt",
  validateJwt,
  createFlashCardAttempt
);
router.delete("/:activityId/flashcards", validateJwt, deleteFlashCardActivity);

router.put("/:activityId/flashcards", validateJwt, updateFlashCardActivity);

router.post("/aiReading/attempt", validateJwt, createAIReadingAttempt);
router.post("/paraphrase/attempt", validateJwt, createParaphraseAttempt);
router.post("/mainIdea/attempt", validateJwt, createMainIdeaAttempt);
router.post("/summary/attempt", validateJwt, createSummaryAttempt);

router.get("/:idCourse/getAllAiReadings", validateJwt, getAllActivities);
router.get("/:activityId/overdue", validateJwt, isActivityOverDue);

router.put("/:activityId/aiReading", validateJwt, updateAIReading);
router.delete(
  "/:activityId/aireading",
  validateJwt,
  deleteAIReadingActivitySimple
);

export default router;
