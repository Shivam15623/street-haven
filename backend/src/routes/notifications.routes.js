import { Router } from "express";
import passport from "passport";
import { AllNotifications, MarkNotificationsAsRead } from "../controllers/notification.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(AllNotifications);
router.route("/mark-read").post(MarkNotificationsAsRead);
export default router;