import express from "express";
import {
  getAppVersion,
  updateAppVersion,
} from "../controllers/global_configs_controller.js";

const router = express.Router();

router.get("/version", getAppVersion);
router.post("/version", updateAppVersion);

export default router;
