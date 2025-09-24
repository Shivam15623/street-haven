import { Router } from "express";

import { changePassword, editUserDetails, GetUserProfile } from "../controllers/User.controller.js";
import passport from "passport";
import { upload } from "../middleware/multer.js";
const router=Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/edit/Profile").patch(upload.single("profilePic"),editUserDetails)
router.route("/edit/changePassword").patch(changePassword)
router.route("/userProfile").get(GetUserProfile)



export default router;