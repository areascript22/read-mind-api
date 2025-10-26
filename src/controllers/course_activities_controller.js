import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAIReading = async (req, res) => {
  const courseId = parseInt(req.params.idCourse);
  const { title, description, content, dueDate } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      ok: false,
      message: "Title and content are required",
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

    const activity = await prisma.activity.create({
      data: {
        courseId: courseId,
        title: title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    const aiReading = await prisma.aIReading.create({
      data: {
        activityId: activity.id,
        content: content,
      },
    });

    const responseBody = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      dueDate: activity.dueDate,
      content: aiReading.content,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };

    return res.status(201).json({
      ok: true,
      message: "AIReading activity created successfully",
      aiReading: responseBody,
    });
  } catch (error) {
    console.error("Error creating AIReading activity:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

export const createParaphrase = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, content } = req.body;

    // ✅ Validación básica
    if (!courseId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "courseId, title y content son obligatorios.",
      });
    }

    // 1️⃣ Crear la actividad base
    const activity = await prisma.activity.create({
      data: {
        courseId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    if (!activity || !activity.id) {
      return res.status(500).json({
        success: false,
        message: "No se pudo crear la actividad base (Activity).",
      });
    }

    // 2️⃣ Crear el registro de Paraphrase
    const paraphrase = await prisma.paraphrase.create({
      data: {
        activityId: activity.id,
        content,
      },
      include: { activity: true },
    });

    // ⚠️ Verificar si realmente se creó el Paraphrase
    if (!paraphrase || !paraphrase.id) {
      // En caso de error, eliminar la Activity creada
      await prisma.activity.delete({ where: { id: activity.id } });

      return res.status(500).json({
        success: false,
        message: "No se pudo crear la actividad de parafraseo (Paraphrase).",
      });
    }

    // ✅ Si todo fue bien
    res.status(201).json({
      success: true,
      message: "Actividad de parafraseo creada exitosamente.",
      data: paraphrase,
    });
  } catch (error) {
    console.error("Error al crear ParaphraseActivity:", error);


    if (error?.meta?.target === "activityId") {
      await prisma.activity.deleteMany({
        where: { id: activity?.id || undefined },
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno al crear la actividad de parafraseo.",
      error: error.message,
    });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const courseId = parseInt(req.params.idCourse);

    const activities = await prisma.activity.findMany({
      where: { courseId },
      include: {
        aiReading: true,
      },
    });

    const formatted = activities.map((activity) => {
      let type = null;
      let details = null;

      if (activity.aiReading) {
        type = "AIReading";
        details = {
          content: activity.aiReading.content,
        };
      }
      // futuro:
      // else if (activity.essay) {
      //   type = "Essay";
      //   details = activity.essay;
      // } else if (activity.quiz) {
      //   type = "Quiz";
      //   details = activity.quiz;
      // }

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        dueDate: activity.dueDate,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        type,
        ...details,
      };
    });

    return res.json({
      success: true,
      data: formatted,
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

    // Verificar que el AIReading exista
    const aiReading = await prisma.aIReading.findUnique({
      where: { activityId },
    });

    if (!aiReading) {
      return res.status(404).json({
        success: false,
        message: "AIReading not found for this activity",
      });
    }

    // Actualizar AIReading
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
