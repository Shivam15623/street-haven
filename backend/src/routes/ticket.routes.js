import { Router } from "express";
import passport from "passport";
import {
  AddComment,
  createTicket,
  editTicket,
  FetchComments,
  FetchTickets,
} from "../controllers/Ticket.controller.js";
import { upload } from "../middleware/multer.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get("/view", FetchTickets);
router.post("/create", upload.single("photo"), createTicket);
router.route("/edit/:id").patch(upload.single("photo"),editTicket);

// ticket comments
router.route("/:ticketId/comments").get(FetchComments);
router
  .route("/:ticketId/comments")
  .post(upload.array("attachments", 7), AddComment);
// router.route("/:ticketId/comments/:commentId").patch()

// GET    /api/tickets/:ticketId/comments      → get all comments for a ticket
// POST   /api/tickets/:ticketId/comments      → add a new comment
// PATCH  /api/tickets/:ticketId/comments/:commentId → edit a comment (optional)
// DELETE /api/tickets/:ticketId/comments/:commentId → delete a comment (optional)

export default router;
