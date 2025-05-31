import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import Roles from "../models/roles.js";


const prisma = new PrismaClient();
//Get all courses
export const getAllCourses = async (req, res) => {
  //get professor
  const professorId = req.id;
  try {
    //Check if user has permissions
    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });
    console.log(tempUser);
    if (!tempUser) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(404).json({
        ok: false,
        message: "No tienes permisos para crear cursos",
      });
    }
    //Get all course
    const courses = await prisma.course.findMany({
      where: { teacherId: professorId },
    });
    //response
    res.status(201).json({
      ok: true,
      course: courses,
      message: "All courses were found succesfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener los cursos." });
  }
};

//Create new course
export const createNewCourse = async (req, res) => {
  const { name, description } = req.body;
  const professorId = req.id;
  console.log("Creating a new course");
  //Check all parameters are available
  if (!name || !description || !professorId) {
    res.status(400).json({
      ok: false,
      message: "Tdoos los parametros son requeridos",
    });
    return;
  }

  try {
    //Check if user has permissions
    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });
    console.log(tempUser);
    if (!tempUser) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(404).json({
        ok: false,
        message: "No tienes permisos para crear cursos",
      });
    }

    //Generate invite code
    let inviteCode;
    let isUnique;
    while (!isUnique) {
      inviteCode = nanoid(8);
      const existing = await prisma.course.findUnique({
        where: {
          inviteCode,
        },
      });
      if (!existing) isUnique = true;
    }
    //Create new course
    const newCourse = await prisma.course.create({
      data: {
        name,
        description,
        teacherId: professorId,
        inviteCode,
      },
    });
    res.status(201).json({
      ok: true,
      course: newCourse,
      message: "Course created succesfully",
    });
  } catch (error) {
    console.log("Error", error);

    res.status(500).json({ ok: false, message: "Error al crear el curso." });
  }
};

//Get course by id
export const getCourseById = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const professorId = req.id;
  try {
    //Check if user has permissions
    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });
    console.log(tempUser);
    if (!tempUser) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(404).json({
        ok: false,
        message: "No tienes permisos para crear cursos",
      });
    }

    //get specific course

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { courseStudents: true, courseContents: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    res.status(201).json({
      ok: true,
      course: course,
      message: "Curso encontrado",
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al obtener el curso." });
  }
};

//Update course info
export const updateCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { name, description } = req.body;
  const professorId = req.id;
  if (!name && !description) {
    res.status(400).json({
      ok: false,
      message: "Se necesita al menos un campo para actualizar",
    });
    return;
  }

  try {
    //Check if user has permissions
    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });
    console.log(tempUser);
    if (!tempUser) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(404).json({
        ok: false,
        message: "No tienes permisos para crear cursos",
      });
    }

    // Construir el objeto dinámico de actualización
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;

    //Update values
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: dataToUpdate,
    });
    res.status(201).json({
      ok: true,
      course: updated,
      message: "Course updated succesfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al actualizar el curso." });
  }
};

//Delete course
export const deleteCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const professorId = req.id;
  try {
    //Check if user has permissions
    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });
    console.log(tempUser);
    if (!tempUser) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(404).json({
        ok: false,
        message: "No tienes permisos para crear cursos",
      });
    }
    //Delete course
    await prisma.course.delete({ where: { id: courseId } });
    res
      .status(201)
      .json({ ok: true, message: "Curso eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error al eliminar el curso." });
  }
};

