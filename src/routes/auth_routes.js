import express from "express";
import {
  renewToken,
  renewUser,
  signIn,
  signUp,
  verifyEmail,
} from "../controllers/auth_controller.js";
import { validateEmailToken, validateJwt } from "../midlewares/jwt_validate.js";

const router = express.Router();
router.post("/sign_up", signUp);
router.post("/sign_in", signIn);
router.get("/verify_email", validateEmailToken,verifyEmail);
router.get("/renew", validateJwt, renewToken);
router.get("/renewUser", validateJwt, renewUser);

export default router;
