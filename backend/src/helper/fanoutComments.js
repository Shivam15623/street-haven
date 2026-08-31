import { io } from "../index.js";
import { isUserViewing, getScrollState } from "../utills/presence.js";
import EntityMembership from "../models/EntityMembership.js";
import Comment from "../models/Comment.js";


const GROUP_WINDOW_MS = 15 * 60 * 1000; // 15 min idle closes an activity group

export async function fanOutComment(comment) {
  const { entityType, entityId, authorId, mentionIds = [], parentCommentId } = comment;

  const members = await EntityMembership.find({ entityType, entityId, removedAt: null });
  const parentComment = parentCommentId ? await Comment.findById(parentCommentId) : null;

  for (const member of members) {
    // bug fix: was `members.userId` (the array), needed `member.userId`
    if (member.userId.equals(authorId)) continue; // never notify self

    const viewingThis = isUserViewing(entityType, entityId, member.userId);

    if (viewingThis) {
      // presume 'bottom' if no scroll signal has arrived yet — a user who
      // just joined and hasn't scrolled is at the latest comment (case #3).
      const scrollState = getScrollState(entityType, entityId, member.userId) ?? "bottom";

      // Either way, they're in the room: emit so the comment lands in
      // their loaded data. The only difference is whether the client
      // self-advances lastSeenCommentId (bottom) or shows the
      // "↓ N new" chip and waits for a real /read call (up) — that
      // branch happens client-side, not here.
      io.to(`${entityType.toLowerCase()}:${entityId}`).emit("comment:new", comment);
      continue; // no UserCommentNotification row while they're actively in the room
    }

    // offline or online-elsewhere (case #4, #12) — notification path
    const isMentioned = mentionIds.some((id) => id.equals(member.userId));
    const isRepliedTo = parentComment && parentComment.authorId.equals(member.userId);

    if (isMentioned) {
      await UserCommentNotification.create({
        userId: member.userId,
        entityType,
        entityId,
        type: "mention",
        priority: "high",
        commentId: comment._id,
      });
    } else if (isRepliedTo) {
      await UserCommentNotification.create({
        userId: member.userId,
        entityType,
        entityId,
        type: "reply",
        priority: "high",
        commentId: comment._id,
      });
    } else {
      await upsertActivityNotification(member.userId, entityType, entityId, authorId, comment._id);
    }

    // push to this user's other online sockets so their bell icon
    // updates — uses the SAME room convention already in index.js
    // (`user_${userId}`, underscore, auto-joined on connect)
    io.to(`user_${member.userId}`).emit("notification:new");
  }
}

async function upsertActivityNotification(userId, entityType, entityId, authorId, commentId) {
  const collapseKey = `${entityType}:${entityId}:activity`;

  const existing = await UserCommentNotification.findOne({
    userId,
    entityType,
    entityId,
    type: "activity",
    isRead: false,
    collapseKey,
  });

  if (existing && Date.now() - existing.windowStartedAt.getTime() < GROUP_WINDOW_MS) {
    await UserCommentNotification.updateOne(
      { _id: existing._id },
      {
        $inc: { commentCount: 1 },
        $addToSet: { actorIds: authorId },
        $set: { commentId },
      }
    );
  } else {
    await UserCommentNotification.create({
      userId,
      entityType,
      entityId,
      type: "activity",
      commentCount: 1,
      actorIds: [authorId],
      commentId,
      collapseKey,
      windowStartedAt: new Date(),
    });
  }
}