import { Router } from "express";
import passport from "passport";
import { AllNotifications } from "../controllers/notification.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(AllNotifications);

export default router;