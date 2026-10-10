// models/deletionAudit.model.js
import mongoose, { Schema } from "mongoose";

const DeletionAuditSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "soft_delete",
        "restore",
        "purge",
        "user_deactivate",
        "user_reactivate",
        "user_delete",
        "user_restore",
        "content_delete",
      ],
    },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    label: String, // e.g. "TICKET-00042 Broken light"
    actorId: { type: Schema.Types.ObjectId, ref: "User" }, // null for the purge job
    counts: { type: Schema.Types.Mixed, default: {} },
    failedFiles: [String], // storage deletes that failed, for manual retry
  },
  { timestamps: true },
);

// "What happened to this entity?" (newest first)
DeletionAuditSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

// Optional: lets you find purges that left files behind without scanning everything
DeletionAuditSchema.index(
  { createdAt: -1 },
  { partialFilterExpression: { "failedFiles.0": { $exists: true } } },
);

const DeletionAudit = mongoose.model("DeletionAudit", DeletionAuditSchema);
export default DeletionAudit;
