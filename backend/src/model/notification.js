import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "ticket",
        "event",
        "announcement",
        "task",
        "event_minute",
        "training_material",
        "additional_documents",
        "hr_updates",
        "certificate",
        "system",
      ],
      required: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "commented",
        "assigned",
        "status_changed",
        "deleted",
        "registered",
        "unregistered",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    meta: { type: Object },
    isGlobal: { type: Boolean, default: false },
    requiredPermissions: {
      type: [String],
      default: [],
    },
    permissionMatchType: {
      type: String,
      enum: ["any", "all"],
      default: "any",
    },
    expireAt: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Auto-delete expired notifications
NotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Optimize queries by type or global flags
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isGlobal: 1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
