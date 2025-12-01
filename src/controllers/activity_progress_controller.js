import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createActivityProgress = async (req, res) => {
  const aiReadingId = parseInt(req.params.aiReadingId);
  const studentId = req.id;

  if (!aiReadingId) {
    return res.status(400).json({
      ok: false,
      message: "Reading identifier is required",
    });
  }

  try {
    const aiReading = await prisma.aIReading.findUnique({
      where: { id: aiReadingId },
    });

    if (!aiReading) {
      return res.status(404).json({
        ok: false,
        message: "Reading Activity not found",
      });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: aiReading.activityId },
      include: {
        course: true,
      },
    });

    const isEnrolled = await prisma.courseStudent.findFirst({
      where: {
        studentId: studentId,
        courseId: activity.courseId,
      },
    });

    if (!isEnrolled) {
      return res.status(403).json({
        ok: false,
        message: "User is not enrolled in this course",
      });
    }

    const existingProgress = await prisma.aIReadingSession.findUnique({
      where: {
        studentId_aiReadingId: {
          studentId: studentId,
          aiReadingId: aiReadingId,
        },
      },
    });

    if (existingProgress) {
      const formattedProgress = {
        progressId: existingProgress.id,
        activityId: activity.id,
        aiReadingId: existingProgress.aiReadingId,
        title: activity.title,
        description: activity.description,
        courseName: activity.course.name,
        completed: existingProgress.completed,
        totalProgress: existingProgress.totalProgress,
        totalScore: existingProgress.totalScore,
        hasScoring: activity.hasScoring,
        maxScore: activity.maxScore,
        dueDate: activity.dueDate,
        updatedAt: existingProgress.updatedAt,
        subactivitiesCompleted: {
          reading: existingProgress.readingCompleted,
          paraphrase: existingProgress.paraphraseCompleted,
          mainIdea: existingProgress.mainIdeaCompleted,
          summary: existingProgress.summaryCompleted,
        },
        subactivitiesCompletionRate: Math.round(
          ([
            existingProgress.readingCompleted,
            existingProgress.paraphraseCompleted,
            existingProgress.mainIdeaCompleted,
            existingProgress.summaryCompleted,
          ].filter(Boolean).length /
            4) *
            100
        ),
      };

      return res.status(200).json({
        ok: true,
        message: "Activity progress already exists",
        data: formattedProgress,
      });
    }

    const activityProgress = await prisma.aIReadingSession.create({
      data: {
        studentId: studentId,
        aiReadingId: aiReadingId,
        completed: false,
        totalProgress: 0,
        totalScore: 0,
        readingCompleted: false,
        paraphraseCompleted: false,
        mainIdeaCompleted: false,
        summaryCompleted: false,
      },
    });

    const formattedProgress = {
      progressId: activityProgress.id,
      activityId: activity.id,
      aiReadingId: activityProgress.aiReadingId,
      title: activity.title,
      description: activity.description,
      courseName: activity.course.name,
      completed: activityProgress.completed,
      totalProgress: activityProgress.totalProgress,
      totalScore: activityProgress.totalScore,
      hasScoring: activity.hasScoring,
      maxScore: activity.maxScore,
      dueDate: activity.dueDate,
      updatedAt: activityProgress.updatedAt,
      subactivitiesCompleted: {
        reading: activityProgress.readingCompleted,
        paraphrase: activityProgress.paraphraseCompleted,
        mainIdea: activityProgress.mainIdeaCompleted,
        summary: activityProgress.summaryCompleted,
      },
      subactivitiesCompletionRate: Math.round(
        ([
          activityProgress.readingCompleted,
          activityProgress.paraphraseCompleted,
          activityProgress.mainIdeaCompleted,
          activityProgress.summaryCompleted,
        ].filter(Boolean).length /
          4) *
          100
      ),
    };

    return res.status(200).json({
      ok: true,
      message: "Activity progress created successfully",
      data: formattedProgress,
    });
  } catch (error) {
    console.error("Error creating activity progress:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateActivityProgress = async (req, res) => {
  const aiReadingId = parseInt(req.params.aiReadingId);
  const studentId = req.id;

  const {
    readingCompleted, // Este campo es opcional
  } = req.body;

  try {
    const aiReading = await prisma.aIReading.findUnique({
      where: { id: aiReadingId },
    });

    if (!aiReading) {
      return res.status(404).json({
        ok: false,
        message: "Reading Activity not found",
      });
    }

    // Verificar que la actividad existe y obtener el courseId
    const activity = await prisma.activity.findUnique({
      where: { id: aiReading.activityId },
      include: {
        course: true,
      },
    });

    // Verificar que el usuario esté matriculado en el curso
    const isEnrolled = await prisma.courseStudent.findFirst({
      where: {
        studentId: studentId,
        courseId: activity.courseId,
      },
    });

    if (!isEnrolled) {
      return res.status(403).json({
        ok: false,
        message: "User is not enrolled in this course",
      });
    }

    const existingProgress = await prisma.aIReadingSession.findUnique({
      where: {
        studentId_aiReadingId: {
          studentId: studentId,
          aiReadingId: aiReadingId,
        },
      },
    });

    if (!existingProgress) {
      return res.status(404).json({
        ok: false,
        message: "Activity progress not found. Please create it first.",
      });
    }

    // Consultar los attempts con el MAYOR averageScore de cada tipo
    const [bestParaphrase, bestMainIdea, bestSummary] = await Promise.all([
      prisma.paraphraseAttempt.findFirst({
        where: {
          aiReadingId: aiReadingId,
          userId: studentId,
        },
        orderBy: {
          averageScore: "desc",
        },
      }),
      prisma.mainIdeaAttempt.findFirst({
        where: {
          aiReadingId: aiReadingId,
          userId: studentId,
        },
        orderBy: {
          averageScore: "desc",
        },
      }),
      prisma.summaryAttempt.findFirst({
        where: {
          aiReadingId: aiReadingId,
          userId: studentId,
        },
        orderBy: {
          averageScore: "desc",
        },
      }),
    ]);

    // Determinar valores automáticos basados en la existencia de attempts
    const autoParaphraseCompleted = !!bestParaphrase;
    const autoMainIdeaCompleted = !!bestMainIdea;
    const autoSummaryCompleted = !!bestSummary;

    // 1. readingCompleted: si viene en el body usamos ese valor, si no viene mantenemos el existente
    const finalReadingCompleted =
      readingCompleted !== undefined
        ? readingCompleted
        : existingProgress.readingCompleted;

    // Determinar si todas las actividades están completas
    const allCompleted =
      finalReadingCompleted &&
      autoParaphraseCompleted &&
      autoMainIdeaCompleted &&
      autoSummaryCompleted;

    // Calcular totalProgress automáticamente (25 por cada actividad completada)
    const completedActivitiesCount = [
      finalReadingCompleted,
      autoParaphraseCompleted,
      autoMainIdeaCompleted,
      autoSummaryCompleted,
    ].filter(Boolean).length;

    const autoTotalProgress = completedActivitiesCount * 25;

    // Calcular totalScore automáticamente (promedio de los MEJORES averageScore)
    let autoTotalScore = 0;

    // Recopilar los mejores scores de cada tipo
    const bestScores = [];
    if (bestParaphrase) bestScores.push(bestParaphrase.averageScore);
    if (bestMainIdea) bestScores.push(bestMainIdea.averageScore);
    if (bestSummary) bestScores.push(bestSummary.averageScore);

    if (bestScores.length > 0) {
      const sum = bestScores.reduce((acc, score) => acc + score, 0);
      autoTotalScore = Number((sum / bestScores.length).toFixed(2));
    }

    // Preparar datos para actualizar
    const updateData = {
      paraphraseCompleted: autoParaphraseCompleted,
      mainIdeaCompleted: autoMainIdeaCompleted,
      summaryCompleted: autoSummaryCompleted,
      totalProgress: autoTotalProgress,
      totalScore:
        bestScores.length > 0 ? autoTotalScore : existingProgress.totalScore,
    };

    // Solo actualizar readingCompleted si viene en el body
    if (readingCompleted !== undefined) {
      updateData.readingCompleted = readingCompleted;
    }

    // Si todas están completas, marcar como completed y establecer completedAt
    if (allCompleted) {
      updateData.completed = true;
      updateData.completedAt = new Date();
    } else {
      // Si no están todas completas, asegurarse que completed sea false
      updateData.completed = false;
      updateData.completedAt = null;
    }

    // Actualizar registro existente
    const activityProgress = await prisma.aIReadingSession.update({
      where: {
        studentId_aiReadingId: {
          studentId: studentId,
          aiReadingId: aiReadingId,
        },
      },
      data: updateData,
    });

    // Formatear la respuesta
    const formattedProgress = {
      progressId: activityProgress.id,
      activityId: activity.id,
      aiReadingId: activityProgress.aiReadingId,
      title: activity.title,
      description: activity.description,
      courseName: activity.course.name,
      completed: activityProgress.completed,
      totalProgress: activityProgress.totalProgress,
      totalScore: activityProgress.totalScore,
      hasScoring: activity.hasScoring,
      maxScore: activity.maxScore,
      dueDate: activity.dueDate,
      updatedAt: activityProgress.updatedAt,
      completedAt: activityProgress.completedAt,
      subactivitiesCompleted: {
        reading: activityProgress.readingCompleted,
        paraphrase: activityProgress.paraphraseCompleted,
        mainIdea: activityProgress.mainIdeaCompleted,
        summary: activityProgress.summaryCompleted,
      },
      subactivitiesCompletionRate: Math.round(
        ([
          activityProgress.readingCompleted,
          activityProgress.paraphraseCompleted,
          activityProgress.mainIdeaCompleted,
          activityProgress.summaryCompleted,
        ].filter(Boolean).length /
          4) *
          100
      ),
    };

    return res.status(200).json({
      ok: true,
      message: "Activity progress updated successfully",
      data: formattedProgress,
    });
  } catch (error) {
    console.error("Error updating activity progress:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllActivityProgresses = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, lastName: true },
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Obtener todos los progress del usuario con información anidada:
    // activityProgress -> aiReading -> activity -> course
    const activityProgresses = await prisma.aIReadingSession.findMany({
      where: {
        studentId: userId,
      },
      include: {
        aiReading: {
          include: {
            activity: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Formatear la respuesta
    const formattedProgresses = activityProgresses.map((progress) => {
      const aiReading = progress.aiReading || null;
      const activity = aiReading?.activity || null;
      const course = activity?.course || null;

      const subReading = !!progress.readingCompleted;
      const subParaphrase = !!progress.paraphraseCompleted;
      const subMainIdea = !!progress.mainIdeaCompleted;
      const subSummary = !!progress.summaryCompleted;

      const completedCount = [
        subReading,
        subParaphrase,
        subMainIdea,
        subSummary,
      ].filter(Boolean).length;

      const progressData = {
        progressId: progress.id,
        // activityId: si quieres el id de Activity (no del aiReading)
        activityId: activity?.id ?? null,
        aiReadingId: aiReading.id,
        title: activity?.title ?? null,
        description: activity?.description ?? null,
        courseName: course?.name ?? null,
        completed: !!progress.completed,
        totalProgress: progress.totalProgress ?? 0,
        totalScore: progress.totalScore ?? 0,
        hasScoring: activity?.hasScoring ?? false,
        maxScore: activity?.maxScore ?? null,
        dueDate: activity?.dueDate ? activity.dueDate.toISOString() : null,
        updatedAt: progress.updatedAt ? progress.updatedAt.toISOString() : null,
        subactivitiesCompleted: {
          reading: subReading,
          paraphrase: subParaphrase,
          mainIdea: subMainIdea,
          summary: subSummary,
        },
        subactivitiesCompletionRate: Math.round((completedCount / 4) * 100),
      };

      return progressData;
    });

    // Calcular promedio de TODOS los totalScore sin filtrar
    let averageScore = 0;
    if (formattedProgresses.length > 0) {
      const totalScores = formattedProgresses.reduce((sum, activity) => {
        return sum + (Number(activity.totalScore) || 0);
      }, 0);
      averageScore =
        Math.round((totalScores / formattedProgresses.length) * 100) / 100; // 2 decimales
    }

    return res.status(200).json({
      ok: true,
      message: "Activity progresses retrieved successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          fullName: `${user.name} ${user.lastName}`,
        },
        progresses: formattedProgresses,
        statistics: {
          total: formattedProgresses.length,
          completed: formattedProgresses.filter((p) => p.completed).length,
          inProgress: formattedProgresses.filter(
            (p) => !p.completed && p.totalProgress > 0
          ).length,
          notStarted: formattedProgresses.filter((p) => p.totalProgress === 0)
            .length,
          averageScore: averageScore,
          totalActivitiesWithScoring: formattedProgresses.filter(
            (p) => p.hasScoring
          ).length,
          completionRate:
            formattedProgresses.length > 0
              ? Math.round(
                  (formattedProgresses.filter((p) => p.completed).length /
                    formattedProgresses.length) *
                    100
                )
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving activity progresses:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
