import { Router } from "express";
import passport from "passport";
import {
  createIncidentreport,
  deleteIncidentReport,
  editIncidentReport,
  GetAllIncidentreports,
} from "../controllers/incidentreport.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(GetAllIncidentreports);
router.route("/create").post(createIncidentreport);
router.route("/edit/:id").patch(editIncidentReport);
router.route("/delete/:id").delete(deleteIncidentReport);
export default router;
