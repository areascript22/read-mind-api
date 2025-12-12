import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createActivityProgress = async (req, res) => {
  const aiReadingId = parseInt(req.params.aiReadingId);
  const studentId = req.id;
  console.log(
    "Creating activity progress for AI Reading ID:",
    aiReadingId,
    "and Student ID:",
    studentId
  );

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
        type: "aiReadingProgress",
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
      type: "aiReadingProgress",
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
    if (readingCompleted === true) bestScores.push(25);
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
      type: "aiReadingProgress",
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
  const courseId = parseInt(req.params.courseId);

  try {
    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({
        ok: false,
        message: "Valid courseId is required in URL parameters",
      });
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        ok: false,
        message: "Valid userId is required in URL parameters",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!courseExists) {
      return res.status(404).json({
        ok: false,
        message: "Course not found",
      });
    }

    const totalActivities = await prisma.activity.count({
      where: {
        courseId: courseId,
      },
    });

    const completedAIReadingSessions = await prisma.aIReadingSession.count({
      where: {
        studentId: userId,
        completed: true,
        aiReading: {
          activity: {
            courseId: courseId,
          },
        },
      },
    });

    const completedFlashCardSessions = await prisma.flashCardSession.count({
      where: {
        studentId: userId,
        completedAt: {
          not: null,
        },
        flashCardActivity: {
          activity: {
            courseId: courseId,
          },
        },
      },
    });

    const totalCompleted =
      completedAIReadingSessions + completedFlashCardSessions;
    const totalUncompleted = totalActivities - totalCompleted;

    const activityProgresses = await prisma.aIReadingSession.findMany({
      where: {
        studentId: userId,
        aiReading: {
          activity: {
            courseId: courseId,
          },
        },
      },
      include: {
        aiReading: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                hasScoring: true,
                maxScore: true,
                dueDate: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // CAMBIO PRINCIPAL: Obtener FlashCardActivities que tengan al menos una sesión
    const flashCardActivities = await prisma.flashCardActivity.findMany({
      where: {
        activity: {
          courseId: courseId,
        },
        sessions: {
          some: {
            studentId: userId, // Al menos una sesión de este usuario
          },
        },
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            description: true,
            hasScoring: true,
            maxScore: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        // Incluimos algunas estadísticas agregadas de todas las sesiones del usuario
        sessions: {
          where: {
            studentId: userId,
          },
          select: {
            completedAt: true,
            totalTimeSec: true,
            cardsCompleted: true,
            correctAnswers: true,
            incorrectAnswers: true,
            score: true,
            startedAt: true,
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReadingProgresses = activityProgresses.map((progress) => {
      const activity = progress.aiReading?.activity || null;

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

      return {
        progressId: progress.id,
        type: "aiReadingProgress",
        activityId: activity?.id ?? null,
        aiReadingId: progress.aiReadingId,
        title: activity?.title ?? "AI Reading Activity",
        description: activity?.description ?? "Practice reading comprehension",
        completed: !!progress.completed,
        totalProgress: progress.totalProgress ?? 0,
        totalScore: progress.totalScore ?? 0,
        hasScoring: activity?.hasScoring ?? false,
        maxScore: activity?.maxScore ?? null,
        dueDate: activity?.dueDate ? activity.dueDate.toISOString() : null,
        updatedAt: progress.updatedAt ? progress.updatedAt.toISOString() : null,
        startedAt: progress.createdAt.toISOString(),
        completedAt: progress.completedAt
          ? progress.completedAt.toISOString()
          : null,
        subactivitiesCompleted: {
          reading: subReading,
          paraphrase: subParaphrase,
          mainIdea: subMainIdea,
          summary: subSummary,
        },
        subactivitiesCompletionRate: Math.round((completedCount / 4) * 100),
        metadata: {
          readingLength: progress.aiReading?.length || "Medium",
          complexity: progress.aiReading?.complexity || "B1",
          style: progress.aiReading?.style || "Academic",
        },
      };
    });

    // CAMBIO: Formatear FlashCardActivities en lugar de FlashCardSessions
    const formattedFlashCardProgresses = flashCardActivities.map((activity) => {
      const baseActivity = activity.activity || null;

      // Calcular estadísticas agregadas de todas las sesiones del usuario
      const totalSessions = activity.sessions.length;
      const completedSessions = activity.sessions.filter(
        (s) => s.completedAt !== null
      ).length;

      let totalAttempts = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalTimeSec = 0;
      let totalScore = 0;
      let latestSession = null;

      // NUEVO: Encontrar la sesión con el mejor score
      let bestScore = 0;
      let bestSession = null;

      if (totalSessions > 0) {
        activity.sessions.forEach((session) => {
          totalAttempts += session.cardsCompleted || 0;
          totalCorrect += session.correctAnswers || 0;
          totalIncorrect += session.incorrectAnswers || 0;
          totalTimeSec += session.totalTimeSec || 0;
          totalScore += session.score || 0;

          // Encontrar el mejor score
          const sessionScore = session.score || 0;
          if (sessionScore > bestScore) {
            bestScore = sessionScore;
            bestSession = session;
          } else if (sessionScore === bestScore && bestSession) {
            // Si hay empate en score, tomar el más reciente por completedAt
            const currentCompletedAt = session.completedAt;
            const bestCompletedAt = bestSession.completedAt;

            if (currentCompletedAt && bestCompletedAt) {
              if (currentCompletedAt > bestCompletedAt) {
                bestSession = session;
              }
            } else if (currentCompletedAt && !bestCompletedAt) {
              // Preferir sesiones completadas sobre no completadas
              bestSession = session;
            }
          }
        });

        // Obtener la sesión más reciente
        latestSession = activity.sessions[0]; // Ya están ordenadas por startedAt desc
      }

      const accuracy =
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0;

      const avgScore =
        totalSessions > 0
          ? Math.round((totalScore / totalSessions) * 100) / 100
          : 0;

      const avgTimePerCard =
        totalAttempts > 0 ? Math.round(totalTimeSec / totalAttempts) : 0;

      return {
        id: baseActivity.id,
        flashCardActivityId: activity.id,
        type: "flashCardProgress",
        activityId: baseActivity?.id ?? null,
        title: baseActivity?.title ?? "Flash Cards",
        description:
          baseActivity?.description ?? "Practice vocabulary with flashcards",
        cardOrder: activity.cardOrder || "Random",
        maxCards: activity.maxCards || 10,
        // Información de completitud basada en sesiones
        hasAnySession: totalSessions > 0,
        totalSessions: totalSessions,
        completedSessions: completedSessions,
        // NUEVO: Campo con el mejor score
        totalScore: bestScore,
        // NUEVO: Información del mejor intento
        bestSession: bestSession
          ? {
              startedAt: bestSession.startedAt.toISOString(),
              completedAt: bestSession.completedAt
                ? bestSession.completedAt.toISOString()
                : null,
              isCompleted: !!bestSession.completedAt,
              score: bestSession.score || 0,
              cardsCompleted: bestSession.cardsCompleted || 0,
              correctAnswers: bestSession.correctAnswers || 0,
              incorrectAnswers: bestSession.incorrectAnswers || 0,
              totalTimeSec: bestSession.totalTimeSec || 0,
            }
          : null,
        // Si hay sesión más reciente, mostrar sus datos
        latestSession: latestSession
          ? {
              startedAt: latestSession.startedAt.toISOString(),
              completedAt: latestSession.completedAt
                ? latestSession.completedAt.toISOString()
                : null,
              isCompleted: !!latestSession.completedAt,
            }
          : null,
        hasScoring: baseActivity?.hasScoring ?? false,
        maxScore: baseActivity?.maxScore ?? null,
        dueDate: baseActivity?.dueDate
          ? baseActivity.dueDate.toISOString()
          : null,
        createdAt: baseActivity?.createdAt
          ? baseActivity.createdAt.toISOString()
          : null,
        updatedAt: baseActivity?.updatedAt
          ? baseActivity.updatedAt.toISOString()
          : null,
        // Estadísticas agregadas
        aggregatedStats: {
          totalAttempts: totalAttempts,
          correctAnswers: totalCorrect,
          incorrectAnswers: totalIncorrect,
          accuracy: accuracy,
          totalTimeSec: totalTimeSec,
          avgTimePerCard: avgTimePerCard,
          avgScore: avgScore,
        },
      };
    });

    const allProgresses = [
      ...formattedReadingProgresses,
      ...formattedFlashCardProgresses,
    ].sort((a, b) => {
      const dateA = new Date(b.updatedAt || b.startedAt || b.createdAt);
      const dateB = new Date(a.updatedAt || a.startedAt || a.createdAt);
      return dateA - dateB;
    });

    const inProgressCount = allProgresses.filter(
      (p) =>
        !p.completed &&
        (p.totalProgress > 0 ||
          (p.type === "flashCardActivity" && p.hasAnySession))
    ).length;

    const notStartedCount = allProgresses.filter((p) =>
      p.type === "aiReadingProgress" ? p.totalProgress === 0 : !p.hasAnySession
    ).length;

    let averageReadingScore = 0;
    if (formattedReadingProgresses.length > 0) {
      const totalScores = formattedReadingProgresses.reduce((sum, activity) => {
        return sum + (Number(activity.totalScore) || 0);
      }, 0);
      averageReadingScore =
        Math.round((totalScores / formattedReadingProgresses.length) * 100) /
        100;
    }

    let averageFlashCardAccuracy = 0;
    if (formattedFlashCardProgresses.length > 0) {
      const totalAccuracy = formattedFlashCardProgresses.reduce(
        (sum, activity) => {
          return sum + (Number(activity.aggregatedStats?.accuracy) || 0);
        },
        0
      );
      averageFlashCardAccuracy = Math.round(
        totalAccuracy / formattedFlashCardProgresses.length
      );
    }

    return res.status(200).json({
      ok: true,
      message: "Activity progresses retrieved successfully",
      data: {
        allProgresses: allProgresses,
        statistics: {
          total: totalActivities,
          completed: totalCompleted,
          uncompleted: totalUncompleted,
          inProgress: inProgressCount,
          notStarted: notStartedCount,
          averageScore: averageReadingScore,
          completionRate:
            totalActivities > 0
              ? Math.round((totalCompleted / totalActivities) * 100)
              : 0,
          byType: {
            aiReading: {
              total: formattedReadingProgresses.length,
              completed: completedAIReadingSessions,
              inProgress: formattedReadingProgresses.filter(
                (p) => !p.completed && p.totalProgress > 0
              ).length,
              averageScore: averageReadingScore,
            },
            flashCard: {
              total: formattedFlashCardProgresses.length,
              // Cambio: Contar actividades con al menos una sesión completada
              completed: formattedFlashCardProgresses.filter(
                (p) => p.completedSessions > 0
              ).length,
              inProgress: formattedFlashCardProgresses.filter(
                (p) => p.hasAnySession && p.completedSessions === 0
              ).length,
              averageAccuracy: averageFlashCardAccuracy,
            },
          },
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
