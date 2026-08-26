import mongoose, { Schema } from "mongoose";

const UserCommentNotificationSchema = new Schema(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "CommentActivity",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    // denormalized for fast "badge per entity" queries without a join
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
 
    unreadCommentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastNotifiedCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      // informational only — best-effort record that a socket emit was attempted.
      // NOT authoritative for read/unread logic.
      type: Date,
      default: null,
    },
    expireAt: {
      type: Date,
      required: true, // mirrors parent CommentActivity.expireAt
    },
  },
  { timestamps: true }
);
 
// prevents duplicate rows under concurrent upserts — this is the
// constraint that makes the atomic upsert pattern safe
UserCommentNotificationSchema.index(
  { userId: 1, activityId: 1 },
  { unique: true }
);
// bell icon: "unread notifications for this user, newest first"
UserCommentNotificationSchema.index({ userId: 1, readAt: 1, updatedAt: -1 });
// "is there an unread notification for this specific entity for this user"
UserCommentNotificationSchema.index({ userId: 1, entityType: 1, entityId: 1 });
// TTL cleanup
UserCommentNotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
 
const UserCommentNotification = mongoose.model(
  "UserCommentNotification",
  UserCommentNotificationSchema
);

export default UserCommentNotification