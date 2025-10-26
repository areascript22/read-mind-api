import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import { evaluateParaphrase, generateParagrapth } from "../controllers/ai_controller.js";

const router = express.Router();
router.post("/paragraph", validateJwt, generateParagrapth);
router.post("/evaluateParaphrase", validateJwt, evaluateParaphrase);

export default router;
