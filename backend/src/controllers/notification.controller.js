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
  const onlyUnread = req.query.onlyUnread === "true";

  // Common $lookup to bring user's tracker (if any) into each Notification
  const lookupStage = {
    $lookup: {
      from: "usernotifications", // collection name for UserNotification
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

  // Add fields for read status coming from userTracker[0] if exists
  const addFieldsStage = {
    $addFields: {
      userTracker: { $ifNull: ["$userTracker", []] },
      isRead: {
        // isRead true only if userTracker exists and readAt is not null
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

  // Keep only notifications that are either global OR have a tracker for this user
  const postLookupMatch = {
    $match: {
      $or: [
        { isGlobal: true },
        { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
      ],
    },
  };

  // If onlyUnread requested, we want only notifications where isRead === false
  const unreadMatchStage = onlyUnread ? { $match: { isRead: false } } : null;

  // Projection: return only fields you want frontend to consume
  const projectStage = {
    $project: {
      _id: 1,
      type: 1,
      title: 1,
      message: 1,
      link: 1,
      meta: 1, // include if you need it; remove to slim response
      isGlobal: 1,
      createdAt: 1,
      updatedAt: 1,
      expireAt: 1,
      isRead: 1,
      readAt: 1,
    },
  };

  // Build aggregation for paginated results
  const pipeline = [lookupStage, addFieldsStage, postLookupMatch];

  if (unreadMatchStage) pipeline.push(unreadMatchStage);
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    projectStage
  );

  // Build aggregation for count (same initial stages but end with $count)
  const countPipeline = [lookupStage, addFieldsStage, postLookupMatch];
  if (unreadMatchStage) countPipeline.push(unreadMatchStage);
  countPipeline.push({ $count: "total" });

  // Run both aggregations
  const [notifications, countResult] = await Promise.all([
    Notification.aggregate(pipeline),
    Notification.aggregate(countPipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;

  // Response
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

  // Upsert UserNotification entries for all provided notification IDs
  const bulkOps = ids.map((notificationId) => ({
    updateOne: {
      filter: { userId, notificationId },
      update: { $set: { readAt: now } },
      upsert: true,
    },
  }));

  await UserNotification.bulkWrite(bulkOps, { ordered: false });

  res
    .status(200)
    .json(new ApiResponse(200, "Notifications marked as read successfully"));
});
