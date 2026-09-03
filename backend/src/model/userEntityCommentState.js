import mongoose, { Schema } from "mongoose";

const UserEntityCommentStateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    entityType: { type: String, enum: ["Ticket", "Task"], required: true },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
 
    // ── bell icon / notification state ──
    unreadCommentCount: { type: Number, default: 0, min: 0 },
    lastNotifiedCommentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    readAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null }, // informational only, never authoritative
 
    // ── in-thread "N new comments" cursor (formerly EntitySeen) ──
    lastSeenCommentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    lastSeenAt: { type: Date, default: null },
 
    // ── TTL: ONLY ever set while the row is read/dormant. ──
    // The old schema set expireAt = windowStartedAt + 90d at creation
    // time regardless of read state, which meant an unread notification
    // could be silently deleted by MongoDB's TTL monitor after 90 days.
    // That is a real instance of "permanent notification loss". Fix:
    // expireAt stays null the entire time unreadCommentCount > 0, and
    // is only populated when the row is marked read (see
    // helper/commentNotification.js and the mark-read controller).
    expireAt: { type: Date, default: null },
  },
  { timestamps: true },
);
 
UserEntityCommentStateSchema.index(
  { userId: 1, entityType: 1, entityId: 1 },
  { unique: true },
);
UserEntityCommentStateSchema.index({ userId: 1, readAt: 1, updatedAt: -1 }); // bell icon feed
UserEntityCommentStateSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expireAt: { $type: "date" } } },
);


const UserEntityCommentState=mongoose.model("UserEntityCommentState",UserEntityCommentStateSchema)
export default UserEntityCommentState