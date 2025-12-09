import { Router } from "express";
import passport from "passport";
import { upload } from "../middleware/multer.js";
import {
  createCollectiveAgreement,
  deleteCollectiveAgreement,
  editCollectiveAgreement,
  fetchCollectiveAgreements,
} from "../controllers/CollectiveAgreement.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router
  .route("/create")
  .post(upload.single("attachment"), createCollectiveAgreement);
router.route("/").get(fetchCollectiveAgreements);
router
  .route("/edit/:id")
  .patch(upload.single("attachment"), editCollectiveAgreement);
router.route("/delete/:id").delete(deleteCollectiveAgreement);
export default router;
