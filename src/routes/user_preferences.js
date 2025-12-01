import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getPreferencesByUser,
  updateSeenNotificationDialog,
} from "../controllers/user_preferences_controller.js";

const router = express.Router();

router.put("/", validateJwt, updateSeenNotificationDialog);
router.get("/", validateJwt, getPreferencesByUser);

export default router;
