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
import { validateAddComment, validateRequest } from "../middleware/validate.js";
import {
  createTicketSchema,
  editTicketSchema,
  fetchTicketsSchema,
} from "../validations/ticket.js";
import { idParamSchema } from "../validations/common.js";
import { upsertCategoryAssignment } from "../controllers/ticketCategoryAssignment.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get("/view", validateRequest(fetchTicketsSchema, "query"), FetchTickets);
router.post(
  "/create",
  upload.single("photo"),
  validateRequest(createTicketSchema, "body"),
  createTicket
);
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("photo"),
    validateRequest(editTicketSchema, "body"),
    editTicket
  );

// ticket comments
router.route("/:ticketId/comments").get(FetchComments);
router
  .route("/:ticketId/comments")
  .post(upload.array("attachments", 7), validateAddComment, AddComment);
router.route("/category-assignment").post(upsertCategoryAssignment);

export default router;
