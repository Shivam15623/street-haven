import StaffFeedback from "../model/staffFeedback.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const createStaffFeedBack = asyncHandler(async (req, res) => {
  const {
    date,
    category,
    location,
    description,
    witnesses,
    actionsTaken,

  } = req.body;
  const submittedBy = req.user._id;
  const newfeedBack = await StaffFeedback.create({
    date,
    category,
    location,
    description,
    witnesses,
    actionsTaken,

    submittedBy,
  });
  if (!newfeedBack) {
    throw new ApiError(500, "Failed to create incident report");
  }
  res
    .status(201)
    .json(new ApiResponse(true, "Staff feedback created successfully"));
});

export const GetAllStaffFeedBack = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const query = {};

  // Search in title, keyHighlights, topics, attendees
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
   
    ];
  }
  const allfeedbackSubmissions = await StaffFeedback.find(query)
    .populate("submittedBy", "firstname lastname email") 
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await StaffFeedback.countDocuments(query);
  return res.status(200).json(
    new ApiResponse(200, "Staff Feedback Submissions fetched successfully", {
      allfeedbackSubmissions,
      paggination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
export const editStaffFeedBack = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    date,
    category,
    location,
    description,
    witnesses,
    actionsTaken,
  } = req.body;

  const feedback = await StaffFeedback.findById(id);

  if (!feedback) {
    throw new ApiError(404, "Staff feedback not found");
  }

  // // 🔒 Ownership check (optional but recommended)
  // if (feedback.submittedBy.toString() !== req.user._id.toString()) {
  //   throw new ApiError(403, "You are not allowed to edit this feedback");
  // }

  // Update fields
  feedback.date = date ?? feedback.date;
  feedback.category = category ?? feedback.category;
  feedback.location = location ?? feedback.location;
  feedback.description = description ?? feedback.description;
  feedback.witnesses = witnesses ?? feedback.witnesses;
  feedback.actionsTaken = actionsTaken ?? feedback.actionsTaken;

  await feedback.save();

  res.status(200).json(
    new ApiResponse(true, "Staff feedback updated successfully", feedback)
  );
});

export const deleteStaffFeedBack = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await StaffFeedback.findById(id);

  if (!feedback) {
    throw new ApiError(404, "Staff feedback not found");
  }

  // // 🔒 Ownership check (optional)
  // if (feedback.submittedBy.toString() !== req.user._id.toString()) {
  //   throw new ApiError(403, "You are not allowed to delete this feedback");
  // }

  await feedback.deleteOne();

  res.status(200).json(
    new ApiResponse(true, "Staff feedback deleted successfully")
  );
});

