import { Router } from "express";
import passport from "passport";
import {
  createIncidentreport,
  deleteIncidentReport,
  editIncidentReport,
  GetAllIncidentreports,
} from "../controllers/incidentreport.controller.js";
import { incidentReportSchema } from "../validations/formSchemas.js";
import { idParamSchema } from "../validations/common.js";
import { validateRequest } from "../middleware/validate.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(GetAllIncidentreports);
router
  .route("/create")
  .post(validateRequest(incidentReportSchema, "body"), createIncidentreport);
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(incidentReportSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editIncidentReport
  );
router
  .route("/delete/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteIncidentReport
  );
export default router;
