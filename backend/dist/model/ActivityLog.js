import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    // Example: "FORM_CREATED", "LOGIN", "PDF_DOWNLOADED", "SYSTEM_CLEANUP"
    actionType: { type: String, required: true },

    // "system" or user _id or user email — fully flexible
    performedBy: {
      id: { type: String },           // user ID (optional)
      name: { type: String },         // user name (optional)
      type: { type: String, enum: ["system", "user"], required: true },
    },

    // Key-value metadata: Saves ANY shape dynamically (like audit logs)
    meta: {
      type: mongoose.Schema.Types.Mixed, // moduleName, recordId, oldValues, newValues, etc.
      default: {},
    },

    // Human-readable details for UI
    message: {
      type: String,
      required: true,
    },

    // Auto-delete after 15 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
export default ActivityLog;
