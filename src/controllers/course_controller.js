import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import Roles from "../models/roles.js";

const prisma = new PrismaClient();

export const getAllCourses = async (req, res) => {
  const professorId = req.id;
  try {
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
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to access courses",
      });
    }
    const courses = await prisma.course.findMany({
      where: { teacherId: professorId },
    });
    res.status(200).json({
      ok: true,
      course: courses,
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, message: "Error retrieving courses" });
  }
};

export const createNewCourse = async (req, res) => {
  const { name, description } = req.body;
  const professorId = req.id;
  console.log("Creating a new course");
  if (!name || !description || !professorId) {
    res.status(400).json({
      ok: false,
      message: "All parameters are required",
    });
    return;
  }

  try {
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
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to create courses",
      });
    }

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
      message: "Course created successfully",
    });
  } catch (error) {
    console.log("Error", error);

    res.status(500).json({ ok: false, message: "Error creating course" });
  }
};

export const getCourseById = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const professorId = req.id;
  try {
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
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to access this course",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true, contents: true },
    });
    if (!course)
      return res.status(404).json({ ok: false, message: "Course not found" });
    res.status(200).json({
      ok: true,
      course: course,
      message: "Course retrieved successfully",
    });
  } catch (error) {
    console.log("Error fetching course: ", error);
    res.status(500).json({ ok: false, message: "Error retrieving course" });
  }
};

export const updateCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { name, description } = req.body;
  const professorId = req.id;
  if (!name && !description) {
    res.status(400).json({
      ok: false,
      message: "At least one field is required to update",
    });
    return;
  }

  try {
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
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (tempUser.role.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to update courses",
      });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: dataToUpdate,
    });
    res.status(200).json({
      ok: true,
      course: updated,
      message: "Course updated successfully",
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error updating course" });
  }
};

export const deleteCourseInfo = async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  const professorId = req.id;

  try {
    const tempUser = await prisma.user.findUnique({
      where: { id: professorId },
      include: { role: true },
    });

    if (!tempUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    if (tempUser.role?.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to delete courses",
      });
    }

    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    return res.status(200).json({
      ok: true,
      message: "Course deleted successfully",
      data: deletedCourse,
    });
  } catch (error) {
    console.error("Error removing course: ", error);

    // Si el curso no existe, Prisma lanza un error específico
    if (error.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Course not found" });
    }

    return res.status(500).json({
      ok: false,
      message: "Error deleting course",
      error: error.message,
    });
  }
};

export const updateCourseInviteCode = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const professorId = req.id;

    const tempUser = await prisma.user.findUnique({
      where: {
        id: professorId,
      },
      include: {
        role: true,
      },
    });

    if (!tempUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    if (tempUser.role.name === Roles.student) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to delete courses",
      });
    }

    let inviteCode;
    let isUnique = false;

    while (!isUnique) {
      inviteCode = nanoid(8);
      const existing = await prisma.course.findUnique({
        where: { inviteCode },
      });
      if (!existing) isUnique = true;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: Number(courseId) },
      data: { inviteCode },
    });

    res.status(200).json({ ok: true, course: updatedCourse });
  } catch (error) {
    console.error("Error updating course inviteCode:", error);
    res.status(500).json({ ok: false, message: "Error updating inviteCode" });
  }
};
