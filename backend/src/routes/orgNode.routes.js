import { Router } from "express";
import passport from "passport";
import {
  addNode,
  deleteNode,
  editNode,
  orgTreeData,
} from "../controllers/orgNode.controller.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { validateRequest } from "../middleware/validate.js";
import { idParamSchema } from "../validations/common.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/allNodes").get(orgTreeData);
router
  .route("/addNode")
  .post(
    authorizePermissions({ action: PERMISSIONS.CREATE_ORG_CHART }),
    addNode
  );
router
  .route("/editNode/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.EDIT_ORG_CHART }),
    editNode
  );
router
  .route("/deleteNode/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_ORG_CHART }),
    deleteNode
  );

export default router;
