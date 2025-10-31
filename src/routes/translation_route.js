import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getAllTranslations,
  translateText,
} from "../controllers/translation_controller.js";

const router = express.Router();

router.post("/", validateJwt, translateText);
router.get("/all", validateJwt, getAllTranslations);

export default router;
