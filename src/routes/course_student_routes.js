import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  enrollStudentInACourse,
  unenrollStudentFromCourse,
} from "../controllers/course_student_controller.js";

const router = express.Router();

//enroll student to a course
router.post("/:idCourse/enroll", validateJwt, enrollStudentInACourse);
//remove student from a course
router.post("/:idCourse/unenroll", validateJwt, unenrollStudentFromCourse);

export default router;
