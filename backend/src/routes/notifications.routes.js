import { Router } from "express";
import passport from "passport";

import {
  fetchUnifiedNotifications,
  getUnifiedUnreadCount,
  markUnifiedNotificationsRead,
} from "../controllers/notification.controller.js";

import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);

// Unified notifications
router.get("/view", fetchUnifiedNotifications);

// Unified unread count
router.get("/unread-count", getUnifiedUnreadCount);

// Unified mark as read
router.post("/mark-read", markUnifiedNotificationsRead);

export default router;