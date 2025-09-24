import { Router } from "express";
import requireAdminRole from "../middleware/AuthRole.js";
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
router
  .route("/create")
  .post(upload.single("attachment"), requireAdminRole, createhrUpdate);
router
  .route("/edit/:id")
  .patch(upload.single("attachment"), requireAdminRole, edithrUpdate);
router.route("/delete/:id").delete(requireAdminRole, deletehrUpdate);
router.route("/view").get(viewhrUpdate);
export default router;
