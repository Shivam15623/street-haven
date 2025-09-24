import Ticket from "../model/ticket.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";

export const createTicket = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { reqTitle, description, priority, category, location } = req.body;
  const photoPath = req?.file?.path;
  let uploadedFile;
  if (photoPath) {
    uploadedFile = await uploadOnCloudinary(photoPath);
    if (!uploadedFile?.url) {
      throw new ApiError(500, "photo upload failed");
    }
  }
  const payload = {
    req_title: reqTitle,
    description: description,
    createdBy: userId,
    priority: priority,
    category: category,
    location: location,
  };
  if (uploadedFile?.url) {
    payload.photo = {
      fileName: uploadedFile.original_filename || "photo",
      fileUrl: uploadedFile.url,
    };
  }

  const ticket = await Ticket.create(payload);
  if (!ticket) {
    throw new ApiError(500, "Server side Error");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, "Ticket created successfully"));
});

export const FetchTickets = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    order = "desc",
    status = "All",
    priority = "All",
    search = "",
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  // ✅ Build filter
  const filter = {};

  if (status && status !== "All") {
    filter.status = status;
  }

  if (priority && priority !== "All") {
    filter.priority = priority;
  }

  // ✅ Search (case-insensitive)
  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { ticketId: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Sorting
  const sortOrder = order === "asc" ? 1 : -1;

  // ✅ Fetch data with pagination
  const tickets = await Ticket.find(filter)
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email");

  // ✅ Count total docs with current filter
  const total = await Ticket.countDocuments(filter);

  // ✅ Get global counts (independent of filter)
  const [open, inProgress, completed, underReview, all] = await Promise.all([
    Ticket.countDocuments({ status: "Open" }),
    Ticket.countDocuments({ status: "In Progress" }),
    Ticket.countDocuments({ status: "Completed" }),
    Ticket.countDocuments({ status: "Under Review" }),
    Ticket.countDocuments({}),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Tickets fetched successfully", {
      counts: {
        open,
        inProgress,
        completed,
        underReview,
        total: all,
      },
      tickets,
      paggination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  );
});
