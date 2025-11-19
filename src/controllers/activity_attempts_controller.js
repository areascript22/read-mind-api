import { PrismaClient } from "@prisma/client";
import { parse } from "path";
const prisma = new PrismaClient();

export const getParaphraseAttempts = async (req, res) => {
  try {
    const userId = req.id;
    const aireadingId = parseInt(req.params.aireadingId);
    const { targetUserId } = req.query;

    const paraphraseAttempts = await prisma.paraphraseAttempt.findMany({
      where: {
        userId: parseInt(targetUserId),
        aiReadingId: aireadingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        aiReading: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Paraphrase attempts retrieved successfully.",
      data: paraphraseAttempts,
      count: paraphraseAttempts.length,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve paraphrase attempts." });
  }
};

export const getMainIdeaAttempts = async (req, res) => {
  try {
    const userId = req.id;
    const aireadingId = parseInt(req.params.aireadingId);
    const { targetUserId } = req.query;

    const mainIdeaAttempts = await prisma.mainIdeaAttempt.findMany({
      where: {
        userId: parseInt(targetUserId),
        aiReadingId: aireadingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        aiReading: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Main idea attempts retrieved successfully.",
      data: mainIdeaAttempts,
      count: mainIdeaAttempts.length,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve main idea attempts." });
  }
};

export const getSummaryAttempts = async (req, res) => {
  try {
    const userId = req.id;
    const aireadingId = parseInt(req.params.aireadingId);
    const { targetUserId } = req.query;

    const summaryAttempts = await prisma.summaryAttempt.findMany({
      where: {
        userId: parseInt(targetUserId),
        aiReadingId: aireadingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        aiReading: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Summary attempts retrieved successfully.",
      data: summaryAttempts,
      count: summaryAttempts.length,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve summary attempts." });
  }
};
