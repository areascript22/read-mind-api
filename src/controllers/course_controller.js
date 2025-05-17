import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
//Get all courses
export const getAllCourses = async (req, res) => {
  //get professor
  const teacherId = req.body.id;
  try {
    //Get all course
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: { students: true, contents: true },
    });
    //response
    res.status(201).json({
      ok: true,
      course: courses,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error al obtener los cursos." });
  }
};

//Create new course
export const createNewCourse = async (req, res) => {
  const { title, description } = req.body;
  const teacherId = req.id;

  if (!title || !description || !teacherId) {
    res.status(400).json({
      ok: false,
      message: "Todos los parametros son requeridos",
    });
    return;
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        teacherId,
      },
    });
    res.status(201).json({
      ok: true,
      course: newCourse,
    });
  } catch (error) {
    console.log("Error", error);

    res.status(500).json({ ok: false, error: "Error al crear el curso." });
  }
};

//Get course by id
export const getCourseById = async (req, res) => {
  const courseId = parseInt(req.params.id);
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true, contents: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    res.status(201).json({
      ok: true,
      course: course,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error al obtener el curso." });
  }
};

//Update course info
export const updateCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { title, description } = req.body;
  if (!title || !description) {
    res.status(400).json({
      ok: false,
      message: "Todos los parametros son requeridos",
    });
    return;
  }

  try {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { title, description },
    });
    res.status(201).json({
      ok: true,
      course: updated,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error al actualizar el curso." });
  }
};

//Delete course
export const deleteCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id);
  try {
    await prisma.course.delete({ where: { id: courseId } });
    res
      .status(201)
      .json({ ok: true, message: "Curso eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error al eliminar el curso." });
  }
};
