import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import {
  NotificationChannelsIds,
  notifyActivityOverdue,
} from "../helpers/push_notifications_helper.js";

import Mustache from "mustache";

const prisma = new PrismaClient();
console.log("Reminder job is active");

cron.schedule(
  "0 0,6,12,18 * * *", // Runs at 12 AM, 6 AM, 12 PM, 6 PM (every 6 hours)
  async () => {
    console.log("⏰ Running activity reminder job. Run at: ", new Date());

    const now = new Date();
    const next12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Changed from 24 to 12 hours

    const activities = await prisma.activity.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: next12Hours, // Changed from next24Hours to next12Hours
        },
      },
      include: {
        course: {
          include: {
            students: {
              include: { student: true },
            },
          },
        },
      },
    });

    console.log("Activities got: ", activities);
    if (activities.length == 0) {
      return;
    }

    const notificationType = await prisma.notificationType.findUnique({
      where: { name: NotificationChannelsIds.ACTIVITY_REMINDERS.name },
    });

    if (!notificationType) {
      console.log("Invalid notification type");
      return;
    }

    for (const activity of activities) {
      for (const enrollment of activity.course.students) {
        const dataTemplate = {
          activityTitle: activity.title,
          dueDate: activity.dueDate.toLocaleDateString("en-US"),
        };

        const titleTemplate = Mustache.render(
          notificationType.titleTemplate,
          dataTemplate
        );
        const bodyTemplate = Mustache.render(
          notificationType.bodyTemplate,
          dataTemplate
        );

        console.log("Current user: ", enrollment.student.id);
        console.log("Title template: ", titleTemplate);
        console.log("Body template: ", bodyTemplate);

        notifyActivityOverdue(
          enrollment.student,
          titleTemplate,
          bodyTemplate,
          {},
          NotificationChannelsIds.ACTIVITY_REMINDERS.channelId,
          notificationType.id,
          activity.id
        );
      }
    }
  },
  {
    timezone: "America/Guayaquil", // Ecuador
  }
);
