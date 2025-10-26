import express from "express";
import { validateJwt } from "../midlewares/jwt_validate.js";
import { authorizeRoles } from "../midlewares/authorize_role.js";
import {
  askForRole,
  availableRoles,
  checkRoleRequestStatus,
  getAllRoleRequest,
  grantRoleAccess,
  updateUserRole,
} from "../controllers/role_request_controller.js";
import Roles from "../models/roles.js";

const router = express.Router();
router.get("/available", validateJwt, availableRoles);
router.post("/askForRole/:roleId", validateJwt, askForRole);
router.get("/checkRS", validateJwt, checkRoleRequestStatus);
router.get("/all", validateJwt, getAllRoleRequest);
router.post("/grantRole/:statusId",validateJwt,grantRoleAccess);
router.put(
  "/updateRole",
  validateJwt,
  authorizeRoles(Roles.admin, Roles.superUser),
  updateUserRole
);

export default router;
