import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getMainIdeaAttempts,
  getParaphraseAttempts,
  getSummaryAttempts,
} from "../controllers/activity_attempts_controller.js";

const router = express.Router();
router.get("/paraphrase", validateJwt, getParaphraseAttempts);
router.get("/mainIdea", validateJwt, getMainIdeaAttempts);
router.get("/summary", validateJwt, getSummaryAttempts);

export default router;
