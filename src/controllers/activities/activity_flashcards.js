import { PrismaClient } from "@prisma/client";
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
    return res.status(201).json({
      success: true,
      message: "FlashCard activity created successfully",
      data: {
        id: result.flashCardActivity.id,
        activityId: result.activity.id,
        title: result.activity.title,
        description: result.activity.description,
        maxCards: result.flashCardActivity.maxCards,
        cardOrder: result.flashCardActivity.cardOrder,
        course: result.flashCardActivity.activity.course.name,
        teacher: `${result.flashCardActivity.activity.course.teacher.name} ${result.flashCardActivity.activity.course.teacher.lastName}`,
        createdAt: result.flashCardActivity.createdAt,
      },
    });
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
