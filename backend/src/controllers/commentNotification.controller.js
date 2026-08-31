import mongoose from "mongoose";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";



// ─────────────────────────────────────────────────────────
// GET /comment-notifications?page=&limit=&readStatus=&since=
// ─────────────────────────────────────────────────────────
export const fetchCommentNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);

  const notifications = await UserCommentNotification.find({ userId })
    .sort({ isRead: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const actorIds = [...new Set(notifications.flatMap((n) => n.actorIds || []))];
  const actors = await User.find({ _id: { $in: actorIds } }, { firstname: 1, lastname: 1 }).lean();
  const actorMap = new Map(actors.map((a) => [a._id.toString(), a.firstname]));

  const enriched = notifications.map((n) => ({
    ...n,
    actorNames: (n.actorIds || []).map((id) => actorMap.get(id.toString())),
  }));

  const total = await UserCommentNotification.countDocuments({ userId });

  res.status(200).json(new ApiResponse(200, "Fetched", {
    notifications: enriched,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

// ─────────────────────────────────────────────────────────
// POST /comment-notifications/mark-read   { ids: [UserEntityCommentState._id, ...] }
// Used when the user dismisses the dropdown having "seen" specific rows.
// ─────────────────────────────────────────────────────────
export const markCommentNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body;
  if (!ids?.length) throw new ApiError(400, "No ids provided");

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const docs = await UserCommentNotification.find({ _id: { $in: objectIds }, userId }, { type: 1 }).lean();

  const TTL_DAYS = { activity: 14, mention: 45, reply: 45 };
  const now = new Date();

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id, userId },
      update: {
        $set: {
          isRead: true,
          readAt: now,
          expireAt: new Date(now.getTime() + (TTL_DAYS[doc.type] ?? 30) * 86400000),
        },
      },
    },
  }));

  if (ops.length) await UserCommentNotification.bulkWrite(ops, { ordered: false });
  res.status(200).json(new ApiResponse(200, "Marked read"));
});


