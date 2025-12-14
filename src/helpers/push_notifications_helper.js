import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import { emitNewNotification } from "../socket_server.js";
import Mustache from "mustache";

const prisma = new PrismaClient();

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

if (!credentials) {
  console.error(
    "ERROR: No se encontraron las credenciales de Firebase en GOOGLE_APPLICATION_CREDENTIALS"
  );
  throw new Error("Firebase credentials missing");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });

  console.log("🔥 Firebase Admin inicializado correctamente");
}

export const sendPushNotificationHelper = async (
  targetUserId,
  title,
  body,
  data,
  notificationChannel,
  typeId
) => {
  try {
    if (!targetUserId || !title || !body || !notificationChannel) {
      console.log(
        "Faltan campos requeridos: target user, title, body or notificationChannel"
      );
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      console.log("Target user not found");
      return;
    }

    const fcmToken = targetUser.fcmToken;

    if (!fcmToken) {
      console.log("Target user has no FCM token");
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},

      android: {
        priority: "high",
        notification: {
          channelId: notificationChannel,
          sound: "default",
          visibility: "public",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(
      "Notification response:",
      response,
      "Success: ",
      response.success
    );

    await prisma.pushNotification.create({
      data: {
        userId: targetUserId,
        typeId: typeId,
        title,
        message: body,
        data: data || {},
        read: false,
        deliveryStatus: NotificationDeliveryStatus.SENT,
      },
    });

    emitNewNotification(targetUserId);

    return;
  } catch (err) {
    console.error("Error sending push notification: ", err);
    await prisma.pushNotification.create({
      data: {
        userId: targetUserId,
        typeId: typeId,
        title,
        message: body,
        data: data || {},
        read: false,
        deliveryStatus: NotificationDeliveryStatus.FAILED,
      },
    });

    console.log("Notification saved as FAILED");

    return;
  }
};

export const notifyStudentsOfCourse = async (
  courseId,
  data,
  notificationChannel,
  dataTemplate
) => {
  const students = await prisma.user.findMany({
    where: {
      enrolledCourses: {
        some: { courseId },
      },
      fcmToken: { not: null },
    },
    select: {
      id: true,
    },
  });

  const notificationType = await prisma.notificationType.findUnique({
    where: { name: notificationChannel.name },
  });

  if (!notificationType) {
    console.log("Invalid notification type");
    return;
  }

  const titleTemplate = Mustache.render(
    notificationType.titleTemplate,
    dataTemplate
  );
  const bodyTemplate = Mustache.render(
    notificationType.bodyTemplate,
    dataTemplate
  );

  const notifications = students.map((student) =>
    sendPushNotificationHelper(
      student.id,
      titleTemplate,
      bodyTemplate,
      data,
      notificationChannel.channelId,
      notificationType.id
    )
  );

  Promise.allSettled(notifications);
};

export const NotificationDeliveryStatus = Object.freeze({
  PENDING: "PENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
});

export const NotificationChannelsIds = Object.freeze({
  ACTIVITY_REMINDERS: {
    name: "ACTIVITY_REMINDERS",
    channelId: "activity_reminders",
  },
  Activity_ALERTS: {
    name: "ACTIVITY_ALERTS",
    channelId: "activity_alerts",
  },
  GENERAL_APP_NOTICES: {
    name: "GENERAL_APP_NOTICES",
    channelId: "general_app_notices",
  },
});
