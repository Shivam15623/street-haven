import { Router } from "express";
import passport from "passport";
import {
  createAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  fetchAnnouncement,
  recentAnnouncementCount,
} from "../controllers/Announcement.controller.js";
import { upload } from "../middleware/multer.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.route("/create").post(upload.single("attachment"), createAnnouncement);
router.route("/edit/:id").patch(upload.single("attachment"), editAnnouncement);
router.route("/delete/:id").delete(deleteAnnouncement);
router.route("/").get(fetchAnnouncement);
router.route("/recent-count").get(recentAnnouncementCount);
export default router;
