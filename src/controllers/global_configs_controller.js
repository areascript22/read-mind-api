import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAppVersion = async (req, res) => {
  try {
    const config = await prisma.globalConfig.findFirst({
      orderBy: { id: "desc" },
      select: { buildNumber: true, updatedAt: true },
    });

    if (!config) {
      return res
        .status(404)
        .json({ message: "App version not configured yet" });
    }

    res.status(200).json({
      buildNumber: config.buildNumber,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching app version:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAppVersion = async (req, res) => {
  try {
    const { buildNumber } = req.body;

    if (!buildNumber || isNaN(buildNumber)) {
      return res
        .status(400)
        .json({ error: "buildNumber must be a valid number" });
    }

    const newVersion = await prisma.globalConfig.create({
      data: {
        buildNumber: Number(buildNumber),
      },
      select: {
        id: true,
        buildNumber: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Minimum app build number updated successfully",
      version: newVersion,
    });
  } catch (error) {
    console.error("Error updating app version:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
