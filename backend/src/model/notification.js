import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipients: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        read: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        deleted: { type: Boolean, default: false }, // soft delete per user
      },
    ],

    type: {
      type: String,
      enum: [
        "ticket_comment",
        "success",
        "warning",
        "error",
        "action",
        "ticket_created",
        "mannual_added",
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// TTL index for automatic deletion
NotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
