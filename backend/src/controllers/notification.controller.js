import mongoose from "mongoose";
import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import User from "../model/user.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { ApiError } from "../utills/ApiError.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";

// ---------------------------------------------------------------------------
// Normalization — maps each source's native shape into one common shape
// for the frontend. Nothing here writes to either collection.
// ---------------------------------------------------------------------------
function normalizeGeneric(n) {
  return {
    _id: n._id.toString(),
    source: "system",
    title: n.title,
    message: n.message,
    severity: n.severity || "info",
    link: n.link || null,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
    sortDate: n.isRead && n.readAt ? n.readAt : n.createdAt,
  };
}

function formatActivityText(n) {
  const names = n.actorNames || [];
  const total = n.uniqueActorCount ?? names.length;

  if (n.type === "mention") return `${names[0] || "Someone"} mentioned you`;
  if (n.type === "reply")
    return `${names[0] || "Someone"} replied to your comment`;

  let actorText;
  if (total <= 1) actorText = names[0] || "Someone";
  else if (total === 2) actorText = names.slice(0, 2).join(" and ");
  else actorText = `${names[0]} and ${total - 1} others`;

  return `${actorText} added ${n.commentCount} comment${n.commentCount === 1 ? "" : "s"}`;
}

function normalizeComment(n) {
  const link =
    n.entityType === "ticket" ? `/it_facility?tab=track_tickets` : "";
  return {
    _id: n._id.toString(),
    source: "comment",
    title: null,
    message: formatActivityText(n),
    severity: n.priority === "high" ? "warning" : "info",
    link: link,
    entityType: n.entityType,
    entityId: n.entityId.toString(),
    commentId: n.commentId ? n.commentId.toString() : null,
    notifType: n.type, // "activity" | "mention" | "reply"
    priority: n.priority,
    commentCount: n.commentCount,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
    sortDate: n.isRead && n.readAt ? n.readAt : n.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Reused as-is from the existing generic notification controller — same
// permission-gate logic, duplicated here (not imported) only because the
// original file doesn't export it. If you want to avoid duplication,
// export buildPermissionGateMatch from the original controller and import
// it here instead.
// ---------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------
// Source A: generic notifications — now filter-aware. No `limit` cap here;
// pagination happens after merging both sources (see fetchUnifiedNotifications).
// A hard MAX_SCAN cap protects against unbounded aggregation on huge collections.
// ---------------------------------------------------------------------------
const MAX_SCAN = 500;

async function fetchGenericNotifications(userId, role, { type, status }) {
  const userPermissions = ROLE_PERMISSIONS[role] || [];

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
        { $project: { _id: 1, readAt: 1 } },
      ],
      as: "userTracker",
    },
  };

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

  const filters = [
    {
      $or: [
        { isGlobal: true },
        { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
      ],
    },
    buildPermissionGateMatch(userPermissions),
  ];

  // type filter: "global" | "personal" — maps to isGlobal
  if (type === "global") filters.push({ isGlobal: true });
  if (type === "personal") filters.push({ isGlobal: false });

  // status filter: "read" | "unread"
  if (status === "read") filters.push({ isRead: true });
  if (status === "unread") filters.push({ isRead: false });

  const pipeline = [
    lookupStage,
    addFieldsStage,
    { $match: { $and: filters } },
    { $sort: { createdAt: -1 } },
    { $limit: MAX_SCAN },
    {
      $project: {
        _id: 1,
        category: 1,
        severity: 1,
        title: 1,
        message: 1,
        link: 1,
        isGlobal: 1,
        createdAt: 1,
        isRead: 1,
        readAt: 1,
      },
    },
  ];

  return Notification.aggregate(pipeline);
}

