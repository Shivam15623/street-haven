// helper/commentNotification.js
//
// Orchestrates what happens after a comment is persisted:
//   1. resolve recipients          (recipients.js — unchanged, presence-agnostic)
//   2. upsert CommentActivity      (atomic pipeline update, race-safe, one doc/entity)
//   3. build a human-readable summary of the activity (names, not just a count)
//   4. upsert UserEntityCommentState per recipient (atomic pipeline update)
//   5. presence check              (presence.js — decides read/toast, NOT whether we write)
//   6. socket emit                 (best-effort, after DB is already durable)
//
// Call this AFTER Comment.create() has committed, and never inside a
// transaction with it — a notification-pipeline failure must never be
// able to roll back an already-saved comment. Every write below is an
// idempotent upsert, so a partial failure here self-heals on the next
// comment for the same entity/recipient.

import { resolveRecipients } from "../utills/recipients.js";
import { getViewers } from "../utills/presence.js";
import { io } from "../index.js";
import CommentActivity from "../model/CommentActivity.js";
import UserEntityCommentState from "../model/EntityMemberShip.js";
import User from "../model/user.js";

const WINDOW_MS = 10 * 60 * 1000; // a burst stays "open" while comments keep arriving inside this gap
const MAX_WINDOW_MS = 45 * 60 * 1000; // ...but a continuously-active thread is forced to roll over anyway,
// so "X added N comments" never describes activity from hours ago
const READ_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_TRACKED_ACTORS = 5;

/**
 * @param {"Ticket"|"Task"} entityType
 * @param {object} entity   full entity doc (needed for recipient resolution)
 * @param {object} comment  the just-created Comment doc
 */
export async function handleNewComment(entityType, entity, comment) {
  const actorId = comment.userId;
  const entityId = entity._id;
  const now = comment.createdAt ?? new Date();

  const recipients = await resolveRecipients(entityType, entity, actorId);
  if (recipients.length === 0) return;

  const activity = await upsertActivity({
    entityType,
    entityId,
    actorId,
    comment,
    now,
  });

  // Built ONCE per comment, reused for every recipient — the summary
  // ("Priya added 3 comments") is identical for everyone, only the
  // per-recipient unread count/read-state differs.
  const summary = await buildActivitySummary(activity);

  const viewers = getViewers(entityType, entityId); // Set<string userId>

  await Promise.all(
    recipients.map(({ userId }) =>
      fanOutToRecipient({
        userId,
        entityType,
        entityId,
        comment,
        summary,
        isPresent: viewers.has(String(userId)),
      }),
    ),
  );
}

// ─────────────────────────────────────────────────────────
// Step 2 — atomic, race-safe activity upsert
// ─────────────────────────────────────────────────────────
async function upsertActivity({ entityType, entityId, actorId, comment, now }) {
  const pipeline = buildActivityPipeline({ actorId, comment, now });

  try {
    return await CommentActivity.findOneAndUpdate(
      { entityType, entityId },
      pipeline,
      { upsert: true, new: true },
    );
  } catch (err) {
    // E11000 = we lost a genuine insert race against a concurrent comment
    // on the SAME entity at the SAME instant. The unique index on
    // (entityType, entityId) means the winner's document already exists —
    // retry as a plain (non-upsert) update, which will now find it.
    if (err.code === 11000) {
      return CommentActivity.findOneAndUpdate(
        { entityType, entityId },
        pipeline,
        { new: true },
      );
    }
    throw err;
  }
}

function buildActivityPipeline({ actorId, comment, now }) {
  return [
    {
      $set: {
        _isNewWindow: {
          $or: [
            { $eq: [{ $ifNull: ["$lastCommentAt", null] }, null] },
            { $lt: ["$lastCommentAt", new Date(now.getTime() - WINDOW_MS)] },
            {
              $lt: [
                "$windowStartedAt",
                new Date(now.getTime() - MAX_WINDOW_MS),
              ],
            },
          ],
        },
      },
    },
    {
      $set: {
        windowStartedAt: { $cond: ["$_isNewWindow", now, "$windowStartedAt"] },
        windowSeq: {
          $cond: [
            "$_isNewWindow",
            { $add: [{ $ifNull: ["$windowSeq", 0] }, 1] },
            { $ifNull: ["$windowSeq", 1] },
          ],
        },
        commentCount: {
          $cond: [
            "$_isNewWindow",
            1,
            { $add: [{ $ifNull: ["$commentCount", 0] }, 1] },
          ],
        },
        actorIds: {
          $cond: [
            "$_isNewWindow",
            [actorId],
            {
              $slice: [
                { $setUnion: [{ $ifNull: ["$actorIds", []] }, [actorId]] },
                -MAX_TRACKED_ACTORS,
              ],
            },
          ],
        },
        totalCommentCount: {
          $add: [{ $ifNull: ["$totalCommentCount", 0] }, 1],
        },
        lastActorId: actorId,
        lastCommentId: comment._id,
        lastCommentAt: now,
      },
    },
    { $unset: "_isNewWindow" },
  ];
}

