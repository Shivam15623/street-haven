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
    editStaffFeedBack
  );
router
  .route("/delete/:id")
  .delete(validateRequest(idParamSchema, "params"), deleteStaffFeedBack);
export default router;
