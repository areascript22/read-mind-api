import express from "express";
import {
  createNewCourse,
  deleteCourseInfo,
  getAllCourses,
  getCourseById,
  updateCourseInfo,
} from "../controllers/course_controller.js";
import { validateJwt } from "../midlewares/jwt_validate.js";

const router = express.Router();
//GEt all course of a specific profesor
router.get("/", validateJwt, getAllCourses);
//Get a specific course
router.get("/:id", validateJwt, getCourseById);
//Create new course
router.post("/", validateJwt, createNewCourse);
//Update course info
router.put("/:id", validateJwt, updateCourseInfo);
//Delete course by id
router.delete("/:id", validateJwt, deleteCourseInfo);

export default router;
