import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createCourseContent = async (req, res) => {
  const { title, description, fileUrl, type } = req.body;
  const courseId = parseInt(req.params.idCourse);
  console.log("log1 :", title, description, fileUrl, type);

  if (!title || !type) {
    return res.status(400).json({
      ok: false,
      message: "Título, tipo y ID de curso son obligatorios",
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: "El curso no existe",
      });
    }

    const content = await prisma.courseContent.create({
      data: {
        title: title,
        description: description,
        file: fileUrl,

        contentType: {
          connect: { id: type },
        },
        course: {
          connect: { id: courseId },
        },
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Contenido creado exitosamente",
      content,
    });
  } catch (error) {
    console.error("Error al crear contenido:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al crear contenido",
    });
  }
};

export const updateCourseContent = async (req, res) => {
  const contentId = parseInt(req.params.idContent);
  const { title, description, fileUrl, type } = req.body;

  if (isNaN(contentId)) {
    return res.status(400).json({
      ok: false,
      message: "ID de contenido inválido",
    });
  }

  try {
    const existing = await prisma.courseContent.findUnique({
      where: { id: contentId },
    });

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: "El contenido no existe",
      });
    }

    const updated = await prisma.courseContent.update({
      where: { id: contentId },
      data: {
        title: title,
        description: description,
        file: fileUrl,
        contentType: {
          connect: {
            id: contentId,
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Contenido actualizado",
      content: updated,
    });
  } catch (error) {
    console.error("Error al actualizar contenido:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al actualizar contenido",
    });
  }
};

export const deleteCourseContent = async (req, res) => {
  const contentId = parseInt(req.params.idContent);

  if (isNaN(contentId)) {
    return res.status(400).json({
      ok: false,
      message: "ID de contenido inválido",
    });
  }

  try {
    const existing = await prisma.courseContent.findUnique({
      where: { id: contentId },
    });

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: "El contenido no existe",
      });
    }

    await prisma.courseContent.delete({
      where: { id: contentId },
    });

    return res.status(200).json({
      ok: true,
      message: "Contenido eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar contenido:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar contenido",
    });
  }
};
