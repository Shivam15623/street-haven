import { Router } from "express";

import { upload } from "../middleware/multer.js";
import passport from "passport";
import {
  createhrUpdate,
  deletehrUpdate,
  edithrUpdate,
  viewhrUpdate,
} from "../controllers/hrUpdates.controller.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { validateRequest } from "../middleware/validate.js";
import { idParamSchema } from "../validations/common.js";
import {
  createHrUpdateSchema,
  updateHrUpdateSchema,
} from "../validations/hrUpdates.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(createHrUpdateSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.CREATE_HR_UPDATE }),
    createhrUpdate
  );
router
  .route("/edit/:id")
  .patch(
    upload.single("attachment"),
    validateRequest(idParamSchema, "params"),
    validateRequest(updateHrUpdateSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_HR_UPDATE }),
    edithrUpdate
  );
router
  .route("/delete/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_HR_UPDATE }),
    deletehrUpdate
  );
router
  .route("/view")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_HR_UPDATES }),
    viewhrUpdate
  );
export default router;
