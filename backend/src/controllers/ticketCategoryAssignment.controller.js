import TicketCategoryAssignment from "../model/TicketCategoryAssignment.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const upsertCategoryAssignment = asyncHandler(async (req, res) => {
  const { category, agents } = req.body;

  if (!category || !Array.isArray(agents) || agents.length === 0) {
    throw new ApiError(400, "Category and agents are required");
  }

  /**
   * agents format:
   * [
   *   { user: "userId1", priority: 1, active: true },
   *   { user: "userId2", priority: 2 }
   * ]
   */

  const assignment = await TicketCategoryAssignment.findOneAndUpdate(
    { category },
    {
      $set: {
        category,
        agents,
      },
    },
    {
      new: true,
      upsert: true, // creates if not exists
      runValidators: true,
    }
  ).populate("agents.user", "firstname lastname email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Category assignment saved successfully", assignment)
    );
});