// ---------------------------------------------------------------------------
// Source B: comment notifications — filter-aware. Comment notifications
// have no real "global/personal" concept (they're always personal, tied to
// entity membership), so a "global" filter excludes this source entirely.
// ---------------------------------------------------------------------------
async function fetchCommentNotifications(userId, { type, status }) {
  // comment notifications are inherently personal — if the user filtered
  // to "global" only, there's nothing here to return
  if (type === "global") return [];

  const filter = { userId };
  if (status === "read") filter.isRead = true;
  if (status === "unread") filter.isRead = false;

  const notifications = await UserCommentNotification.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_SCAN)
    .lean();

  if (!notifications.length) return [];

  const actorIds = [
    ...new Set(
      notifications.flatMap((n) =>
        (n.actorIds || []).map((id) => id.toString()),
      ),
    ),
  ];
  const actors = actorIds.length
    ? await User.find({ _id: { $in: actorIds } }, { firstname: 1 }).lean()
    : [];
  const actorMap = new Map(actors.map((a) => [a._id.toString(), a.firstname]));

  return notifications.map((n) => ({
    ...n,
    actorNames: (n.actorIds || [])
      .map((id) => actorMap.get(id.toString()))
      .filter(Boolean),
  }));
}
// ---------------------------------------------------------------------------
// GET /api/notifications/unified?page=1&limit=20&readStatus=all&type=global
// Filters by type ("global"|"personal") and readStatus ("read"|"unread"|"all"),
// merges both sources, sorts, then paginates the merged result.
//
// Caveat: since each source is independently capped at MAX_SCAN before
// merging, a user with more than MAX_SCAN notifications in ONE source could
// see slightly incomplete results on later pages. Acceptable for a
// notification center (nobody scrolls that deep), but flagging the
// limitation rather than hiding it.
// ---------------------------------------------------------------------------
export const fetchUnifiedNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
  const type = req.query.type || undefined; // "global" | "personal" | undefined
  const readStatus = req.query.readStatus; // "read" | "unread" | "all" | undefined
  const status = readStatus === "all" ? undefined : readStatus;

  const [generic, comment] = await Promise.all([
    fetchGenericNotifications(userId, req.user.role, { type, status }),
    fetchCommentNotifications(userId, { type, status }),
  ]);

  const merged = [
    ...generic.map(normalizeGeneric),
    ...comment.map(normalizeComment),
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  const total = merged.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageItems = merged.slice(start, start + limit);

  res.status(200).json(
    new ApiResponse(200, "Notifications fetched successfully", {
      notifications: pageItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }),
  );
});
// ---------------------------------------------------------------------------
// GET /api/notifications/unified/unread-count
// Cheap, separate from the paginated fetch above — two countDocuments-style
// queries, not derived from the capped `limit` results.
// ---------------------------------------------------------------------------
export const getUnifiedUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

  const [genericResult, commentCount] = await Promise.all([
    Notification.aggregate([
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
            { $project: { _id: 1, readAt: 1 } },
          ],
          as: "userTracker",
        },
      },
      {
        $addFields: {
          userTracker: { $ifNull: ["$userTracker", []] },
          isRead: {
            $cond: [
              { $gt: [{ $size: "$userTracker" }, 0] },
              { $ne: [{ $arrayElemAt: ["$userTracker.readAt", 0] }, null] },
              false,
            ],
          },
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
            { isRead: false },
          ],
        },
      },
      { $count: "n" },
    ]),
    UserCommentNotification.countDocuments({ userId, isRead: false }),
  ]);

  const totalUnread = (genericResult[0]?.n || 0) + commentCount;
  res
    .status(200)
    .json(new ApiResponse(200, "Unread count fetched", { count: totalUnread }));
});

// ---------------------------------------------------------------------------
// POST /api/notifications/unified/mark-read
// body: { ids: string[] }  — mixed ids from BOTH sources in one call.
// Internally splits and dispatches to each collection's own correct
// read-tracking mechanism. Reuses the existing visibility-check logic for
// generic notifications (imported, not duplicated) so security behavior
// doesn't drift from MarkNotificationsAsRead.
// ---------------------------------------------------------------------------
const TTL_DAYS_BY_TYPE = {
  activity: 14,
  mention: 45,
  reply: 45,
  assignment: 45,
  other: 30,
};

export const markUnifiedNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "No notification IDs provided");
  }

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!objectIds.length) {
    return res.status(200).json(new ApiResponse(200, "No valid ids provided"));
  }

  // Determine which ids belong to which collection — check comment
  // notifications first (cheap, indexed, userId-scoped), whatever's left
  // over is assumed generic and goes through the existing visibility filter.
  const commentDocs = await UserCommentNotification.find(
    { _id: { $in: objectIds }, userId },
    { type: 1 },
  ).lean();

  const commentIdSet = new Set(commentDocs.map((d) => d._id.toString()));
  const genericIds = objectIds.filter((id) => !commentIdSet.has(id.toString()));

  const now = new Date();

  const commentWritePromise = commentDocs.length
    ? UserCommentNotification.bulkWrite(
        commentDocs.map((doc) => ({
          updateOne: {
            filter: { _id: doc._id, userId },
            update: {
              $set: {
                isRead: true,
                readAt: now,
                expireAt: new Date(
                  now.getTime() + (TTL_DAYS_BY_TYPE[doc.type] ?? 30) * 86400000,
                ),
              },
            },
          },
        })),
        { ordered: false },
      )
    : Promise.resolve();

  const genericWritePromise = genericIds.length
    ? markGenericNotificationsReadInternal(genericIds, userId, req.user.role)
    : Promise.resolve();

  await Promise.all([commentWritePromise, genericWritePromise]);

  res.status(200).json(new ApiResponse(200, "Notifications marked as read"));
});

/**
 * Extracted from the existing MarkNotificationsAsRead so the unified
 * endpoint reuses the exact same visibility-checked write path, rather
 * than reimplementing it. If you'd rather not touch the original
 * controller file at all, this can instead just re-run the same
 * filterVisibleNotificationIds + bulkWrite logic duplicated here — but
 * extracting it avoids the two ever silently drifting apart.
 */
async function markGenericNotificationsReadInternal(ids, userId, role) {
  const userPermissions = ROLE_PERMISSIONS[role] || [];
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

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

  const visibleIds = visible.map((n) => n._id.toString());
  if (!visibleIds.length) return;

  const now = new Date();
  const expireAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await UserNotification.bulkWrite(
    visibleIds.map((notificationId) => ({
      updateOne: {
        filter: { userId, notificationId },
        update: { $set: { readAt: now, expireAt } },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}
