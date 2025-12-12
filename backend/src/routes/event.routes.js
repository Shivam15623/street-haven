import { Router } from "express";
import passport from "passport";
import {
  createEvent,
  deleteEventDocument,
  editEvent,
  EventDetails,
  EventsCalendar,
  EventSignOut,
  EventSignUp,
  fetchRegisterations,
  GetPastEvents,
  GetUpcomingEvents,
  uploadEventDocuments,
} from "../controllers/Event.controller.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { upload } from "../middleware/multer.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.get("/upcoming", GetUpcomingEvents);
router.get("/past", GetPastEvents);
router.get("/details/:slug", EventDetails);
router.post(
  "/create",
  authorizePermissions({ action: PERMISSIONS.CREATE_EVENT }),
  createEvent
);
router.patch(
  "/edit/:id",
  authorizePermissions({ action: PERMISSIONS.EDIT_EVENT }),
  editEvent
);
router.post("/calendar", EventsCalendar);
router.route("/signup/:id").post(EventSignUp);
router.route("/signout/:id").patch(EventSignOut);
router
  .route("/registrations/:id")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_REGISTERATIONS }),
    fetchRegisterations
  );
router.route("/:id/documents").post(
  upload.array("documents", 14), // multer middleware
  uploadEventDocuments
);
router.route("/:eventId/delete/document/:docId").delete(deleteEventDocument);
export default router;
