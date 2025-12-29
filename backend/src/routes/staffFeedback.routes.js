import { Router } from "express";
import { createStaffFeedBack, deleteStaffFeedBack, editStaffFeedBack, GetAllStaffFeedBack } from "../controllers/staffFeedback.controller.js";
import passport from "passport";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/create").post(createStaffFeedBack);
router.route("/view").get(GetAllStaffFeedBack)
router.route("/edit/:id").patch(editStaffFeedBack);
router.route("/delete/:id").delete(deleteStaffFeedBack);
export default router;
