import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
console.log("🧹 Push notification cleanup job is active");

cron.schedule(
  "0 3 * * *",
  async () => {
    console.log("🧹 Running push notification cleanup job at:", new Date());

    try {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      console.log("Deleting notifications created before:", twoDaysAgo);

      const result = await prisma.pushNotification.deleteMany({
        where: {
          createdAt: {
            lte: twoDaysAgo,
          },
        },
      });

      console.log(
        `Cleanup complete. Deleted ${result.count} push notifications.`
      );
    } catch (error) {
      console.error("Error during push notification cleanup job:", error);
    }
  },
  {
    timezone: "America/Guayaquil",
  }
);
