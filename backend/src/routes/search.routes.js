import { Router } from "express";
import { searchAllContent } from "../controllers/search.controller.js";
import passport from "passport";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";


const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router.route("/").get(searchAllContent)
export default router;