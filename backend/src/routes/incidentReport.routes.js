import { Router } from "express";
import passport from "passport";
import {
  createIncidentreport,
  GetAllIncidentreports,
} from "../controllers/incidentreport.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(GetAllIncidentreports);
router.route("/create").post(createIncidentreport);

export default router;
