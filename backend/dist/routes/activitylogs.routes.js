import { Router } from "express";
import passport from "passport";
import { getActivityLogs } from "../controllers/Activitylog.controller.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router.route("/").get(getActivityLogs); 

export default router;
