import { Router } from "express";
import {
  addMeetingMinutes,
  deleteMeetingMinutes,
  editMeetingMinutes,
  getMeetingMinutes,
} from "../controllers/meetingMinutes.controller.js";
import passport from "passport";
import { upload } from "../middleware/multer.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createMeetingMinutesSchema,
  editMeetingMinutesSchema,
} from "../validations/MeetingMinutesSchema.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(getMeetingMinutes);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(createMeetingMinutesSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.CREATE_EVENT_MINUTE }),
    addMeetingMinutes
  );
router
  .route("/edit/:id")
  .patch(
    upload.single("attachment"),
    validateRequest(editMeetingMinutesSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_EVENT_MINUTE }),
    editMeetingMinutes
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ action: PERMISSIONS.DELETE_EVENT_MINUTE }),
    deleteMeetingMinutes
  );

export default router;
