import { Router } from "express";
import { searchAllContent } from "../controllers/search.controller.js";
import passport from "passport";


const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/").get(searchAllContent)
export default router;