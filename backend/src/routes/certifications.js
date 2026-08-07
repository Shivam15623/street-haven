// routes/volunteerCertification.routes.js
import { Router } from "express";
import { upload } from "../middleware/multer.js";
import {
  deleteCertification,
  getAllCertifications,
  getCertificationById,
  getMyCertification,
  submitCertification,
  updateCertificationStatus,
} from "../controllers/VolunteerCertification.controller.js";
import passport from "passport";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
// Volunteer routes
router
  .route("/")
  .post(upload.single("file"), submitCertification)
  .get(getAllCertifications);

router.route("/me").get(getMyCertification);

router
  .route("/:certificationId")
  .get(getCertificationById)
  .delete(deleteCertification);

router.route("/:certificationId/status").patch(updateCertificationStatus);

export default router;
