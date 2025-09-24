import { Router } from "express";
import passport from "passport";    
import { createTicket, FetchTickets } from "../controllers/Ticket.controller.js";
import { upload } from "../middleware/multer.js";
const router=Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get("/view",FetchTickets);
router.post("/create",upload.single("photo"),createTicket)
router.route("/edit/:id").patch(upload.single("photo"),)

export default router;
