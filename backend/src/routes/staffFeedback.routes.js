import { Router } from "express";
import { createStaffFeedBack, GetAllStaffFeedBack } from "../controllers/staffFeedback.controller.js";
import passport from "passport";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/create").post(createStaffFeedBack);
router.route("/view").get(GetAllStaffFeedBack)

export default router;
