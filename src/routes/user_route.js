import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import {
  getAllUsers,
  getUserById,
  searchUsers,
} from "../controllers/user_controller.js";

const router = express.Router();
router.get("/all", validateJwt, getAllUsers);
router.get("/search", validateJwt, searchUsers);
router.get("/:id", validateJwt, getUserById);

export default router;
