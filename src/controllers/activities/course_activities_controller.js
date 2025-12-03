import { PrismaClient } from "@prisma/client";
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

    return res.status(201).json({
      ok: true,
      message: "AIReading activity created successfully",
      data: responseBody,
    });
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
  try {
    const courseId = parseInt(req.params.idCourse);
    const userId = req.user?.id; // Asumiendo que tienes el usuario autenticado en req.user

    // Obtener actividades con sus detalles
    const activities = await prisma.activity.findMany({
      where: { courseId },
      include: {
        aiReading: true,
        flashCardActivity: true,
      },
    });

    // Formatear las actividades con los nuevos campos
    const formattedActivities = await Promise.all(
      activities.map(async (activity) => {
        let type = null;
        let details = null;
        let totalScore = null; // Para AIReading
        let bestScore = null; // Para FlashCard

        if (activity.aiReading) {
          type = "aIReading";

          // Obtener el registro de AIReadingSession para este usuario y actividad
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

          // Asignar totalScore si existe el registro, de lo contrario null
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

          // Obtener todas las sesiones de FlashCard para este usuario y actividad
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
          // Agregar los nuevos campos
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

export const deleteActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);

    // Verificar que la actividad exista
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Eliminar la actividad
    await prisma.activity.delete({
      where: { id: activityId },
    });

    return res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting activity",
    });
  }
};

export const updateAIReading = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);
    const { content } = req.body;

    const aiReading = await prisma.aIReading.findUnique({
      where: { activityId },
    });

    if (!aiReading) {
      return res.status(404).json({
        success: false,
        message: "AIReading not found for this activity",
      });
    }

    const updatedAIReading = await prisma.aIReading.update({
      where: { activityId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "AIReading updated successfully",
      data: updatedAIReading,
    });
  } catch (error) {
    console.error("Error updating AIReading:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
