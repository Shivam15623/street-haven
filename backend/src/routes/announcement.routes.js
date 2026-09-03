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
import { idParamSchema } from "../validations/common.js";
import { validateRequest } from "../middleware/validate.js";
import {
  announcementSchema,
  editAnnouncementSchema,
  viewAnnouncementSchema,
} from "../validations/announcement.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(announcementSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.CREATE_ANNOUNCEMENT }),
    createAnnouncement
  );
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("attachment"),
    validateRequest(editAnnouncementSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_ANNOUNCEMENT }),
    editAnnouncement
  );
router
  .route("/delete/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_ANNOUNCEMENT }),
    deleteAnnouncement
  );
router
  .route("/")
  .get(
    validateRequest(viewAnnouncementSchema, "query"),
    authorizePermissions({ action: PERMISSIONS.VIEW_ANNOUNCEMENTS }),
    fetchAnnouncement
  );
router.route("/recent-count").get(recentAnnouncementCount);
export default router;
