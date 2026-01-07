import { Router } from "express";
import {
  createStaffFeedBack,
  deleteStaffFeedBack,
  editStaffFeedBack,
  GetAllStaffFeedBack,
} from "../controllers/staffFeedback.controller.js";
import passport from "passport";
import { validateRequest } from "../middleware/validate.js";
import { staffFeedbackSchema } from "../validations/formSchemas.js";
import { idParamSchema } from "../validations/common.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/create")
  .post(validateRequest(staffFeedbackSchema, "body"), createStaffFeedBack);
router.route("/view").get(GetAllStaffFeedBack);
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(staffFeedbackSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editStaffFeedBack
  );
router
  .route("/delete/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteStaffFeedBack
  );
export default router;
