import { PrismaClient } from "@prisma/client";
import {
  NotificationChannelsIds,
  notifyStudentsActivityCreated,
} from "../../helpers/push_notifications_helper.js";
const prisma = new PrismaClient();

export const createAIReading = async (req, res) => {
  const courseId = parseInt(req.params.idCourse);
  const {
    title,
    description,
    content,
    dueDate,
    length,
    complexity,
    style,
    hasScoring,
    maxScore,
  } = req.body;

  if (!title || !content || !length || !complexity || !style) {
    return res.status(400).json({
      ok: false,
      message: "Title, content, length, complexity, and style are required",
    });
  }

  if (hasScoring && (!maxScore || maxScore <= 0)) {
    return res.status(400).json({
      ok: false,
      message: "maxScore is required when hasScoring is true",
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: "Course not found",
      });
    }

    console.log("Due date from front:", dueDate);
    console.log("Due date to create: ", new Date(dueDate));

    const result = await prisma.$transaction(async (prisma) => {
      const activity = await prisma.activity.create({
        data: {
          courseId: courseId,
          title: title,
          hasScoring: hasScoring || false,
          maxScore: hasScoring ? maxScore : null,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      const aiReading = await prisma.aIReading.create({
        data: {
          activityId: activity.id,
          content: content,
          length: length,
          complexity: complexity,
          style: style,
        },
      });

      return { activity, aiReading };
    });

    const { activity, aiReading } = result;

    const responseBody = {
      type: "aIReading",
      id: activity.id,
      title: activity.title,
      description: activity.description,
      dueDate: activity.dueDate,
      hasScoring: activity.hasScoring,
      maxScore: activity.maxScore,
      content: aiReading.content,
      length: aiReading.length,
      complexity: aiReading.complexity,
      style: aiReading.style,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      aiReadingId: aiReading.id,
    };

    res.status(201).json({
      ok: true,
      message: "AIReading activity created successfully",
      data: responseBody,
    });

    notifyStudentsActivityCreated(
      courseId,
      {},
      NotificationChannelsIds.Activity_ALERTS,
      {
        professorName: `${req.userName} ${req.userLastName}`,
        activityTitle: activity.title,
      }
    );
  } catch (error) {
    console.error("Error creating AIReading activity:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllActivities = async (req, res) => {
  console.log(
    new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" })
  );
  try {
    const courseId = parseInt(req.params.idCourse);
    const userId = req.id;

    const activities = await prisma.activity.findMany({
      where: { courseId },
      include: {
        aiReading: true,
        flashCardActivity: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const formattedActivities = await Promise.all(
      activities.map(async (activity) => {
        let type = null;
        let details = null;
        let totalScore = null;
        let bestScore = null;

        if (activity.aiReading) {
          type = "aIReading";

          const readingSession = await prisma.aIReadingSession.findUnique({
            where: {
              studentId_aiReadingId: {
                studentId: userId,
                aiReadingId: activity.aiReading.id,
              },
            },
            select: {
              totalScore: true,
            },
          });

          totalScore = readingSession ? readingSession.totalScore : null;

          details = {
            aiReadingId: activity.aiReading.id,
            content: activity.aiReading.content,
            length: activity.aiReading.length,
            complexity: activity.aiReading.complexity,
            style: activity.aiReading.style,
          };
        } else if (activity.flashCardActivity) {
          type = "flashCard";

          const flashCardSessions = await prisma.flashCardSession.findMany({
            where: {
              studentId: userId,
              flashCardActivityId: activity.flashCardActivity.id,
              score: { gt: 0 }, // Solo considerar sesiones con score > 0
            },
            select: {
              score: true,
            },
            orderBy: {
              score: "desc", // Ordenar por score descendente
            },
            take: 1, // Tomar solo el mejor
          });

          // Asignar el mejor score si existen sesiones
          bestScore =
            flashCardSessions.length > 0 ? flashCardSessions[0].score : null;

          details = {
            flashCardActivityId: activity.flashCardActivity.id,
            maxCards: activity.flashCardActivity.maxCards,
            cardOrder: activity.flashCardActivity.cardOrder,
          };
        }

        return {
          id: activity.id,
          courseId: activity.courseId,
          title: activity.title,
          description: activity.description,
          dueDate: activity.dueDate,
          hasScoring: activity.hasScoring,
          maxScore: activity.maxScore,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
          type,
          ...details,
          ...(type === "aIReading" && { totalScore }),
          ...(type === "flashCard" && { bestScore }),
        };
      })
    );

    return res.json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching activities",
    });
  }
};

export const updateAIReading = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);
    const { title, description, dueDate } = req.body;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { aiReading: true },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (!activity.aiReading) {
      return res.status(400).json({
        success: false,
        message: "This activity is not an AI Reading activity",
      });
    }

    const updateData = {};

    // Solo agregar campos si vienen en el request
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        aiReading: true,
      },
    });

    // 4. Formatear la respuesta EXACTAMENTE igual que getAllActivities
    const formattedResponse = {
      id: updatedActivity.id,
      courseId: updatedActivity.courseId,
      title: updatedActivity.title,
      description: updatedActivity.description,
      dueDate: updatedActivity.dueDate,
      hasScoring: updatedActivity.hasScoring,
      maxScore: updatedActivity.maxScore,
      createdAt: updatedActivity.createdAt,
      updatedAt: updatedActivity.updatedAt,
      type: "aIReading", // ← Mismo formato que getAllActivities
      aiReadingId: updatedActivity.aiReading.id,
      content: updatedActivity.aiReading.content,
      length: updatedActivity.aiReading.length,
      complexity: updatedActivity.aiReading.complexity,
      style: updatedActivity.aiReading.style,
      // totalScore no se incluye porque update no maneja scores
    };
    return res.status(200).json({
      success: true,
      message: "AI Reading activity updated successfully",
      data: formattedResponse, // ← Un solo objeto, no nesting
    });
  } catch (error) {
    console.error("Error updating AI Reading activity:", error);

    // Manejar errores específicos de Prisma
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteAIReadingActivitySimple = async (req, res) => {
  const activityId = parseInt(req.params.activityId);

  if (isNaN(activityId)) {
    return res.status(400).json({ ok: false, message: "Invalid activity ID" });
  }

  try {
    // 1. Primero verificar que existe y es una AIReading
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        aiReading: {
          select: { id: true },
        },
        flashCardActivity: {
          select: { id: true },
        },
      },
    });

    if (!activity) {
      return res
        .status(200)
        .json({ ok: true, message: "Activity already deleted" });
    }

    if (!activity.aiReading) {
      return res.status(400).json({
        ok: false,
        message: "Activity is not an AI Reading activity",
        type: activity.flashCardActivity ? "FlashCardActivity" : "Unknown",
      });
    }

    // 2. Intentar eliminación directa (¡esto probablemente FALLARÁ!)
    const deletedActivity = await prisma.activity.delete({
      where: { id: activityId },
    });

    // 3. Si llegamos aquí, ¡funcionó!
    res.status(200).json({
      ok: true,
      message: "Activity deleted successfully (surprisingly!)",
      deletedActivity: {
        id: deletedActivity.id,
        title: deletedActivity.title,
        courseId: deletedActivity.courseId,
      },
    });
  } catch (error) {
    console.error("Simple delete error:", error);

    const response = {
      ok: false,
      error: "Delete failed",
      activityId,
      code: error.code,
      message: error.message,
    };

    res.status(500).json(response);
  }
};

