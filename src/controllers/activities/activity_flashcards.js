import { PrismaClient } from "@prisma/client";
import {
  NotificationChannelsIds,
  notifyStudentsOfCourse,
} from "../../helpers/push_notifications_helper.js";
const prisma = new PrismaClient();

export const createFlashCards = async (req, res) => {
  try {
    const courseId = parseInt(req.params.idCourse);
    const {
      title,
      description,
      dueDate,
      hasScoring,
      maxScore,
      maxCards,
      cardOrder, //Random
    } = req.body;

    // Validar campos requeridos
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title are required",
      });
    }

    // Validar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Validar que el usuario es teacher del curso
    const isTeacher = await prisma.course.findFirst({
      where: {
        id: parseInt(courseId),
        teacherId: req.id, // Asumiendo que tienes el user en el request
      },
    });

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: "Only course teachers can create activities",
      });
    }

    // Validar flashCardSettings
    if (!maxCards || !cardOrder) {
      return res.status(400).json({
        success: false,
        message: "FlashCard settings are required",
      });
    }

    // Validar cardOrder
    const validCardOrders = ["Random", "Sequential"];
    if (!validCardOrders.includes(cardOrder)) {
      return res.status(400).json({
        success: false,
        message: 'cardOrder must be either "Random" or "Sequential"',
      });
    }

    // Validar maxCards
    if (maxCards < 1 || maxCards > 50) {
      return res.status(400).json({
        success: false,
        message: "maxCards must be between 1 and 50",
      });
    }

    if (hasScoring && (!maxScore || maxScore <= 0)) {
      return res.status(400).json({
        ok: false,
        message: "maxScore is required when hasScoring is true",
      });
    }

    // Crear la actividad con transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la Activity principal
      const activity = await tx.activity.create({
        data: {
          courseId: parseInt(courseId),
          title: title.trim(),
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          hasScoring: hasScoring || false,
          maxScore: hasScoring ? maxScore : null,
        },
      });

      // 2. Crear la FlashCardActivity relacionada
      const flashCardActivity = await tx.flashCardActivity.create({
        data: {
          activityId: activity.id,
          maxCards: parseInt(maxCards),
          cardOrder: cardOrder,
        },
        include: {
          activity: {
            include: {
              course: {
                select: {
                  name: true,
                  teacher: {
                    select: {
                      name: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return { activity, flashCardActivity };
    });

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "FlashCard activity created successfully",
      data: {
        type: "flashCard",
        id: result.flashCardActivity.id,
        activityId: result.activity.id,
        title: result.activity.title,
        description: result.activity.description,
        maxCards: result.flashCardActivity.maxCards,
        cardOrder: result.flashCardActivity.cardOrder,
        course: result.flashCardActivity.activity.course.name,
        teacher: `${result.flashCardActivity.activity.course.teacher.name} ${result.flashCardActivity.activity.course.teacher.lastName}`,
        createdAt: result.flashCardActivity.createdAt,
        updatedAt: result.flashCardActivity.updatedAt,
        dueDate: result.activity.dueDate,
        hasScoring: result.activity.hasScoring,
        cardOrder: result.flashCardActivity.cardOrder,
        maxScore: result.activity.maxScore,
        flashCardActivityId: result.flashCardActivity.id,
      },
    });

    notifyStudentsOfCourse(
      courseId,
      {},
      NotificationChannelsIds.Activity_ALERTS,
      {
        professorName: `${req.userName} ${req.userLastName}`,
        activityTitle: result.activity.title,
      }
    );
  } catch (error) {
    console.error("Error creating flashcard activity:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Activity with similar configuration already exists",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid course reference",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const startFlashCardSession = async (req, res) => {
  try {
    const { activityId } = req.params;
    const studentId = req.id;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) },
      include: {
        flashCardActivity: true,
        course: {
          include: {
            students: {
              where: { studentId: studentId },
            },
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (!activity.flashCardActivity) {
      return res.status(400).json({
        success: false,
        message: "This activity is not a FlashCard activity",
      });
    }

    if (activity.course.students.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    const activeSession = await prisma.flashCardSession.findFirst({
      where: {
        flashCardActivityId: activity.flashCardActivity.id,
        studentId: studentId,
        completedAt: null,
      },
      include: {
        cardAttempts: {
          select: {
            isCorrect: true,
          },
        },
      },
    });

    let closedPreviousSession = null;

    if (activeSession) {
      const attempts = activeSession.cardAttempts;
      const cardsCompleted = attempts.length;
      const correctAnswers = attempts.filter(
        (attempt) => attempt.isCorrect === true
      ).length;
      const incorrectAnswers = attempts.filter(
        (attempt) => attempt.isCorrect === false
      ).length;

      const now = new Date();
      const startedAt = new Date(activeSession.startedAt);
      const totalTimeSec = Math.floor((now - startedAt) / 1000);
      closedPreviousSession = await prisma.flashCardSession.update({
        where: { id: activeSession.id },
        data: {
          completedAt: now,
          totalTimeSec: totalTimeSec,
          cardsCompleted: cardsCompleted,
          correctAnswers: correctAnswers,
          incorrectAnswers: incorrectAnswers,
        },
        include: {
          cardAttempts: {
            orderBy: { createdAt: "asc" },
            include: {
              userTranslation: {
                include: {
                  translation: {
                    select: {
                      sourceText: true,
                      translated: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    const newSession = await prisma.flashCardSession.create({
      data: {
        flashCardActivityId: activity.flashCardActivity.id,
        studentId: studentId,
        startedAt: new Date(),
      },
      include: {
        flashCardActivity: {
          include: {
            activity: {
              select: {
                title: true,
                description: true,
                maxScore: true,
              },
            },
          },
        },
      },
    });

    const availableTranslations = await prisma.userTranslation.findMany({
      where: {
        userId: studentId,
      },
      include: {
        translation: {
          select: {
            sourceText: true,
            sourceLang: true,
            targetLang: true,
          },
        },
      },
      take: activity.flashCardActivity.maxCards || 10,
    });

    const response = {
      success: true,
      message: "FlashCard session started successfully",
      data: {
        newSession,
        availableCards: availableTranslations.map((ut) => ({
          userTranslationId: ut.id,
          sourceText: ut.translation.sourceText,
          sourceLang: ut.translation.sourceLang,
          targetLang: ut.translation.targetLang,
          createdAt: ut.createdAt,
        })),
      },
    };

    if (closedPreviousSession) {
      response.data.previousSessionClosed = {
        sessionId: closedPreviousSession.id,
        startedAt: closedPreviousSession.startedAt,
        completedAt: closedPreviousSession.completedAt,
        totalTimeSec: closedPreviousSession.totalTimeSec,
        cardsCompleted: closedPreviousSession.cardsCompleted,
        correctAnswers: closedPreviousSession.correctAnswers,
        incorrectAnswers: closedPreviousSession.incorrectAnswers,
        summary: {
          totalCards: closedPreviousSession.cardsCompleted,
          accuracy:
            closedPreviousSession.cardsCompleted > 0
              ? (
                  (closedPreviousSession.correctAnswers /
                    closedPreviousSession.cardsCompleted) *
                  100
                ).toFixed(1)
              : 0,
          totalTime: closedPreviousSession.totalTimeSec,
        },
      };

      response.message =
        "Previous session closed and new FlashCard session started successfully";
    }
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error starting flashcard session:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid activity or student reference",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const completeFlashCardSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.id;

    const session = await prisma.flashCardSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: studentId,
      },
      include: {
        flashCardActivity: {
          include: {
            activity: true,
          },
        },
        cardAttempts: {
          select: {
            isCorrect: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    // CALCULAR MÉTRICAS DESDE FLASHCARDATTEMPT
    const attempts = session.cardAttempts;
    const cardsCompleted = attempts.length;
    const maxCards = session.flashCardActivity.maxCards;

    // Contar attempts correctos e incorrectos
    const correctAnswers = attempts.filter(
      (attempt) => attempt.isCorrect === true
    ).length;
    const incorrectAnswers = attempts.filter(
      (attempt) => attempt.isCorrect === false
    ).length;

    const now = new Date();
    const startedAt = new Date(session.startedAt);
    const totalTimeSec = Math.floor((now - startedAt) / 1000);

    // CALCULAR EL SCORE BASADO EN LA LÓGICA PROPUESTA
    let finalScore = 0;

    if (maxCards > 0) {
      // Calcular el porcentaje de respuestas correctas respecto al total de cards
      const accuracyRate = correctAnswers / maxCards;
      finalScore = Math.round(accuracyRate * 100); // Score de 0 a 100
    }

    const updatedSession = await prisma.flashCardSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        completedAt: now,
        totalTimeSec: totalTimeSec,
        cardsCompleted: cardsCompleted,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        score: finalScore, // ← AQUÍ SE AGREGA EL SCORE CALCULADO
      },
      include: {
        cardAttempts: {
          orderBy: { createdAt: "asc" },
          include: {
            userTranslation: {
              include: {
                translation: {
                  select: {
                    sourceText: true,
                    translated: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calcular score final si la actividad tiene scoring
    let finalScoreOld = null;
    if (
      session.flashCardActivity.activity.hasScoring &&
      session.flashCardActivity.activity.maxScore
    ) {
      if (cardsCompleted > 0) {
        const accuracy = correctAnswers / cardsCompleted;
        finalScoreOld = Math.round(
          accuracy * session.flashCardActivity.activity.maxScore
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "FlashCard session completed successfully",
      data: {
        updatedSession,
        summary: {
          totalCards: cardsCompleted,
          accuracy:
            cardsCompleted > 0
              ? ((correctAnswers / cardsCompleted) * 100).toFixed(1)
              : 0,
          totalTime: totalTimeSec,
          // Métricas adicionales útiles
          uniqueCards: new Set(
            updatedSession.cardAttempts.map((a) => a.userTranslationId)
          ).size,
          averageTimePerCard:
            cardsCompleted > 0 ? (totalTimeSec / cardsCompleted).toFixed(1) : 0,
        },
        // Datos detallados para análisis
        attemptsSummary: {
          total: cardsCompleted,
          correct: correctAnswers,
          incorrect: incorrectAnswers,
          accuracyPercentage:
            cardsCompleted > 0
              ? ((correctAnswers / cardsCompleted) * 100).toFixed(1)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error completing flashcard session:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const createFlashCardAttempt = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userTranslationId, userAnswer, timeSpentSec, isCorrect } = req.body;

    const studentId = req.id;

    // Validaciones básicas
    if (
      !userTranslationId ||
      !userAnswer ||
      timeSpentSec === undefined ||
      isCorrect === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userTranslationId, userAnswer, timeSpentSec and is correct are required",
      });
    }

    // Validar que la sesión existe y pertenece al estudiante
    const session = await prisma.flashCardSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: studentId,
      },
      include: {
        flashCardActivity: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or access denied",
      });
    }

    // Validar que la sesión no esté completada
    if (session.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Cannot add attempts to a completed session",
      });
    }

    // Validar que el userTranslation existe y pertenece al estudiante
    const userTranslation = await prisma.userTranslation.findFirst({
      where: {
        id: userTranslationId,
        userId: studentId,
      },
      include: {
        translation: true,
      },
    });

    if (!userTranslation) {
      return res.status(404).json({
        success: false,
        message: "User translation not found or access denied",
      });
    }

    // Crear el attempt usando transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el attempt
      const attempt = await tx.flashCardAttempt.create({
        data: {
          sessionId: parseInt(sessionId),
          userTranslationId: userTranslationId,
          userAnswer: String(userAnswer).trim(),
          isCorrect: isCorrect,
          timeSpentSec: parseInt(timeSpentSec),
        },
        include: {
          userTranslation: {
            include: {
              translation: {
                select: {
                  sourceText: true,
                  translated: true,
                  sourceLang: true,
                  targetLang: true,
                },
              },
            },
          },
        },
      });

      // 2. Actualizar los contadores de la sesión
      await tx.flashCardSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          cardsCompleted: { increment: 1 },
          correctAnswers: isCorrect ? { increment: 1 } : undefined,
          incorrectAnswers: !isCorrect ? { increment: 1 } : undefined,
          // Opcional: actualizar confidenceScore promedio
          // confidenceScore: await calculateNewConfidenceScore(sessionId)
        },
      });

      return attempt;
    });

    return res.status(201).json({
      success: true,
      message: "FlashCard attempt recorded successfully",
      data: {
        attempt: result,
        card: {
          sourceText: result.userTranslation.translation.sourceText,
          correctAnswer: result.userTranslation.translation.translated,
          sourceLang: result.userTranslation.translation.sourceLang,
          targetLang: result.userTranslation.translation.targetLang,
        },
        feedback: {
          isCorrect: result.isCorrect,
          message: result.isCorrect
            ? "Correct! Well done!"
            : `Try again. This was attempt`,
        },
      },
    });
  } catch (error) {
    console.error("Error creating flashcard attempt:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid session or user translation reference",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateFlashCardActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);
    const { title, description, dueDate, maxCards, cardOrder } = req.body;

    // Validación mejorada
    if (!title || !description || !dueDate || maxCards === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, description, dueDate, and maxCards are required",
      });
    }

    // Buscar la actividad con su relación flashCardActivity
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        flashCardActivity: true, // Incluir la relación
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const isFlashCardActivity = activity.flashCardActivity;
    if (!isFlashCardActivity) {
      return res.status(400).json({
        ok: false,
        message: "This activity is not a FlashCard activity",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar Activity
      const updatedActivity = await tx.activity.update({
        where: { id: activityId },
        data: {
          title: title.trim(),
          description: description.trim(),
          dueDate: new Date(dueDate),
          updatedAt: new Date(),
        },
      });

      const updatedFlashCardActivity = await tx.flashCardActivity.update({
        where: { activityId: activityId },
        data: {
          maxCards: parseInt(maxCards),
          updatedAt: new Date(),
        },
      });
      return { updatedActivity, updatedFlashCardActivity };
    });

    let formattedResponse = {
      type: "flashCard",
      id: result.updatedActivity.id,
      courseId: result.updatedActivity.courseId,
      title: result.updatedActivity.title,
      description: result.updatedActivity.description,
      dueDate: result.updatedActivity.dueDate,
      hasScoring: result.updatedActivity.hasScoring,
      maxScore: result.updatedActivity.maxScore,
      createdAt: result.updatedActivity.createdAt,
      updatedAt: result.updatedActivity.updatedAt,

      flashCardActivityId: result.updatedFlashCardActivity.id,
      maxCards: result.updatedFlashCardActivity.maxCards,
      cardOrder: result.updatedFlashCardActivity.cardOrder,
    };

    return res.status(200).json({
      ok: true,
      message: "FlashCard activity updated successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error updating flash card activity:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "FlashCard activity not found",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar datos",
      error: error.message,
    });
  }
};

export const isActivityOverDue = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);

    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activityId" });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { dueDate: true },
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Si no tiene fecha de entrega, no puede estar vencida
    if (!activity.dueDate) {
      return res.json({ isOverdue: false });
    }

    console.log("Due date saved: ", activity.dueDate, "Now: ", new Date());

    const now = new Date(); // UTC
    const isOverdue = activity.dueDate < now;
    console.log("Is overdue:", isOverdue);

    return res.json({ ok: true, isOverdue: isOverdue });
  } catch (error) {
    console.error("Error checking overdue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFlashCardActivity = async (req, res) => {
  const activityId = parseInt(req.params.activityId);

  if (isNaN(activityId)) {
    return res.status(400).json({ ok: false, message: "Invalid activity ID" });
  }

  try {
    // 1. Verificar que existe y es una FlashCardActivity
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        aiReading: {
          select: { id: true },
        },
        flashCardActivity: {
          select: { id: true },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!activity) {
      return res
        .status(200)
        .json({ ok: true, message: "Activity already deleted" });
    }

    if (!activity.flashCardActivity) {
      return res.status(400).json({
        ok: false,
        message: "Activity is not a FlashCard activity",
        type: activity.aiReading ? "AIReading" : "Unknown",
      });
    }

    // 3. Eliminación directa (cascade debería manejar todo)
    const deletedActivity = await prisma.activity.delete({
      where: { id: activityId },
    });

    // 4. Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "FlashCard activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete FlashCard activity error:", error);

    const response = {
      okfalse,
      activityId,
      code: error.code,
      message: error.message,
    };
    res.status(500).json(response);
  }
};
