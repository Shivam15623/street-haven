import ActivityLog from "../model/ActivityLog.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

// GET /activity-logs?search=&page=1&limit=10&sort=createdAt&order=desc&type=user|system|all
export const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
    order = "desc",
    type = "all", // user / system / all
  } = req.query;

  // Pagination calculations
  const skip = (Number(page) - 1) * Number(limit);

  // --- FILTER CONDITIONS ---
  const filters = {};

  // 1️⃣ Search (by message, module name, user name, etc.)
  if (search) {
    filters.$or = [
      { message: { $regex: search, $options: "i" } },
      { module: { $regex: search, $options: "i" } },
      { userName: { $regex: search, $options: "i" } },
    ];
  }

  // 2️⃣ Filter by type
  if (type === "user") filters.type = "USER";
  else if (type === "system") filters.type = "SYSTEM";

  // --- SORT ---
  const sortQuery = { [sort]: order === "asc" ? 1 : -1 };

  // --- FETCH LOGS WITH PAGINATION ---
  const [logs, total] = await Promise.all([
    ActivityLog.find(filters).sort(sortQuery).skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments(filters),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Activity Logs Fetched Successfully", {
      paggination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      logs,
    })
  );
});
