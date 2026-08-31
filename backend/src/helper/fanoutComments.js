import mongoose from "mongoose";
import { io } from "../index.js";
import { isUserViewing, getScrollState } from "../utills/presence.js";

import UserCommentNotification from "../model/UserCommentNotification.js";
import EntityMembership from "../model/EntityMemberShip.js";
import Comment from "../model/comments.js";
import User from "../model/user.js";
import { notifyCommentEmail } from "./notifyCommentEmail.js";
import {
  formatActivityText,
  normalizeCommentNotification,
} from "./normalizeNotification.js";

const GROUP_WINDOW_MS = 15 * 60 * 1000;
const MAX_ACTORS = 5;

export async function fanOutComment(comment) {
  const {
    entityType,
    entityId,
    userId: authorId,
    mentions: mentionIds = [],
    parentCommentId,
    message,
  } = comment;

  const authorIdStr = authorId.toString();
  const now = new Date();
  const [members, superAdmins, author] = await Promise.all([
    EntityMembership.find(
      { entityType, entityId, removedAt: null },
      { userId: 1 },
    ).lean(),
    User.find({ role: "super_admin" }, { _id: 1 }).lean(),
    User.findById(authorId, { firstname: 1, lastname: 1 }).lean(),
  ]);

  const actorName = author
    ? `${author.firstname} ${author.lastname}`
    : "Someone";

  const memberIdSet = new Set(members.map((m) => m.userId.toString()));
  const superAdminIdSet = new Set(superAdmins.map((u) => u._id.toString()));
  const allRecipientIds = new Set([...memberIdSet, ...superAdminIdSet]);

  const parentComment = parentCommentId
    ? await Comment.findById(parentCommentId, { userId: 1 }).lean()
    : null;

  const room = `${entityType.toLowerCase()}:${entityId}`;
  let roomEmitted = false;
  const ops = [];

  // Track which _id belongs to which recipient so we can re-fetch and
  // emit per-user after the bulkWrite, instead of guessing at content.
  const mentionReplyIdByUser = new Map(); // userId -> notification _id
  const activityUserIds = []; // users whose notif went through the collapseKey upsert

  const mentionRecipientIds = [];
  const replyRecipientIds = [];

  const collapseKey = `${entityType}:${entityId}:activity`;

  for (const memberIdStr of allRecipientIds) {
    if (memberIdStr === authorIdStr) continue;

    const memberId = new mongoose.Types.ObjectId(memberIdStr);
    const viewingThis = isUserViewing(entityType, entityId, memberId);

    if (viewingThis) {
      if (!roomEmitted) {
        io.to(room).emit("comment:new", comment);
        roomEmitted = true;
      }
      continue;
    }

    const isMentioned = mentionIds.some((id) => id.toString() === memberIdStr);
    const isRepliedTo =
      parentComment && parentComment.userId.toString() === memberIdStr;

    if (isMentioned || isRepliedTo) {
      const notifId = new mongoose.Types.ObjectId();
      const type = isMentioned ? "mention" : "reply";

      ops.push({
        insertOne: {
          document: {
            _id: notifId,
            userId: memberId,
            entityType,
            entityId,
            type,
            priority: "high",
            commentId: comment._id,
          },
        },
      });

      mentionReplyIdByUser.set(memberIdStr, notifId);
      if (isMentioned) mentionRecipientIds.push(memberIdStr);
      else replyRecipientIds.push(memberIdStr);
    } else {
      ops.push(
        buildActivityUpsertOp(
          memberId,
          entityType,
          entityId,
          authorId,
          comment._id,
          collapseKey,
          now
        ),
      );
      activityUserIds.push(memberIdStr);
    }
  }

  if (ops.length) {
    await UserCommentNotification.bulkWrite(ops, { ordered: false });
    await emitFanOutNotifications({
      mentionReplyIdByUser,
      activityUserIds,
      entityType,
      entityId,
      collapseKey,
    });
  }

  // fire-and-forget emails, AFTER the socket/DB work — never block the
  // comment response or the in-app notification path on email delivery
  if (mentionRecipientIds.length) {
    notifyCommentEmail({
      type: "mention",
      recipientIds: mentionRecipientIds,
      entityType,
      entityId,
      actorName,
      commentMessage: message,
    }).catch((err) => console.error("mention email fan-out failed:", err));
  }
  if (replyRecipientIds.length) {
    notifyCommentEmail({
      type: "reply",
      recipientIds: replyRecipientIds,
      entityType,
      entityId,
      actorName,
      commentMessage: message,
    }).catch((err) => console.error("reply email fan-out failed:", err));
  }
}

