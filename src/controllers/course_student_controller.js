import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const enrollStudentInACourse = async (req, res) => {
  const studentId = req.id;
  const { inviteCode } = req.body;

  try {
    const course = await prisma.course.findUnique({
      where: { inviteCode },
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: "El curso con este código de invitación no existe",
      });
    }

    const existingEnrollment = await prisma.courseStudent.findFirst({
      where: {
        courseId: course.id,
        studentId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        ok: false,
        message: "El estudiante ya está inscrito en este curso",
      });
    }

    await prisma.courseStudent.create({
      data: {
        course: { connect: { id: course.id } },
        student: { connect: { id: studentId } },
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Estudiante matriculado exitosamente",
    });
  } catch (error) {
    console.error("Error al matricular estudiante:", error);
    return res.status(500).json({
      ok: false,
      error: "Error al matricular estudiante",
    });
  }
};

export const unenrollStudentFromCourse = async (req, res) => {
  const studentId = req.id;
  const courseId = parseInt(req.params.idCourse);

  try {
    const deletedEnrollment = await prisma.courseStudent.delete({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Estudiante desmatriculado exitosamente",
      data: deletedEnrollment,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma: registro no encontrado
      return res.status(404).json({
        ok: false,
        message: "El estudiante no está inscrito en este curso",
      });
    }

    console.error("Error al desmatricular estudiante:", error);
    return res.status(500).json({
      ok: false,
      error: "Error al desmatricular estudiante",
    });
  }
};

export const getAllEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.id;
    const enrolledCourses = await prisma.courseStudent.findMany({
      where: { studentId: Number(studentId) },
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    const courses = enrolledCourses.map((e) => e.course);

    res.status(200).json({ ok: true, courses: courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error fetching enrolled courses" });
  }
};

export const getAllStudentsInCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.idCourse);

    const studentsInCourse = await prisma.courseStudent.findMany({
      where: { courseId: Number(courseId) },
      include: {
        student: {
          include: {
            role: true,
          },
        },
      },
    });

    const students = studentsInCourse.map((e) => e.student);

    res.status(200).json({ ok: true, students: students });
  } catch (error) {
    console.error("Error fetching students in course:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error fetching students in course" });
  }
};
