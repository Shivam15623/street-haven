import { Router } from "express";
import passport from "passport";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";
import {
  createTicketCategory,
  deleteTicketCategory,
  editTicketCategory,
  getTicketCategories,
} from "../controllers/ticketCategory.controller.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);

router
  .route("/")
  .get(getTicketCategories)
  .post(
    authorizePermissions({ action: PERMISSIONS.TICKET_CATEGORY_ADD }),
    createTicketCategory,
  );

router
  .route("/:id")
  .patch(
    authorizePermissions({ action: PERMISSIONS.TICKET_CATEGORY_MANAGE }),
    editTicketCategory,
  )
  .delete(
    authorizePermissions({ action: PERMISSIONS.TICKET_CATEGORY_MANAGE }),
    deleteTicketCategory,
  );

export default router;
