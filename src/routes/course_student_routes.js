import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  enrollStudentInACourse,
  getAllEnrolledCourses,
  getAllStudentsInCourse,
  unenrollStudentFromCourse,
} from "../controllers/course_student_controller.js";

const router = express.Router();

router.get("/", validateJwt, getAllEnrolledCourses);
router.get("/:idCourse/students", validateJwt, getAllStudentsInCourse);
router.post("/enroll", validateJwt, enrollStudentInACourse);
router.post("/:idCourse/unenroll", validateJwt, unenrollStudentFromCourse);

export default router;
