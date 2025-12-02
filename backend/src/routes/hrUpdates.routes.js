import { Router } from "express";

import { upload } from "../middleware/multer.js";
import passport from "passport";
import {
  createhrUpdate,
  deletehrUpdate,
  edithrUpdate,
  viewhrUpdate,
} from "../controllers/hrUpdates.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/create").post(upload.single("attachment"), createhrUpdate);
router.route("/edit/:id").patch(upload.single("attachment"), edithrUpdate);
router.route("/delete/:id").delete(deletehrUpdate);
router.route("/view").get(viewhrUpdate);
export default router;
