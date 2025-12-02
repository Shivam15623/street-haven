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

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(getMeetingMinutes);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(createMeetingMinutesSchema, "body"),
    authorizePermissions({ moduleKey: "event_minutes", action: "create" }),
    addMeetingMinutes
  );
router
  .route("/edit/:id")
  .patch(
    upload.single("attachment"),
    validateRequest(editMeetingMinutesSchema, "body"),
    authorizePermissions({ moduleKey: "event_minutes", action: "update" }),
    editMeetingMinutes
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ moduleKey: "event_minutes", action: "delete" }),
    deleteMeetingMinutes
  );

export default router;
