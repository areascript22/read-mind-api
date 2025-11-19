import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getMainIdeaAttempts,
  getParaphraseAttempts,
  getSummaryAttempts,
} from "../controllers/activity_attempts_controller.js";

const router = express.Router();
router.get("/paraphrase/:aireadingId", validateJwt, getParaphraseAttempts);
router.get("/mainIdea/:aireadingId", validateJwt, getMainIdeaAttempts);
router.get("/summary/:aireadingId", validateJwt, getSummaryAttempts);

export default router;
