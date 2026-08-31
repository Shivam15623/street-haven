import { Router } from "express";
import passport from "passport";

import { checkActiveUser } from "../middleware/checkActiveUsers.js";
import { fetchUnifiedNotifications, markUnifiedNotificationsRead } from "../controllers/notification.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router.route("/view").get(fetchUnifiedNotifications);
router.route("/mark-read").post(markUnifiedNotificationsRead);
export default router;