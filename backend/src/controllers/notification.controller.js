import Notification from "../model/notification.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const AllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Base query for both user-specific and global
  const query = {
    $or: [{ "recipients.userId": userId }, { isGlobal: true }],
  };

  // Fetch current page notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(query);

  // === 🔹 SMART MARK-AS-READ: Only mark those in this page ===
  if (req.query.autoMark === "true" && notifications.length > 0) {
    const notificationIds = notifications.map((n) => n._id);

    // Update only unread notifications for this user on this page
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        "recipients.userId": userId,
        "recipients.read": false,
      },
      {
        $set: {
          "recipients.$[elem].read": true,
          "recipients.$[elem].readAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId, "elem.read": false }],
      }
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Notifications fetched successfully", {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  );
});
