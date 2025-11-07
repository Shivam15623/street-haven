import { Router } from "express";
import passport from "passport";
import {
  createEvent,
  editEvent,
  EventDetails,
  EventsCalendar,
  EventSignOut,
  EventSignUp,
  fetchRegisterations,
  GetPastEvents,
  GetUpcomingEvents,
} from "../controllers/Event.controller.js";
import requireAdminRole from "../middleware/AuthRole.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.get("/upcoming", GetUpcomingEvents);
router.get("/past", GetPastEvents);
router.get("/details/:slug", EventDetails);
router.post("/create", requireAdminRole, createEvent);
router.patch("/edit/:id", requireAdminRole, editEvent);
router.post("/calendar", EventsCalendar);
router.route("/signup/:id").post(EventSignUp);
router.route("/signout/:id").patch(EventSignOut);
router.route("/registrations/:id").get(fetchRegisterations);
export default router;
