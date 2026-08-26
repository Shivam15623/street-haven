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

    // ── current burst state ──
    lastActorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    lastCommentAt: { type: Date, required: true },

    windowStartedAt: { type: Date, required: true },
    windowSeq: { type: Number, default: 1 }, // bumps each time a new burst starts

    // capped to the last N distinct actors *within the current window* —
    // trimmed atomically inside the update pipeline, never via a
    // separate read → slice → save round trip
    actorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    commentCount: { type: Number, default: 0, min: 0 }, // resets when a new window starts
    totalCommentCount: { type: Number, default: 0, min: 0 }, // lifetime, never resets
  },
  { timestamps: true },
);

// The single index that matters: guarantees exactly one activity
// document can ever exist for a given entity, no matter how many
// concurrent comment writes race to create it.
CommentActivitySchema.index({ entityType: 1, entityId: 1 }, { unique: true });

// No TTL index here. This document represents the entity's *current*
// state for the entity's entire lifetime, not a single expiring burst.
// Clean it up explicitly when the entity itself is deleted.

const CommentActivity = mongoose.model(
  "CommentActivity",
  CommentActivitySchema,
);

export default CommentActivity;
