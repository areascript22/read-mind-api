import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";

import { sendNotification } from "../controllers/notifications_controller.js";

const router = express.Router();

router.post("/notify", sendNotification);

export default router;