//Attempts
export const createParaphraseAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      similarityScore,
      fluencyScore,
      originalityScore,
      feedback,
      timeSpentSec,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      similarityScore == null ||
      fluencyScore == null ||
      originalityScore == null ||
      timeSpentSec == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Calcular el averageScore redondeado a 2 decimales
    const averageScore = Number(
      ((similarityScore + fluencyScore + originalityScore) / 3).toFixed(2)
    );

    const attempt = await prisma.paraphraseAttempt.create({
      data: {
        aiReadingId,
        userId,
        similarityScore,
        fluencyScore,
        originalityScore,
        feedback,
        timeSpentSec,
        averageScore,
      },
    });

    return res.status(201).json({
      message: "Paraphrase attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create paraphrase attempt." });
  }
};
export const createMainIdeaAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      accuracyScore,
      clarityScore,
      concisenessScore,
      feedback,
      timeSpentSec,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      accuracyScore == null ||
      clarityScore == null ||
      concisenessScore == null ||
      timeSpentSec == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Calcular el averageScore redondeado a 2 decimales
    const averageScore = Number(
      ((accuracyScore + clarityScore + concisenessScore) / 3).toFixed(2)
    );

    const attempt = await prisma.mainIdeaAttempt.create({
      data: {
        aiReadingId,
        userId,
        accuracyScore,
        clarityScore,
        concisenessScore,
        feedback,
        timeSpentSec,
        averageScore,
      },
    });

    return res.status(201).json({
      message: "Main idea attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create main idea attempt." });
  }
};

export const createSummaryAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      accuracyScore,
      coverageScore,
      clarityScore,
      feedback,
      timeSpentSec,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      accuracyScore == null ||
      coverageScore == null ||
      clarityScore == null ||
      timeSpentSec == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const averageScore = Number(
      ((accuracyScore + coverageScore + clarityScore) / 3).toFixed(2)
    );

    const attempt = await prisma.summaryAttempt.create({
      data: {
        aiReadingId,
        userId,
        accuracyScore,
        coverageScore,
        clarityScore,
        feedback,
        timeSpentSec,
        averageScore,
      },
    });

    return res.status(201).json({
      message: "Summary attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create summary attempt." });
  }
};

export const createAIReadingAttempt = async (req, res) => {
  try {
    const { aiReadingId, timeSpentSec, playCount } = req.body;
    const userId = req.id;

    console.log(
      `Received AI Reading Attempt: aiReadingId=${aiReadingId}, timeSpentSec=${timeSpentSec}, playCount=${playCount}, userId=${userId}`
    );
    if (aiReadingId == null || !timeSpentSec == null || !playCount == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const readingAttempt = await prisma.aIReadingAttempt.create({
      data: {
        aiReadingId: aiReadingId,
        userId: userId,
        timeSpentSec: timeSpentSec,
        playCount: playCount,
      },
    });

    return res.status(201).json({
      message: "AI reading attempt created successfully.",
      data: readingAttempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create AI reading audio event." });
  }
};
