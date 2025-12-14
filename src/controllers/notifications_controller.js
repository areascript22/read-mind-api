import { PrismaClient } from "@prisma/client";
import {
  NotificationChannelsIds,
  notifyStudentsActivityCreated,
  sendPushNotificationAndSave,
} from "../helpers/push_notifications_helper.js";

const prisma = new PrismaClient();

export const sendNotification = async (req, res) => {
  try {
    const { targetUserId, title, body, data, typeId = 1 } = req.body;

    if (!targetUserId || !title || !body) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos requeridos: targetUserId, title, body",
      });
    }

    const notificationType = await prisma.notificationType.findUnique({
      where: { id: typeId },
    });

    if (!notificationType) {
      return res.status(400).json({
        ok: false,
        message: "Tipo de notificación no válido",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Notificación enviada correctamente",
    });

    notifyStudentsActivityCreated(
      2,
      data,
      NotificationChannelsIds.ACTIVITY_REMINDERS,
      {
        activityTitle: "Automite AI",
        dueDate: "20 de diciembre",
      }
    );
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: err.toString(),
    });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const userId = req.id;
    const { fcmToken } = req.body;

    if (!fcmToken || typeof fcmToken !== "string") {
      return res.status(400).json({
        ok: false,
        message: "El campo fcmToken es requerido y debe ser un string",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fcmToken,
      },
      include: {
        role: true,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "FCM Token actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error en updateFcmToken:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.id;

    const notifications = await prisma.pushNotification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { sentAt: "desc" }, // Newest first
      include: {
        type: true, // Include notification type if needed
      },
    });

    return res.status(200).json({
      ok: true,
      data: notifications,
    });
  } catch (err) {
    console.error("❌ Error getting notifications:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.pushNotification.update({
      where: { id: parseInt(notificationId) },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Notificación marcada como leída",
      notification,
    });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.id;

    await prisma.pushNotification.updateMany({
      where: {
        userId: parseInt(userId),
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Todas las notificaciones marcadas como leídas",
    });
  } catch (err) {
    console.error("❌ Error marking all notifications as read:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    console.log("🔔 getUnreadCount called");
    const userId = req.id;

    const count = await prisma.pushNotification.count({
      where: {
        userId: parseInt(userId),
        read: false,
      },
    });

    return res.status(200).json({
      ok: true,
      count,
    });
  } catch (err) {
    console.error("❌ Error getting unread count:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