// ---------------------------------------------------------------------------
// Re-fetch the docs the bulkWrite just touched (post-increment for
// activity groups), resolve actor names in one batched User lookup, format
// via formatActivityText, normalize, and emit per recipient.
// ---------------------------------------------------------------------------
async function emitFanOutNotifications({
  mentionReplyIdByUser,
  activityUserIds,
  entityType,
  entityId,
  collapseKey,
}) {
  const mentionReplyIds = [...mentionReplyIdByUser.values()];

  const [mentionReplyDocs, activityDocs] = await Promise.all([
    mentionReplyIds.length
      ? UserCommentNotification.find({ _id: { $in: mentionReplyIds } }).lean()
      : [],
    activityUserIds.length
      ? UserCommentNotification.find({
          userId: {
            $in: activityUserIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          entityType,
          entityId,
          type: "activity",
          collapseKey,
          isRead: false,
        }).lean()
      : [],
  ]);

  const allDocs = [...mentionReplyDocs, ...activityDocs];
  if (!allDocs.length) return;

  // batch actor-name resolution across ALL affected docs (mentions/replies
  // don't have actorIds populated, only activity groups do — but batching
  // together is still one query instead of N)
  const actorIds = [
    ...new Set(
      allDocs.flatMap((d) => (d.actorIds || []).map((id) => id.toString())),
    ),
  ];
  const actors = actorIds.length
    ? await User.find({ _id: { $in: actorIds } }, { firstname: 1 }).lean()
    : [];
  const actorMap = new Map(actors.map((a) => [a._id.toString(), a.firstname]));

  for (const doc of allDocs) {
    const actorNames = (doc.actorIds || [])
      .map((id) => actorMap.get(id.toString()))
      .filter(Boolean);

    const payload = normalizeCommentNotification({
      ...doc,
      formattedMessage: formatActivityText({ ...doc, actorNames }),
    });

    io.to(`user_${doc.userId}`).emit("notification:new", payload);
  }
}

function buildActivityUpsertOp(
  userId,
  entityType,
  entityId,
  authorId,
  commentId,
  collapseKey,
  now,
) {

  const cutoff = new Date(now.getTime() - GROUP_WINDOW_MS);

  return {
    updateOne: {
      filter: {
        userId,
        entityType,
        entityId,
        type: "activity",
        isRead: false,
        collapseKey,
      },
      update: [
        {
          $set: {
            commentCount: {
              $cond: [
                {
                  $lt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff],
                },
                1,
                { $add: [{ $ifNull: ["$commentCount", 0] }, 1] },
              ],
            },
            actorIds: {
              $cond: [
                {
                  $lt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff],
                },
                [authorId],
                {
                  $slice: [
                    { $setUnion: [{ $ifNull: ["$actorIds", []] }, [authorId]] },
                    -MAX_ACTORS,
                  ],
                },
              ],
            },
            createdAt: { $ifNull: ["$createdAt", now] },
            windowStartedAt: {
              $cond: [
                {
                  $lt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff],
                },
                now,
                { $ifNull: ["$windowStartedAt", now] },
              ],
            },
            commentId,
            entityType,
            entityId,
            userId,
            type: "activity",
            collapseKey,
          },
        },
      ],
      upsert: true,
    },
  };
}
