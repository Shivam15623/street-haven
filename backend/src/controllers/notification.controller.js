import mongoose from "mongoose";
import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";

// ---------------------------------------------------------------------------
// Shared visibility rule: "can this user see this notification at all?"
// Used by BOTH AllNotifications (as an aggregation match stage) and
// MarkNotificationsAsRead (as a plain query filter), so the two can never
// drift apart.
// ---------------------------------------------------------------------------

/**
 * Mongo match condition for "notification is visible to a user with the
 * given permissions" — the permission-gate half only (global/personal
 * visibility is handled separately since the two call sites determine it
 * differently: one via a userTracker lookup array, one via recipients).
 */
function buildPermissionGateMatch(userPermissions) {
  return {
    $or: [
      { requiredPermissions: { $size: 0 } },
      { requiredPermissions: { $exists: false } },
      {
        $expr: {
          $cond: [
            { $eq: ["$permissionMatchType", "all"] },
            {
              $setIsSubset: [
                { $ifNull: ["$requiredPermissions", []] },
                userPermissions,
              ],
            },
            {
              $gt: [
                {
                  $size: {
                    $setIntersection: [
                      { $ifNull: ["$requiredPermissions", []] },
                      userPermissions,
                    ],
                  },
                },
                0,
              ],
            },
          ],
        },
      },
    ],
  };
}

/**
 * Given a list of notification ids a user is claiming as "theirs to mark
 * read", returns only the subset that are actually visible to them: either
 * a personal recipient of it, or it's global AND the permission gate
 * passes. Anything else (not found, gated by permissions they lack,
 * personal-but-not-theirs) is silently dropped rather than erroring, since
 * the caller just wants "mark whatever I'm allowed to mark".
 */
async function filterVisibleNotificationIds(ids, userId, userRole) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];

  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) return [];

  // Personal targeting isn't stored on the Notification document itself —
  // it lives in the separate UserNotification collection (one row per
  // recipient, created by createNotification's bulk upsert). So "is this a
  // personal notification addressed to me" has to be a $lookup against
  // usernotifications, mirroring what AllNotifications already does,
  // rather than a match on a `recipients` field that doesn't exist here.
  const visible = await Notification.aggregate([
    { $match: { _id: { $in: objectIds } } },
    {
      $lookup: {
        from: "usernotifications",
        let: { notifId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$notificationId", "$$notifId"] },
                  { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "userTracker",
      },
    },
    {
      $match: {
        $and: [
          {
            $or: [
              { isGlobal: true },
              { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
            ],
          },
          buildPermissionGateMatch(userPermissions),
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  return visible.map((n) => n._id.toString());
}

export const AllNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  // --- Filters from query ---
  const typeFilter = req.query.type; // "global" | "personal" | undefined
  const readStatus = req.query.readStatus; // "read" | "unread" | "all"

  // --- Resolve the logged-in user's permissions ---
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

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

  // --- Base condition: user can see it (global OR personal recipient) ---
  // AND permission gate is satisfied (no permissions required, or user has them)
  // Factored as (A OR B) AND (C OR D) rather than flattened, to avoid an
  // accidental OR between visibility and permission checks.
  const baseMatchStage = {
    $match: {
      $and: [
        {
          $or: [
            { isGlobal: true },
            { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
          ],
        },
        buildPermissionGateMatch(userPermissions),
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

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        category: 1,
        action: 1,
        severity: 1,
        title: 1,
        message: 1,
        link: 1,
        meta: 1,
        isGlobal: 1,
        requiredPermissions: 1,
        permissionMatchType: 1,
        createdAt: 1,
        updatedAt: 1,
        expireAt: 1,
        isRead: 1,
        readAt: 1,
      },
    },
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

  res.status(200).json(
    new ApiResponse(200, "Notifications fetched successfully", {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }),
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

  // Previously this trusted the client-supplied ids outright and upserted a
  // UserNotification tracker for every single one — including ids for
  // notifications the user has no permission to see, notifications
  // addressed to someone else, or ids that don't exist at all. That's both
  // a data-integrity issue (orphan/incorrect tracker rows) and pointless
  // writes. Now we re-check visibility with the same rule AllNotifications
  // uses, and only create trackers for ids that pass.
  const visibleIds = await filterVisibleNotificationIds(
    ids,
    userId,
    req.user.role,
  );

  if (!visibleIds.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No visible notifications to mark as read"));
  }

  const now = new Date();
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

  // Upsert UserNotification entries only for ids the user can actually see
  const bulkOps = visibleIds.map((notificationId) => ({
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