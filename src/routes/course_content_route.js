import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  createCourseContent,
  deleteCourseContent,
  updateCourseContent,
} from "../controllers/course_content_controller.js";
const router = express.Router();

router.post("/:idCourse", validateJwt, createCourseContent);
router.put("/:idContent", validateJwt, updateCourseContent);
router.delete("/:idContent", validateJwt, deleteCourseContent);

export default router;
