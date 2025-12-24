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
import { idParamSchema } from "../validations/common.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createEventSchema,
  editEventSchema,
} from "../validations/EventSchema.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.get("/upcoming", GetUpcomingEvents);
router.get("/past", GetPastEvents);
router.get("/details/:slug", EventDetails);
router.post(
  "/create",
  authorizePermissions({ action: PERMISSIONS.CREATE_EVENT }),
  validateRequest(createEventSchema, "body"),
  createEvent
);
router.patch(
  "/edit/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(editEventSchema, "body"),
  authorizePermissions({ action: PERMISSIONS.EDIT_EVENT }),
  editEvent
);
router.post("/calendar", EventsCalendar);
router
  .route("/signup/:id")
  .post(validateRequest(idParamSchema, "params"), EventSignUp);
router
  .route("/signout/:id")
  .patch(validateRequest(idParamSchema, "params"), EventSignOut);
router
  .route("/registrations/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_REGISTERATIONS }),
    fetchRegisterations
  );
router.route("/:id/documents").post(
  upload.array("documents", 14), // multer middleware

  validateRequest(idParamSchema, "params"),
  uploadEventDocuments
);
router.route("/:eventId/delete/document/:docId").delete(deleteEventDocument);
export default router;