// ─────────────────────────────────────────────────────────
// Step 3 — human-readable summary, not a bare number
// ─────────────────────────────────────────────────────────
// This is the fix for "notification should be good, not just 2/3" —
// the payload the client renders carries actual names and a real
// sentence, resolved fresh from `actorIds` (never denormalized/cached
// names on CommentActivity itself, which would just be one more field
// that can go stale if someone's name changes).
export async function buildActivitySummary(activity) {
  const actors = await User.find(
    { _id: { $in: activity.actorIds } },
    "firstname lastname",
  ).lean();

  const nameById = new Map(
    actors.map((u) => [String(u._id), `${u.firstname} ${u.lastname}`.trim()]),
  );
  // preserve activity.actorIds order (most-recently-added last) so the
  // "latest" actor is always named first in the sentence
  const orderedNames = [...activity.actorIds]
    .reverse()
    .map((id) => nameById.get(String(id)) || "Someone");

  const count = activity.commentCount;
  let text;

  if (orderedNames.length <= 1) {
    const name = orderedNames[0] || "Someone";
    text = count <= 1 ? `${name} commented` : `${name} added ${count} comments`;
  } else if (orderedNames.length === 2) {
    text = `${orderedNames[0]} and ${orderedNames[1]} commented — ${count} new`;
  } else {
    const [first, second, ...rest] = orderedNames;
    // NB: actorIds is capped at the last 5 distinct actors *within the
    // current window*, so `rest.length` undercounts if more than 5
    // people commented in a single still-open window — a genuinely
    // rare case for ticket/task comment threads. Acceptable trade-off
    // rather than storing an unbounded actor list to get an exact count.
    text = `${first}, ${second} and ${rest.length} other${rest.length === 1 ? "" : "s"} commented — ${count} new`;
  }

  return {
    text,
    actorNames: orderedNames,
    lastActorId: activity.lastActorId,
    commentCount: activity.commentCount,
    lastCommentAt: activity.lastCommentAt,
  };
}

// Batch variant for list endpoints — one User query for every activity
// in the page, not one per row. Used by the GET notifications controller.
export async function buildActivitySummaries(activities) {
  const allActorIds = [
    ...new Set(activities.flatMap((a) => a.actorIds.map(String))),
  ];
  const actors = await User.find(
    { _id: { $in: allActorIds } },
    "firstname lastname",
  ).lean();
  const nameById = new Map(
    actors.map((u) => [String(u._id), `${u.firstname} ${u.lastname}`.trim()]),
  );

  return new Map(
    activities.map((activity) => {
      const orderedNames = [...activity.actorIds]
        .reverse()
        .map((id) => nameById.get(String(id)) || "Someone");
      const count = activity.commentCount;
      let text;
      if (orderedNames.length <= 1) {
        const name = orderedNames[0] || "Someone";
        text =
          count <= 1 ? `${name} commented` : `${name} added ${count} comments`;
      } else if (orderedNames.length === 2) {
        text = `${orderedNames[0]} and ${orderedNames[1]} commented — ${count} new`;
      } else {
        const [first, second, ...rest] = orderedNames;
        text = `${first}, ${second} and ${rest.length} other${rest.length === 1 ? "" : "s"} commented — ${count} new`;
      }
      const key = `${activity.entityType}:${activity.entityId}`;
      return [
        key,
        {
          text,
          actorNames: orderedNames,
          lastActorId: activity.lastActorId,
          commentCount: activity.commentCount,
          lastCommentAt: activity.lastCommentAt,
        },
      ];
    }),
  );
}

// ─────────────────────────────────────────────────────────
// Step 4/5/6 — per-recipient state + presence-gated emit
// ─────────────────────────────────────────────────────────
async function fanOutToRecipient({
  userId,
  entityType,
  entityId,
  comment,
  summary,
  isPresent,
}) {
  const now = new Date();

  // Single atomic pipeline update per recipient. This is where the
  // original code's real bug lived: it did `$inc: unreadCommentCount:1`
  // unconditionally, with no notion of "this was already read and is
  // now being reopened". A user who read a notification yesterday and
  // gets one new comment today should see unread = 1, not an ever-
  // climbing total. That decision now happens atomically inside the
  // same op that applies the increment, so there's no read-modify-write
  // window for two concurrent comments (or a comment + a read request)
  // to race each other.
  const state = await UserEntityCommentState.findOneAndUpdate(
    { userId, entityType, entityId },
    [
      {
        $set: {
          unreadCommentCount: isPresent
            ? 0
            : {
                $cond: [
                  { $eq: [{ $ifNull: ["$readAt", null] }, null] },
                  { $add: [{ $ifNull: ["$unreadCommentCount", 0] }, 1] }, // still unread → accumulate
                  1, // was read → this comment reopens it, fresh
                ],
              },
          readAt: isPresent ? now : null,
          // TTL only ever applies to a read/dormant row — never while unread.
          expireAt: isPresent ? new Date(now.getTime() + READ_TTL_MS) : null,
          lastNotifiedCommentId: comment._id,
          // present users are, by definition, looking at the thread —
          // advance their seen-cursor in the same atomic write; absent
          // users keep whatever cursor they already had
          lastSeenCommentId: isPresent ? comment._id : "$lastSeenCommentId",
          lastSeenAt: isPresent ? now : "$lastSeenAt",
        },
      },
    ],
    { upsert: true, new: true },
  );

  if (isPresent) {
    // present → live thread append only, never a toast, never a stale count
    io.to(`user_${userId}`).emit("comment:activity", {
      entityType,
      entityId,
      commentId: comment._id,
      actorId: summary.lastActorId,
    });
  } else {
    // not present → the actual toast, carrying the readable summary
    // and the authoritative per-recipient count as a SNAPSHOT (never a
    // delta) so a duplicated or replayed socket event is harmless to
    // apply twice
    io.to(`user_${userId}`).emit("notification:comment", {
      entityType,
      entityId,
      text: summary.text,
      unreadCommentCount: state.unreadCommentCount,
      actorNames: summary.actorNames,
      commentCount: summary.commentCount,
      lastCommentAt: summary.lastCommentAt,
    });
  }

  return state;
}
