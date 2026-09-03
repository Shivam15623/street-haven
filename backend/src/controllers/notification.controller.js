import mongoose from "mongoose";
import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import User from "../model/user.js";
import Ticket from "../model/ticket.js"; // lowercase t
import Task from "../model/task.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";
import {
  normalizeCommentEntity,
  normalizeSystemNotification,
} from "../helper/normalizeNotification.js";

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

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

// n.entity is attached beforehand (batched lookup) — see fetchCommentNotifications
function normalizeComment(n) {
  const entity = n.entity || null;
  const link = entity
    ? `/${n.entityType.toLowerCase()}/${entity.slug}`
    : `/${n.entityType.toLowerCase()}/${n.entityId}`;

  return {
    _id: n._id.toString(),
    source: "comment",
    title: null,
    message: formatActivityText(n),
    severity: n.priority === "high" ? "warning" : "info",
    link,
    entity,
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
// Reused as-is from the existing generic notification controller
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
// Source A: generic notifications.
// `fetchDepth` replaces the old fixed MAX_SCAN — callers pass how many
// top-ranked rows they actually need for the requested page.
// ---------------------------------------------------------------------------
const HARD_SCAN_CEILING = 5000; // safety net so a huge `page` can't force an unbounded aggregation

async function fetchGenericNotifications(
  userId,
  role,
  { type, status, fetchDepth },
) {
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

  if (type === "global") filters.push({ isGlobal: true });
  if (type === "personal") filters.push({ isGlobal: false });
  if (status === "read") filters.push({ isRead: true });
  if (status === "unread") filters.push({ isRead: false });

  const pipeline = [
    lookupStage,
    addFieldsStage,
    { $match: { $and: filters } },
    { $sort: { createdAt: -1 } },
    { $limit: Math.min(fetchDepth, HARD_SCAN_CEILING) },
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

async function countGenericNotifications(userId, role, { type, status }) {
  const userPermissions = ROLE_PERMISSIONS[role] || [];

  const filters = [
    {
      $or: [
        { isGlobal: true },
        { $expr: { $gt: [{ $size: "$userTracker" }, 0] } },
      ],
    },
    buildPermissionGateMatch(userPermissions),
  ];
  if (type === "global") filters.push({ isGlobal: true });
  if (type === "personal") filters.push({ isGlobal: false });
  if (status === "read") filters.push({ isRead: true });
  if (status === "unread") filters.push({ isRead: false });

  const result = await Notification.aggregate([
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
                  { $eq: ["$userId", userId] },
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
    { $match: { $and: filters } },
    { $count: "n" },
  ]);

  return result[0]?.n || 0;
}

// ---------------------------------------------------------------------------
// Source B: comment notifications — now also attaches `entity` via a
// batched (not per-row) Ticket/Task lookup, so the frontend gets
// displayId/slug/title without a query-per-notification.
// ---------------------------------------------------------------------------
async function fetchCommentNotifications(userId, { type, status, fetchDepth }) {
  if (type === "global") return [];

  const filter = { userId };
  if (status === "read") filter.isRead = true;
  if (status === "unread") filter.isRead = false;

  const notifications = await UserCommentNotification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(fetchDepth, HARD_SCAN_CEILING))
    .lean();

  if (!notifications.length) return [];

  const actorIds = [
    ...new Set(
      notifications.flatMap((n) =>
        (n.actorIds || []).map((id) => id.toString()),
      ),
    ),
  ];
  const actorsPromise = actorIds.length
    ? User.find({ _id: { $in: actorIds } }, { firstname: 1 }).lean()
    : Promise.resolve([]);

  // Batch entity lookups by type — at most 2 queries total (one per
  // entityType present on this page), not one per notification.
  const ticketIds = [
    ...new Set(
      notifications
        .filter((n) => n.entityType === "Ticket")
        .map((n) => n.entityId.toString()),
    ),
  ];
  const taskIds = [
    ...new Set(
      notifications
        .filter((n) => n.entityType === "Task")
        .map((n) => n.entityId.toString()),
    ),
  ];

  const ticketsPromise = ticketIds.length
    ? Ticket.find(
        { _id: { $in: ticketIds } },
        { ticketNumber: 1, slug: 1, req_title: 1 },
      )
    : Promise.resolve([]);
  const tasksPromise = taskIds.length
    ? Task.find(
        { _id: { $in: taskIds } },
        { taskNumber: 1, slug: 1, title: 1 },
      ).lean()
    : Promise.resolve([]);

  const [actors, tickets, tasks] = await Promise.all([
    actorsPromise,
    ticketsPromise,
    tasksPromise,
  ]);

  const actorMap = new Map(actors.map((a) => [a._id.toString(), a.firstname]));
  const entityMap = new Map([
    ...tickets.map((t) => [`Ticket:${t._id.toString()}`, t]),
    ...tasks.map((t) => [`Task:${t._id.toString()}`, t]),
  ]);

  return notifications.map((n) => {
    const rawEntity = entityMap.get(`${n.entityType}:${n.entityId.toString()}`);
    return {
      ...n,
      actorNames: (n.actorIds || [])
        .map((id) => actorMap.get(id.toString()))
        .filter(Boolean),
      // null if the ticket/task was deleted — normalizeComment falls back
      // to the raw entityId link in that case
      entity: rawEntity
        ? normalizeCommentEntity(n.entityType, rawEntity)
        : null,
    };
  });
}

async function countCommentNotifications(userId, { type, status }) {
  if (type === "global") return 0;
  const filter = { userId };
  if (status === "read") filter.isRead = true;
  if (status === "unread") filter.isRead = false;
  return UserCommentNotification.countDocuments(filter);
}

// ---------------------------------------------------------------------------
// GET /api/notifications/unified?page=1&limit=20&readStatus=all&type=global
// ---------------------------------------------------------------------------
export const fetchUnifiedNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 20));
  const type = req.query.type || undefined;
  const readStatus = req.query.readStatus;
  const status = readStatus === "all" ? undefined : readStatus;

  const start = (page - 1) * limit;
  // Need the top (start + limit) ranked rows from EACH source, since in the
  // worst case every item on this page could come from a single source.
  const fetchDepth = start + limit;

  const [generic, comment, genericTotal, commentTotal] = await Promise.all([
    fetchGenericNotifications(userId, req.user.role, {
      type,
      status,
      fetchDepth,
    }),
    fetchCommentNotifications(userId, { type, status, fetchDepth }),
    countGenericNotifications(userId, req.user.role, { type, status }),
    countCommentNotifications(userId, { type, status }),
  ]);

  const merged = [
    ...generic.map((n) =>
      normalizeSystemNotification(n, {
        isRead: n.isRead,
        readAt: n.readAt,
      }),
    ),

    ...comment.map(normalizeComment),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = genericTotal + commentTotal; // real total, not capped-fetch length
  const totalPages = Math.max(1, Math.ceil(total / limit));
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
// GET /api/notifications/unified/unread-count  (unchanged)
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
// POST /api/notifications/unified/mark-read  (unchanged)
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

async function markGenericNotificationsReadInternal(ids, userId, role) {
  const userPermissions = ROLE_PERMISSIONS[role] || [];

  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) return [];

  // Find generic notifications that are actually visible to this user.
  const visible = await Notification.aggregate([
    {
      $match: {
        _id: { $in: objectIds },
      },
    },
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
                  {
                    $eq: ["$userId", new mongoose.Types.ObjectId(userId)],
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
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
              {
                $expr: {
                  $gt: [{ $size: "$userTracker" }, 0],
                },
              },
            ],
          },
          buildPermissionGateMatch(userPermissions),
        ],
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  const visibleIds = visible.map((n) => n._id);

  if (!visibleIds.length) return [];

  const now = new Date();

  await UserNotification.updateMany(
    {
      notificationId: { $in: visibleIds },
      userId: new mongoose.Types.ObjectId(userId),
      $or: [{ readAt: null }, { readAt: { $exists: false } }],
    },
    {
      $set: {
        readAt: now,
      },
    },
  );

  return visibleIds.map((id) => id.toString());
}
