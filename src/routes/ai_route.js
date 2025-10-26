import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  evaluateMainIdea,
  evaluateParaphrase,
  evaluateSummary,
  generateParagrapth,
} from "../controllers/ai_controller.js";

const router = express.Router();
router.post("/paragraph", validateJwt, generateParagrapth);
router.post("/evaluate/paraphrase", validateJwt, evaluateParaphrase);
router.post("/evaluate/mainIdea", validateJwt, evaluateMainIdea);
router.post("/evaluate/summary", validateJwt, evaluateSummary);

export default router;
