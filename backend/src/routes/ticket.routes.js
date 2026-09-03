import { Router } from "express";
import passport from "passport";
import {
  AddTicketComment,
  approveTicket,
  cancelTicket,
  completeTicket,
  createTicket,
  editTicket,
  ExportTicketsReport,
  FetchTicketComments,
  FetchTickets,
  GetTicketDetail,
  GetTicketsReport,
  rejectTicket,
  reopenTicket,
  startTicket,
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
import { checkActiveUser } from "../middleware/checkActiveUsers.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { getTicketMentionableUsers } from "../controllers/comments.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router.get(
  "/view",
  validateRequest(fetchTicketsSchema, "query"),
  authorizePermissions({ action: PERMISSIONS.TICKET_VIEW_SELF }),
  FetchTickets,
);
router.post(
  "/create",
  upload.single("photo"),
  validateRequest(createTicketSchema, "body"),
  authorizePermissions({ action: PERMISSIONS.TICKET_CREATE }),
  createTicket,
);

router.get("/report", GetTicketsReport);
router.get("/report/export", ExportTicketsReport);
router.get("/report/:id", GetTicketDetail);
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("photo"),
    validateRequest(editTicketSchema, "body"),
    editTicket,
  );
// Ticket lifecycle
router.get("/:slug/mentionable-users", getTicketMentionableUsers);
router.patch(
  "/:id/approve",
  validateRequest(idParamSchema, "params"),
  approveTicket,
);

router.patch(
  "/:id/reject",
  validateRequest(idParamSchema, "params"),
  rejectTicket,
);

router.patch(
  "/:id/start",
  validateRequest(idParamSchema, "params"),
  startTicket,
);

router.patch(
  "/:id/complete",
  validateRequest(idParamSchema, "params"),
  completeTicket,
);

router.patch(
  "/:id/cancel",
  validateRequest(idParamSchema, "params"),
  cancelTicket,
);
router.patch(
  "/:id/reopen",
  validateRequest(idParamSchema, "params"),
  reopenTicket,
);
// ticket comments
router.route("/:entityId/comments").get(FetchTicketComments);
router
  .route("/:entityId/comments")
  .post(upload.array("files", 7), validateAddComment, AddTicketComment);
router.route("/category-assignment").post(upsertCategoryAssignment);

export default router;
