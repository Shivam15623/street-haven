import mongoose, { Schema } from "mongoose";

/**
 * One document per (user, entity) pair.
 *
 * This is what makes "read state" independent per user instead of a
 * single global flag on the Ticket/Task. It answers exactly one
 * question: "what has THIS user actually seen in THIS entity?"
 *
 * It intentionally knows NOTHING about notifications — see Notification.js
 * for that. Keeping them separate is what satisfies spec case #35
 * (dismissing a notification must not silently mark comments as read,
 * and vice versa).
 */
const EntityMembershipSchema = new Schema(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // When this user gained access. Used as the unread "floor" so someone
    // added mid-thread (case #30) isn't shown 30 historical comments as
    // unread, and someone who never opened the ticket (case #26) gets a
    // sane floor instead of "unread since epoch".
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // The last comment this user has ACTUALLY had rendered in view —
    // not the last comment that existed when they opened the page
    // (case #9, #10). Only advance this from an IntersectionObserver-style
    // "comment was visible on screen" signal, never on page-open.
    lastSeenCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },

    // Access revoked (case #29). Kept instead of deleted so no future
    // activity is ever surfaced to them again, without losing audit
    // history. All fan-out queries must filter removedAt: null.
    removedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// One membership row per user per entity — also the row you upsert into
// on invite/join.
EntityMembershipSchema.index(
  { entityType: 1, entityId: 1, userId: 1 },
  { unique: true },
);

// Reverse lookup: "everything this user is a member of" (ticket list,
// unread-badge aggregation).
EntityMembershipSchema.index({ userId: 1, entityType: 1, entityId: 1 });

// Fan-out lookup: "who is watching this entity right now" — filtered by
// removedAt: null in the query, not a partial index, since removedAt
// flips over time and a partial index would need constant rebuilding.
EntityMembershipSchema.index({ entityType: 1, entityId: 1, removedAt: 1 });

const EntityMembership = mongoose.model(
  "EntityMembership",
  EntityMembershipSchema,
);

export default EntityMembership;

/**
 * Unread count for a given user is computed on read, not stored:
 *
 *   Comment.countDocuments({
 *     entityType,
 *     entityId,
 *     createdAt: { $gt: membership.lastSeenAt || membership.joinedAt }
 *   })
 *
 * Using joinedAt as the floor when lastSeenAt is null is what gives you:
 *   - case #26: "never opened" -> "New activity", not a stale absurd count
 *   - case #30: new member isn't dumped with historical unread
 */