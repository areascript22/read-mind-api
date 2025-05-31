import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const enrollStudentInACourse = async (req, res) => {
  const studentId = req.id; // se asume que proviene del middleware de autenticación
  const courseId = parseInt(req.params.idCourse);

  try {
    // 1. Validar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: "El curso no existe",
      });
    }

    // 2. Verificar si ya está inscrito
    const existingEnrollment = await prisma.courseStudent.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        ok: false,
        message: "El estudiante ya está inscrito en este curso",
      });
    }

    // 3. Inscribir al estudiante
    const enroll = await prisma.courseStudent.create({
      data: {
        course: { connect: { id: courseId } },
        student: { connect: { id: studentId } },
      },
    });

    console.log("Resultado de la inscripción:", enroll);
    res.status(201).json({
      ok: true,
      message: "Estudiante matriculado exitosamente",
    });
  } catch (error) {
    console.error("Error al matricular estudiante:", error);
    res.status(500).json({
      ok: false,
      error: "Error al matricular estudiante",
    });
  }
};

export const unenrollStudentFromCourse = async (req, res) => {
  const studentId = req.id; // asumimos que viene del middleware de autenticación
  const courseId = parseInt(req.params.idCourse);

  try {
    // 1. Verificar si la inscripción existe
    const enrollment = await prisma.courseStudent.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        ok: false,
        message: "El estudiante no está inscrito en este curso",
      });
    }

    // 2. Eliminar la inscripción
    await prisma.courseStudent.delete({
      where: {
        id: enrollment.id,
      },
    });

    res.status(200).json({
      ok: true,
      message: "Estudiante desmatriculado exitosamente",
    });
  } catch (error) {
    console.error("Error al desmatricular estudiante:", error);
    res.status(500).json({
      ok: false,
      error: "Error al desmatricular estudiante",
    });
  }
};
