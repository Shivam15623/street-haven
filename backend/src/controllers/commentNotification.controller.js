// controllers/commentNotification.controller.js
//
// Reads/writes UserEntityCommentState (not the old UserCommentNotification).
// There is no activityId to populate anymore — CommentActivity is looked
// up in a single batched query keyed by (entityType, entityId), and the
// same buildActivitySummaries() the socket emit uses builds the display
// text, so the bell icon and the toast can never say two different things
// for the same entity.

import mongoose from "mongoose";
import UserEntityCommentState from "../model/EntityMemberShip.js";
import CommentActivity from "../model/CommentActivity.js";
import { buildActivitySummaries } from "../helper/commentNotification.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

const READ_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const RECONCILE_BUFFER_MS = 2000; // small overlap window, see architecture doc §8

// ─────────────────────────────────────────────────────────
// GET /comment-notifications?page=&limit=&readStatus=&since=
// ─────────────────────────────────────────────────────────
export const fetchCommentNotifications = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const readStatus = req.query.readStatus; // "read" | "unread" | "all"
  const since = req.query.since; // ISO date string — reconnect reconciliation

  let match = { userId };
  if (readStatus === "read") match.readAt = { $ne: null };
  else if (readStatus === "unread") match.readAt = null;

  if (since) {
    // Reconciliation is NOT just "updatedAt > since" — that alone can
    // leave a gap (see the cursor discussion in the architecture doc).
    // The actual correctness guarantee comes from unconditionally
    // returning every currently-unread row regardless of the cursor,
    // union'd with anything else that changed recently. A row that's
    // both unread AND matches the timestamp window just isn't
    // duplicated — $or + a single query, MongoDB dedupes naturally.
    const sinceBuffered = new Date(
      new Date(since).getTime() - RECONCILE_BUFFER_MS,
    );
    match = {
      userId,
      $or: [{ readAt: null }, { updatedAt: { $gte: sinceBuffered } }],
    };
  }

  const [rows, total] = await Promise.all([
    UserEntityCommentState.find(match)
      .sort({ updatedAt: -1 })
      .skip(since ? 0 : skip) // reconciliation wants everything matching, not a page
      .limit(since ? 200 : limit)
      .lean(),
    since ? null : UserEntityCommentState.countDocuments(match),
  ]);

  // one batched CommentActivity query for the whole page — never N+1
  const activities = rows.length
    ? await CommentActivity.find({
        $or: rows.map((r) => ({
          entityType: r.entityType,
          entityId: r.entityId,
        })),
      }).lean()
    : [];
  const summaryByKey = await buildActivitySummaries(activities);

  const notifications = rows.map((row) => {
    const key = `${row.entityType}:${row.entityId}`;
    const summary = summaryByKey.get(key);
    return {
      _id: row._id,
      entityType: row.entityType,
      entityId: row.entityId,
      text: summary?.text ?? "New comment",
      actorNames: summary?.actorNames ?? [],
      commentCount: summary?.commentCount ?? row.unreadCommentCount,
      lastCommentAt: summary?.lastCommentAt ?? row.updatedAt,
      unreadCommentCount: row.unreadCommentCount,
      readAt: row.readAt,
      lastSeenCommentId: row.lastSeenCommentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });

  res.status(200).json(
    new ApiResponse(200, "Comment notifications fetched successfully", {
      notifications,
      pagination: since
        ? null
        : { total, page, limit, totalPages: Math.ceil(total / limit) },
    }),
  );
});

// ─────────────────────────────────────────────────────────
// POST /comment-notifications/mark-read   { ids: [UserEntityCommentState._id, ...] }
// Used when the user dismisses the dropdown having "seen" specific rows.
// ─────────────────────────────────────────────────────────
export const markCommentNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "No notification IDs provided"));
  }

  await UserEntityCommentState.updateMany(
    { _id: { $in: ids }, userId }, // userId guard — can't mark someone else's row read
    {
      $set: {
        readAt: new Date(),
        unreadCommentCount: 0,
        expireAt: new Date(Date.now() + READ_TTL_MS), // TTL only ever starts once read
      },
    },
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Comment notifications marked as read"));
});

// ─────────────────────────────────────────────────────────
// POST /comment-notifications/mark-read/entity   { entityType, entityId }
//
// THIS IS THE MISSING PIECE. commentNotification.js's presence check only
// auto-marks-read for comments that arrive WHILE someone is already
// viewing the entity. It does nothing for unread comments that existed
// BEFORE they opened it. Call this from the entity detail page on mount
// (alongside the socket `viewEntity` emit) so opening Ticket #123
// actually clears whatever was already unread for it.
// ─────────────────────────────────────────────────────────
export const markEntityCommentsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { entityType, entityId } = req.body;

  if (!entityType || !entityId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "entityType and entityId are required"));
  }

  // pull the latest known comment for this entity so the seen-cursor
  // advances too, not just the notification's readAt — otherwise the
  // in-thread "N new" divider can keep showing after the bell icon
  // has already been cleared
  const activity = await CommentActivity.findOne(
    { entityType, entityId },
    "lastCommentId",
  ).lean();

  const now = new Date();
  await UserEntityCommentState.findOneAndUpdate(
    { userId, entityType, entityId },
    {
      $set: {
        readAt: now,
        unreadCommentCount: 0,
        expireAt: new Date(now.getTime() + READ_TTL_MS),
        ...(activity
          ? { lastSeenCommentId: activity.lastCommentId, lastSeenAt: now }
          : {}),
      },
    },
    { upsert: true },
  );

  res.status(200).json(new ApiResponse(200, "Entity comments marked as read"));
});

// ─────────────────────────────────────────────────────────
// POST /comment-notifications/mark-all-read
// ─────────────────────────────────────────────────────────
export const markAllCommentNotificationsAsRead = asyncHandler(
  async (req, res) => {
    const userId = req.user._id;
    const now = new Date();

    await UserEntityCommentState.updateMany(
      { userId, readAt: null },
      {
        $set: {
          readAt: now,
          unreadCommentCount: 0,
          expireAt: new Date(now.getTime() + READ_TTL_MS),
        },
      },
    );

    res
      .status(200)
      .json(new ApiResponse(200, "All comment notifications marked as read"));
  },
);
