import mongoose from "mongoose";
import UserCommentNotification from "../model/UserCommentNotification.js";
import CommentActivity from "../model/CommentActivity.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

// GET /comment-notifications?page=&limit=&readStatus=&since=
export const fetchCommentNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const readStatus = req.query.readStatus; // "read" | "unread" | "all"
  const since = req.query.since; // ISO date string — for reconnect reconciliation

  const match = { userId };
  if (readStatus === "read") match.readAt = { $ne: null };
  else if (readStatus === "unread") match.readAt = null;
  if (since) match.updatedAt = { $gt: new Date(since) };

  const [rows, total] = await Promise.all([
    UserCommentNotification.find(match)
      .populate({
        path: "activityId",
        select: "entityType entityId lastActorId actorIds commentCount lastCommentAt",
        populate: [
          { path: "lastActorId", select: "firstname lastname" },
          { path: "actorIds", select: "firstname lastname" },
        ],
      })
      .sort({ updatedAt: -1 })
      .skip(since ? 0 : skip) // reconciliation fetches want everything since the cursor, not paginated
      .limit(since ? 100 : limit),
    since ? null : UserCommentNotification.countDocuments(match),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Comment notifications fetched successfully", {
      notifications: rows,
      pagination: since
        ? null
        : {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
    }),
  );
});

// POST /comment-notifications/mark-read  { ids: [userCommentNotificationId, ...] }
export const markCommentNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "No notification IDs provided"));
  }

  await UserCommentNotification.updateMany(
    { _id: { $in: ids }, userId }, // userId guard — can't mark someone else's row read
    { $set: { readAt: new Date() } },
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Comment notifications marked as read"));
});