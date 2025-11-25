import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const updateSeenNotificationDialog = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "User ID not found in request",
      });
    }

    // Ensure preferences exist (failsafe)
    let prefs = await prisma.userPreferences.findUnique({
      where: { userId: Number(userId) },
    });

    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { userId: Number(userId) },
      });
    }

    const updated = await prisma.userPreferences.update({
      where: { userId: Number(userId) },
      data: {
        seenNotificationDialog: true,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Notification dialog marked as seen",
      preferences: updated,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

export const getPreferencesByUser = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "User ID not found in request",
      });
    }

    let prefs = await prisma.userPreferences.findUnique({
      where: { userId: Number(userId) },
    });

    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { userId: Number(userId) },
      });
    }

    return res.status(200).json({
      ok: true,
      preferences: prefs,
    });
  } catch (error) {
    console.error("Error checking preferences:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};
