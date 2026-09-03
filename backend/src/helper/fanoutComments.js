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
  normalizeCommentEntity,
} from "./normalizeNotification.js";

const GROUP_WINDOW_MS = 15 * 60 * 1000; // 15 min idle closes an activity group
const MAX_ACTORS = 5; // bound actorIds so a long-running group never grows unbounded

export async function fanOutComment(comment, entity) {
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

  // Built once from the already-loaded entity — no extra Ticket/Task query.
  const entityInfo = normalizeCommentEntity(entityType, entity);

  const [members, superAdmins, author, parentComment] = await Promise.all([
    EntityMembership.find(
      { entityType, entityId, removedAt: null },
      { userId: 1 },
    ).lean(),
    User.find({ role: "super_admin" }, { _id: 1 }).lean(),
    User.findById(authorId, { firstname: 1, lastname: 1 }).lean(),
    parentCommentId
      ? Comment.findById(parentCommentId, { userId: 1 }).lean()
      : Promise.resolve(null),
  ]);

  const actorName = author
    ? `${author.firstname} ${author.lastname}`
    : "Someone";

  const memberIdSet = new Set(members.map((m) => m.userId.toString()));
  const superAdminIdSet = new Set(superAdmins.map((u) => u._id.toString()));
  const allRecipientIds = new Set([...memberIdSet, ...superAdminIdSet]);

  const room = `${entityType.toLowerCase()}:${entityId}`;
  let roomEmitted = false;

  const ops = [];
  const mentionReplyIdByUser = new Map();
  const activityUserIds = [];
  const mentionRecipientIds = [];
  const replyRecipientIds = [];

  const collapseKey = `${entityType}:${entityId}:activity`;

  for (const memberIdStr of allRecipientIds) {
    if (memberIdStr === authorIdStr) continue; // never notify self

    const memberId = new mongoose.Types.ObjectId(memberIdStr);
    const viewingThis = isUserViewing(entityType, entityId, memberId);

    if (viewingThis) {
      // emit the room event once, not once per viewing member
      if (!roomEmitted) {
        io.to(room).emit("comment:new", comment);
        roomEmitted = true;
      }
      // scrollState kept for future use (bottom vs scrolled-up rendering);
      // no DB write needed here either way — client decides how to render.
      continue;
    }

    // offline or online-elsewhere — notification path
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
            actorIds: [authorId],
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
          now,
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
      entity: entityInfo,
    });
  }

  // fire-and-forget emails, after DB/socket work — never block on delivery
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

async function emitFanOutNotifications({
  mentionReplyIdByUser,
  activityUserIds,
  entityType,
  entityId,
  collapseKey,
  entity,
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

  const actorIds = [
    ...new Set(
      allDocs.flatMap((d) => (d.actorIds || []).map((id) => id.toString())),
    ),
  ];
  const actors = actorIds.length
    ? await User.find(
        { _id: { $in: actorIds } },
        { firstname: 1, lastname: 1 },
      ).lean()
    : [];
  const actorMap = new Map(
    actors.map((a) => [a._id.toString(), `${a.firstname} ${a.lastname}`]),
  );

  for (const doc of allDocs) {
    const actorNames = (doc.actorIds || [])
      .map((id) => actorMap.get(id.toString()))
      .filter(Boolean);

    const payload = normalizeCommentNotification(
      {
        ...doc,
        formattedMessage: formatActivityText({ ...doc, actorNames }),
      },
      { entity },
    );

    io.to(`user_${doc.userId}`).emit("newNotification", payload);
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
