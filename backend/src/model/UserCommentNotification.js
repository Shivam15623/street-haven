import mongoose, { Schema } from "mongoose";

/**
 * Per-user notification-center row. Deliberately decoupled from
 * EntityMembership — see case #35. A user can dismiss a notification
 * without having "seen" the comment, and can see the comment (via
 * EntityMembership.lastSeenCommentId advancing) without ever touching
 * the notification.
 */
const UserCommentNotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Ticket", "Task"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },

    type: {
      type: String,
      enum: ["mention", "reply", "assignment", "activity", "other"],
      required: true,
    },
    // Mentions/replies must never get buried under generic activity
    // (case #34).
    priority: {
      type: String,
      enum: ["high", "normal", "low"],
      default: "normal",
    },

    // Jump target when the notification is opened.
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // ── grouped-activity fields (case #18, #34) ──
    // "John and Sarah added 12 comments" instead of 12 separate rows.
    actorIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentCount: {
      type: Number,
      default: 1,
    },

    // Used to find-and-upsert the current open grouped notification for
    // an entity, so a burst of comments increments one row instead of
    // spamming rows.
    collapseKey: {
      type: String,
      default: null,
      index: true,
    },

    // When the CURRENT group started. A burst that runs long (John and
    // Sarah chatting for 3 hours) should not stay one ever-growing group
    // forever — close it and start a fresh one after GROUP_WINDOW_MS of
    // inactivity, checked in application code against this field. This
    // also plays with the collapseKey + isRead:false upsert: a fresh
    // burst after the user has read the previous group starts a new row
    // regardless of windowStartedAt.
    windowStartedAt: {
      type: Date,
      default: Date.now,
    },

    // ── notification-center state ──
    // Intentionally independent from whether
    // EntityMembership.lastSeenCommentId has advanced (case #35).
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // TTL: ONLY ever set once the row is read/dormant. Never set at
    // creation time regardless of read state — that would let an
    // unread mention/reply get silently deleted by MongoDB's TTL
    // monitor before the user ever saw it. expireAt stays null the
    // entire time isRead is false; populate it in the mark-read
    // controller (e.g. now + 90d) when isRead flips to true.
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Notification-center feed: "give me this user's notifications, unread
// first, newest first".
UserCommentNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Upsert target for grouping: find the open (unread) group for this
// user+entity+type to increment, or fall through to creating a new one.
UserCommentNotificationSchema.index({
  userId: 1,
  entityType: 1,
  entityId: 1,
  collapseKey: 1,
  isRead: 1,
});

// TTL cleanup — only fires for rows that actually got expireAt set
// (i.e. already read), via partialFilterExpression so unread rows are
// never candidates for deletion no matter how old they get.
UserCommentNotificationSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expireAt: { $type: "date" } },
  },
);

const UserCommentNotification = mongoose.model("UserCommentNotification", UserCommentNotificationSchema);

export default UserCommentNotification;

/**
 * Grouping upsert (case #18, #34), with the idle-window check added:
 *
 *   const GROUP_WINDOW_MS = 15 * 60 * 1000; // 15 min idle closes the group
 *   const collapseKey = `${entityType}:${entityId}:activity`;
 *
 *   const existing = await Notification.findOne({
 *     userId, entityType, entityId, type: 'activity', isRead: false, collapseKey,
 *   });
 *
 *   if (existing && Date.now() - existing.windowStartedAt.getTime() < GROUP_WINDOW_MS) {
 *     await Notification.updateOne(
 *       { _id: existing._id },
 *       { $inc: { commentCount: 1 }, $addToSet: { actorIds: authorId }, $set: { commentId } }
 *     );
 *   } else {
 *     await Notification.create({
 *       userId, entityType, entityId, type: 'activity',
 *       commentCount: 1, actorIds: [authorId], commentId, collapseKey,
 *       windowStartedAt: new Date(),
 *     });
 *   }
 *
 * Mentions/replies (case #13-16) always create their own row —
 * never routed through the collapseKey upsert — so they can't get
 * buried inside a generic activity group:
 *
 *   await Notification.create({
 *     userId: mentionedUserId, entityType, entityId,
 *     type: 'mention', priority: 'high', commentId,
 *   });
 */