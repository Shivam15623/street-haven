import mongoose, { Schema } from "mongoose";

const EntitySeenSchema = new Schema(
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
    lastSeenCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);
 
// one cursor per user per entity
EntitySeenSchema.index(
  { userId: 1, entityType: 1, entityId: 1 },
  { unique: true }
);
 
const EntitySeen = mongoose.model("EntitySeen", EntitySeenSchema);

export default EntitySeen