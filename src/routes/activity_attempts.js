import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getFlashcardsSessions,
  getMainIdeaAttempts,
  getParaphraseAttempts,
  getSummaryAttempts,
} from "../controllers/activity_attempts_controller.js";

const router = express.Router();
router.get("/paraphrase/:aireadingId", validateJwt, getParaphraseAttempts);
router.get("/mainIdea/:aireadingId", validateJwt, getMainIdeaAttempts);
router.get("/summary/:aireadingId", validateJwt, getSummaryAttempts);
router.get("/flashcards/session/:flashcardActId", validateJwt, getFlashcardsSessions);

export default router;
