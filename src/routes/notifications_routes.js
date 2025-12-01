import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";

import {
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  sendNotification,
  updateFcmToken,
} from "../controllers/notifications_controller.js";

const router = express.Router();

router.post("/", validateJwt, sendNotification);
router.put("/fcm/update", validateJwt, updateFcmToken);

router.get("/user/all", validateJwt, getUserNotifications);
router.put("/:notificationId/read", validateJwt, markAsRead);
router.put("/readAll", validateJwt, markAllAsRead);
router.get("/user/unreadCount", validateJwt, getUnreadCount);

export default router;
