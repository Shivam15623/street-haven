import mongoose, { Schema } from "mongoose";

const CommentActivitySchema = new Schema(
  {
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
 
    // grouping window state
    lastActorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    lastCommentAt: {
      type: Date,
      required: true,
    },
    windowStartedAt: {
      type: Date,
      required: true,
    },
 
    // aggregated content for cheap rendering
    actorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      // capped to last 5 distinct actors at the application layer
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
 
    expireAt: {
      type: Date,
      required: true, // e.g. windowStartedAt + 90 days
    },
  },
  { timestamps: true }
);
 
// find/extend the open window for an entity, most recent first
CommentActivitySchema.index({ entityType: 1, entityId: 1, lastCommentAt: -1 });
// TTL cleanup
CommentActivitySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
 
const CommentActivity = mongoose.model("CommentActivity", CommentActivitySchema);

export default CommentActivity
 