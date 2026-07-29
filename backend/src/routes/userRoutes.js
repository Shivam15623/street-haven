import { Router } from "express";

import {
  changePassword,
  editUserDetails,
  GetUserProfile,
} from "../controllers/User.controller.js";
import passport from "passport";
import { upload } from "../middleware/multer.js";
import { validateRequest } from "../middleware/validate.js";
import {
  editUserProfileSchema,
  resetPasswordSchemauserProfile,
} from "../validations/userSchema.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router
  .route("/edit/Profile")
  .patch(
    upload.single("profilePic"),
    validateRequest(editUserProfileSchema, "body"),
    editUserDetails
  );
router
  .route("/edit/changePassword")
  .patch(
    validateRequest(resetPasswordSchemauserProfile, "body"),
    changePassword
  );
router.route("/userProfile").get(GetUserProfile);

export default router;
