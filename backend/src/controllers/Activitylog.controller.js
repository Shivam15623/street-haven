import { asyncHandler } from "../utills/AsyncHandler.js";

export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 });
  res.status(200).json(logs);
})