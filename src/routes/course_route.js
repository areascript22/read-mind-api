import express from "express";
import {
  createNewCourse,
  deleteCourseInfo,
  getAllCourses,
  getCourseById,
  updateCourseInfo,
  updateCourseInviteCode,
} from "../controllers/course_controller.js";
import { validateJwt } from "../midlewares/jwt_validate.js";

const router = express.Router();

router.get("/", validateJwt, getAllCourses);
router.get("/:id", validateJwt, getCourseById);
router.post("/", validateJwt, createNewCourse);
router.put("/:id", validateJwt, updateCourseInfo);
router.delete("/:id", validateJwt, deleteCourseInfo);
router.patch("/:id/invite-code", validateJwt, updateCourseInviteCode);

export default router;
