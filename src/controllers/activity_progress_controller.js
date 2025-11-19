import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createActivityProgress = async (req, res) => {
  const aiReadingId = parseInt(req.params.aiReadingId);
  const studentId = req.id;

  const {
    completed,
    totalProgress,
    totalScore,
    readingCompleted,
    paraphraseCompleted,
    mainIdeaCompleted,
    summaryCompleted,
  } = req.body;

  // Validar datos requeridos para creación
  if (
    completed === undefined ||
    totalProgress === undefined ||
    totalScore === undefined
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "completed, totalProgress, and totalScore are required for creation",
    });
  }

  try {
    // Verificar que la actividad existe y obtener el courseId
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

    // Verificar si ya existe un progress para esta actividad y estudiante
    const existingProgress = await prisma.activityProgress.findUnique({
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

    // CREAR nuevo registro de progreso (solo si no existe)
    const activityProgress = await prisma.activityProgress.create({
      data: {
        studentId: studentId,
        aiReadingId: aiReadingId,
        completed: completed,
        totalProgress: totalProgress,
        totalScore: totalScore,
        readingCompleted: readingCompleted || false,
        paraphraseCompleted: paraphraseCompleted || false,
        mainIdeaCompleted: mainIdeaCompleted || false,
        summaryCompleted: summaryCompleted || false,
      },
    });

    // Formatear la respuesta según la estructura requerida
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
    completed,
    totalProgress,
    totalScore,
    readingCompleted,
    paraphraseCompleted,
    mainIdeaCompleted,
    summaryCompleted,
  } = req.body;

  // Validar que al menos un campo venga para actualizar
  if (
    completed === undefined &&
    totalProgress === undefined &&
    totalScore === undefined &&
    readingCompleted === undefined &&
    paraphraseCompleted === undefined &&
    mainIdeaCompleted === undefined &&
    summaryCompleted === undefined
  ) {
    return res.status(400).json({
      ok: false,
      message: "At least one field is required for update",
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

    // Verificar que el progress exista antes de actualizar
    const existingProgress = await prisma.activityProgress.findUnique({
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

    // Preparar datos para actualizar (solo los campos que vinieron)
    const updateData = {};
    if (completed !== undefined) updateData.completed = completed;
    if (totalProgress !== undefined) updateData.totalProgress = totalProgress;
    if (totalScore !== undefined) updateData.totalScore = totalScore;
    if (readingCompleted !== undefined)
      updateData.readingCompleted = readingCompleted;
    if (paraphraseCompleted !== undefined)
      updateData.paraphraseCompleted = paraphraseCompleted;
    if (mainIdeaCompleted !== undefined)
      updateData.mainIdeaCompleted = mainIdeaCompleted;
    if (summaryCompleted !== undefined)
      updateData.summaryCompleted = summaryCompleted;

    // ACTUALIZAR registro existente con include para obtener datos relacionados
    const activityProgress = await prisma.activityProgress.update({
      where: {
        studentId_aiReadingId: {
          studentId: studentId,
          aiReadingId: aiReadingId,
        },
      },
      data: updateData,
    });

    // Formatear la respuesta según la estructura requerida
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
    const activityProgresses = await prisma.activityProgress.findMany({
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
