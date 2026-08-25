// commentNotificationService.js
//
// Orchestrates what happens after a comment is persisted:
//   1. resolve recipients        (recipients.js — pure, no presence knowledge)
//   2. upsert CommentActivity    (atomic, shared grouping state)
//   3. upsert UserCommentNotification per recipient (atomic, per-user state)
//   4. presence check            (presence.js — decides read/toast, NOT whether we write)
//   5. socket emit                (best-effort, after DB is already durable)
//
// Call this AFTER Comment.create() has committed. Never call it inside
// the same flow that could roll back the comment itself.

import { resolveRecipients } from "../utills/recipients.js";
import { isUserViewing, getViewers } from "../utills/presence.js";
import { io } from "../index.js"; // your existing socket.io server instance
import UserCommentNotification from "../model/UserCommentNotification.js";
import EntitySeen from "../model/EntitySeen.js";
import CommentActivity from "../model/CommentActivity.js";

const WINDOW_MS = 10 * 60 * 1000; // 10 minute sliding grouping window
const ACTIVITY_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const MAX_TRACKED_ACTORS = 5;

/**
 * @param {"Ticket"|"Task"} entityType
 * @param {object} entity      full entity doc (needed for recipient resolution)
 * @param {object} comment     the just-created Comment doc
 */
export async function handleNewComment(entityType, entity, comment) {
  const actorId = String(comment.userId);
  const entityId = entity._id;

  // ── 1. Recipients (presence-agnostic, actor already excluded) ──
  const recipients = await resolveRecipients(entityType, entity, actorId);
  if (recipients.length === 0) return; // nothing to do

  // ── 2. Upsert / extend the shared CommentActivity window ──
  const now = comment.createdAt ?? new Date();
  const activity = await CommentActivity.findOneAndUpdate(
    {
      entityType,
      entityId,
      lastCommentAt: { $gte: new Date(now.getTime() - WINDOW_MS) },
    },
    {
      $set: {
        lastActorId: comment.userId,
        lastCommentId: comment._id,
        lastCommentAt: now,
      },
      $inc: { commentCount: 1 },
      $addToSet: { actorIds: comment.userId },
      $setOnInsert: {
        entityType,
        entityId,
        windowStartedAt: now,
        expireAt: new Date(now.getTime() + ACTIVITY_TTL_MS),
      },
    },
    { upsert: true, new: true },
  );

  // trim actorIds to last N distinct if it's grown past the cap
  // (cheap guard, only fires occasionally — not worth doing every write)
  if (activity.actorIds.length > MAX_TRACKED_ACTORS) {
    activity.actorIds = activity.actorIds.slice(-MAX_TRACKED_ACTORS);
    await activity.save();
  }

  // ── 3. Per-recipient fan-out, presence-aware ──
  const viewers = getViewers(entityType, entityId); // Set<userId>, single lookup for all recipients

  await Promise.all(
    recipients.map(({ userId }) =>
      fanOutToRecipient({
        userId,
        entityType,
        entityId,
        activity,
        comment,
        isPresent: viewers.has(String(userId)),
      }),
    ),
  );
}

async function fanOutToRecipient({
  userId,
  entityType,
  entityId,
  activity,
  comment,
  isPresent,
}) {
  // ── UserCommentNotification: atomic upsert, always happens
  //    regardless of presence (DB write is never gated on presence) ──
  const update = {
    $inc: { unreadCommentCount: 1 },
    $set: {
      lastNotifiedCommentId: comment._id,
      updatedAt: new Date(),
      // readAt decided below — must not also appear in $setOnInsert,
      // MongoDB rejects the same path in two update operators
      readAt: isPresent ? new Date() : null,
    },
    $setOnInsert: {
      entityType,
      entityId,
      createdAt: new Date(),
      expireAt: activity.expireAt,
    },
  };

  const userNotification = await UserCommentNotification.findOneAndUpdate(
    { userId, activityId: activity._id },
    update,
    { upsert: true, new: true },
  );

  // ── EntitySeen: only advance automatically if the user is present.
  //    Otherwise their cursor stays where it was until they actually look. ──
  if (isPresent) {
    await EntitySeen.findOneAndUpdate(
      { userId, entityType, entityId },
      { $set: { lastSeenCommentId: comment._id, lastSeenAt: new Date() } },
      { upsert: true },
    );
  }

  // ── 4/5. Socket emit — best-effort, DB is already durable at this point ──
  if (isPresent) {
    // live thread update only, never a toast, for present users
    io.to(`user_${userId}`).emit("comment:activity", {
      entityType,
      entityId,
      commentId: comment._id,
      actorId: comment.userId,
    });
  } else {
    // not viewing right now → normal notification toast
    io.to(`user_${userId}`).emit("notification:comment", {
      activityId: activity._id,
      entityType,
      entityId,
      unreadCommentCount: userNotification.unreadCommentCount,
      lastActorId: activity.lastActorId,
      actorIds: activity.actorIds,
      commentCount: activity.commentCount,
    });
  }
}
