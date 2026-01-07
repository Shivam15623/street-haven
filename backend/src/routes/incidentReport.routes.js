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
    editIncidentReport
  );
router
  .route("/delete/:id")
  .delete(validateRequest(idParamSchema, "params"), deleteIncidentReport);
export default router;
