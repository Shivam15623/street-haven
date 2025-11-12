import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate entries
UserNotificationSchema.index(
  { userId: 1, notificationId: 1 },
  { unique: true }
);

// Optimize for user fetch
UserNotificationSchema.index({ userId: 1, readAt: 1 });

const UserNotification = mongoose.model(
  "UserNotification",
  UserNotificationSchema
);
export default UserNotification;
