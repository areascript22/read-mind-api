import express from "express";
import { renewToken, signIn, signUp } from "../controllers/auth_controller.js";
import { validateJwt } from "../midlewares/jwt_validate.js";

const router = express.Router();
router.post("/sign_up",  signUp);
router.post("/sign_in", signIn);
router.get('/renew', validateJwt,renewToken);

export default router;
