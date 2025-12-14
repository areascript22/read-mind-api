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

export const sendPushNotificationAndSave = async (
  targetUser,
  title,
  body,
  data,
  notificationChannel,
  typeId
) => {
  try {
    if (!targetUser || !title || !body || !notificationChannel) {
      console.log(
        "Faltan campos requeridos: target user, title, body or notificationChannel"
      );
      return;
    }

    const message = {
      token: targetUser.fcmToken,
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

    console.log("Sending push noitfication to: ", targetUser.id);
    const response = await admin.messaging().send(message);
    console.log(
      "Notification response:",
      response,
      "Success: ",
      response.success
    );

    const createdNotification = await prisma.pushNotification.create({
      data: {
        userId: targetUser.id,
        typeId: typeId,
        title,
        message: body,
        data: data || {},
        read: false,
        deliveryStatus: NotificationDeliveryStatus.SENT,
      },
    });

    emitNewNotification(targetUser.id);

    return createdNotification;
  } catch (err) {
    console.error("Error sending push notification: ", err);
    return;
  }
};

export const notifyActivityOverdue = async (
  targetUser,
  title,
  body,
  data,
  notificationChannel,
  typeId,
  activityId
) => {
  try {
    const activeReminder = await prisma.activityReminder.findFirst({
      where: {
        activityId: activityId,
        notification: {
          userId: targetUser.id,
          typeId: typeId,
        },
      },
    });

    if (activeReminder) {
      console.log(
        `This notification for activity reminder was already sent: User: ${targetUser.id}, Activity: ${activityId}, "type: ${typeId}" `
      );
      return;
    }

    const response = await sendPushNotificationAndSave(
      targetUser,
      title,
      body,
      data,
      notificationChannel,
      typeId
    );

    await prisma.activityReminder.create({
      data: {
        activityId: activityId,
        notifyId: response.id,
      },
    });
    console.log(
      "Reminder succesfully saved for user: ",
      targetUser.id,
      ", activity: ",
      activityId,
      "and notificaiton: ",
      response.id
    );
  } catch (e) {
    console.log("error while saving activity reminder: ", e.message);
  }
};

export const notifyStudentsActivityCreated = async (
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
    sendPushNotificationAndSave(
      student,
      titleTemplate,
      bodyTemplate,
      data,
      notificationChannel.channelId,
      notificationType.id
    )
  );

  Promise.allSettled(notifications);
};
