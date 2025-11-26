import express from "express";
import {
  checkRestPasswordToken,
  forgotPassowrd,
  renewToken,
  renewUser,
  setNewPassword,
  signIn,
  signUp,
  verifyEmail,
} from "../controllers/auth_controller.js";
import {
  validateEmailToken,
  validateJwt,
  validateResetPasswordTokenHtml,
  validateResetPasswordTokenJson,
} from "../midlewares/jwt_validate.js";

const router = express.Router();
router.post("/sign_up", signUp);
router.post("/sign_in", signIn);
router.get("/verify_email", validateEmailToken, verifyEmail);
router.get(
  "/password/check_reset",
  validateResetPasswordTokenHtml,
  checkRestPasswordToken
);
router.post("/password/forgot", forgotPassowrd);
router.post("/password/new", validateResetPasswordTokenJson, setNewPassword);

router.get("/renew", validateJwt, renewToken);
router.get("/renewUser", validateJwt, renewUser);

export default router;
