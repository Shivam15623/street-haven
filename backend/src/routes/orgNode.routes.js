import { Router } from "express";
import passport from "passport";
import {

  orgTreeData,
} from "../controllers/orgNode.controller.js";


const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/allNodes").get(orgTreeData);

export default router;
