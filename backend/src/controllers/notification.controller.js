import Notification from "../model/notification.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

// 🔹 FETCH Notifications (no auto mark)
export const AllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const onlyUnread = req.query.onlyUnread === "true"; // optional toggle

  // === Base query ===
  const baseQuery = {
    $or: [{ "recipients.userId": userId }, { isGlobal: true }],
  };

  // === If only unread notifications are requested ===
  if (onlyUnread) {
    baseQuery["recipients"] = {
      $elemMatch: {
        userId,
        read: false,
      },
    };
  }

  // === Fetch paginated notifications ===
  const notifications = await Notification.find(baseQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(baseQuery);

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

// 🔹 MARK Specific Notifications As Read
export const MarkNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { ids } = req.body; // array of notification IDs to mark read

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "No notification IDs provided"));
  }

  await Notification.updateMany(
    {
      _id: { $in: ids },
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

  res
    .status(200)
    .json(new ApiResponse(200, "Notifications marked as read successfully"));
});
