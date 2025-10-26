import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import { deleteFileFromStorage, uploadFileAndGetUrl } from "../controllers/file_management_controller.js";

const router  = express.Router();


router.post("/",validateJwt,uploadFileAndGetUrl);
router.delete("/",validateJwt,deleteFileFromStorage);

export default router;