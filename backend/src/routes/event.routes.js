import { Router } from "express";
import passport from "passport";
import {
  createEvent,
  editEvent,
  EventsCalendar,
  EventSignOut,
  EventSignUp,
  GetPastEvents,
  GetUpcomingEvents,
} from "../controllers/Event.controller.js";
import requireAdminRole from "../middleware/AuthRole.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.get("/upcoming", GetUpcomingEvents);
router.get("/past", GetPastEvents);
router.post("/create", requireAdminRole, createEvent);
router.patch("/edit/:id", requireAdminRole, editEvent);
router.post("/calendar", EventsCalendar);
router.route("/signup/:id").post(EventSignUp);
router.route("/signout/:id").patch(EventSignOut);
export default router;
