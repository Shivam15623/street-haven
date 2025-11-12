import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "ticket_comment",
        "success",
        "warning",
        "error",
        "action",
        "ticket_created",
        "manual_added",
        "event_activity",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    meta: { type: Object },
    isGlobal: { type: Boolean, default: false },
    expireAt: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Auto-delete expired notifications
NotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Optimize queries by type or global flags
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isGlobal: 1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
