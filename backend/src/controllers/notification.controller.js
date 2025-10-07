import Notification from "../model/notification.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const AllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;


  const notifications = await Notification.find({
    "recipients.userId": userId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Count total notifications
  const total = await Notification.countDocuments({
    "recipients.userId": userId,
  });

//   // Optionally: mark notifications as read if query param is provided
//   if (req.query.markAsRead === "true") {
//     const notificationIds = notifications.map((n) => n._id);
//     await Notification.updateMany(
//       { _id: { $in: notificationIds }, "recipients.userId": userId },
//       { $set: { "recipients.$[elem].read": true } },
//       { arrayFilters: [{ "elem.userId": userId }] }
//     );
//   }

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
