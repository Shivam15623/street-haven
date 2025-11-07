import { Router } from "express";
import passport from "passport";
import {
  addNode,
  deleteNode,
  editNode,
  orgTreeData,
} from "../controllers/orgNode.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }))
router.route("/allNodes").get(orgTreeData);
router.route("/addNode").post(addNode);
router.route("/editNode/:id").patch(editNode);
router.route("/deleteNode/:id").delete(deleteNode);

export default router