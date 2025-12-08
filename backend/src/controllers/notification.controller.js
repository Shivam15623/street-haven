import mongoose from "mongoose";
import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const AllNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  // --- Filters from query ---

  const typeFilter = req.query.type; // "global" | "personal" | undefined
  const readStatus = req.query.readStatus; // "read" | "unread" | "all"

  // --- Lookup user tracker (read status) ---
  const lookupStage = {
    $lookup: {
      from: "usernotifications",
      let: { notifId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$notificationId", "$$notifId"] },
                { $eq: ["$userId", userId] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            readAt: 1,
            createdAt: 1,
          },
        },
      ],
      as: "userTracker",
    },
  };

  // --- Compute read status ---
  const addFieldsStage = {
    $addFields: {
      userTracker: { $ifNull: ["$userTracker", []] },
      isRead: {
        $cond: [
          { $gt: [{ $size: "$userTracker" }, 0] },
          { $ne: [{ $arrayElemAt: ["$userTracker.readAt", 0] }, null] },
          false,
        ],
      },
      readAt: {
        $cond: [
          { $gt: [{ $size: "$userTracker" }, 0] },
          { $arrayElemAt: ["$userTracker.readAt", 0] },
          null,
        ],
      },
    },
  };

  // --- Base condition: user can see global or personal notifications ---
  const baseMatchStage = {
    $match: {
      $or: [
        { isGlobal: true },
        { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
      ],
    },
  };

  // --- Type filter (global / personal) ---
  const typeFilterStage =
    typeFilter === "global"
      ? { $match: { isGlobal: true } }
      : typeFilter === "personal"
      ? { $match: { isGlobal: false } }
      : null;

  // --- Read status filter ---
  let readStatusStage = null;
  if (readStatus === "read") readStatusStage = { $match: { isRead: true } };
  else if (readStatus === "unread")
    readStatusStage = { $match: { isRead: false } };

  // --- Combine stages ---
  const pipeline = [lookupStage, addFieldsStage, baseMatchStage];
  if (typeFilterStage) pipeline.push(typeFilterStage);
  if (readStatusStage) pipeline.push(readStatusStage);

  // Pagination and projection
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        type: 1,
        title: 1,
        message: 1,
        link: 1,
        meta: 1,
        isGlobal: 1,
        createdAt: 1,
        updatedAt: 1,
        expireAt: 1,
        isRead: 1,
        readAt: 1,
      },
    }
  );

  // Count pipeline
  const countPipeline = [lookupStage, addFieldsStage, baseMatchStage];
  if (typeFilterStage) countPipeline.push(typeFilterStage);
  if (readStatusStage) countPipeline.push(readStatusStage);
  countPipeline.push({ $count: "total" });

  // --- Execute ---
  const [notifications, countResult] = await Promise.all([
    Notification.aggregate(pipeline),
    Notification.aggregate(countPipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;

  // --- Respond ---
  res.status(200).json(
    new ApiResponse(200, "Notifications fetched successfully", {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  );
});

export const MarkNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body; // array of notification IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "No notification IDs provided"));
  }

  const now = new Date();
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

  // Upsert UserNotification entries for all provided notification IDs
  const bulkOps = ids.map((notificationId) => ({
    updateOne: {
      filter: { userId, notificationId },
      update: {
        $set: {
          readAt: now,
          expireAt, // <-- Set expireAt on create/update
        },
      },
      upsert: true,
    },
  }));

  await UserNotification.bulkWrite(bulkOps, { ordered: false });

  res
    .status(200)
    .json(new ApiResponse(200, "Notifications marked as read successfully"));
});
