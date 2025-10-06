import { io } from "../index.js";
import Comment from "../model/comments.js";
import Ticket from "../model/ticket.js";
import { ApiError } from "../utills/ApiError.js";
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
      fileUrl: uploadedFile.secure_url,
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
export const editTicket = asyncHandler(async (req, res) => {
  const {
    assignedId,
    status,
    description,
    requestTitle,
    category,
    location,
    priority,
  } = req.body;
  const { id: ticketId } = req.params;
  const { role, _id: userId } = req.user;
  console.log(status);
  // Find the ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "No Such Ticket found");
  }

  const photoPath = req?.file?.path;
  let uploadedFile;
  if (photoPath) {
    uploadedFile = await uploadOnCloudinary(photoPath);
    if (!uploadedFile?.secure_url) {
      throw new ApiError(500, "photo upload failed");
    }
  }

  // Keep track of fields to update
  let updatedFields = {};

  if (role === "admin") {
    // Admin can change assigned person
    if (assignedId && assignedId !== ticket.assignedTo?.toString()) {
      updatedFields.assignedTo = assignedId;
    }
    // Admin can change status freely
    if (status && status !== ticket.status) {
      updatedFields.status = status;
    }
    // Admin can also edit requester fields if you want
    if (priority && priority !== ticket.priority)
      updatedFields.priority = priority;
    if (description && description !== ticket.description)
      updatedFields.description = description;
    if (requestTitle && requestTitle !== ticket.req_title)
      updatedFields.req_title = requestTitle;
    if (category && category !== ticket.category)
      updatedFields.category = category;
    if (uploadedFile && uploadedFile.secure_url !== ticket.photo)
      updatedFields.photo = {
        fileName: uploadedFile.original_filename,
        fileUrl: uploadedFile.secure_url,
      };
    if (location && location !== ticket.location)
      updatedFields.location = location;
  } else if (ticket.assignedTo?.toString() === userId.toString()) {
    // Assigned person can only change status
    if (status && status !== ticket.status) {
      updatedFields.status = status;
    }
  } else if (ticket.createdBy?.toString() === userId.toString()) {
    // Requester can change description, title, category, photo, location
    if (description && description !== ticket.description) {
      updatedFields.description = description;
    }
    if (requestTitle && requestTitle !== ticket.req_title) {
      updatedFields.req_title = requestTitle;
    }
    if (category && category !== ticket.category) {
      updatedFields.category = category;
    }
    if (priority && priority !== ticket.priority)
      updatedFields.priority = priority;
    if (uploadedFile && uploadedFile.secure_url !== ticket.photo) {
      updatedFields.photo = {
        fileName: uploadedFile.original_filename || "photo",
        fileUrl: uploadedFile.secure_url,
      };
    }
    if (location && location !== ticket.location) {
      updatedFields.location = location;
    }
  } else {
    throw new ApiError(403, "You are not authorized to edit this ticket");
  }

  // If nothing to update
  if (Object.keys(updatedFields).length === 0) {
    return res.status(200).json(new ApiResponse(200, "No changes were made"));
  }

  // Update ticket
  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    updatedFields,
    { new: true }
  )
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email");

  res.status(200).json(new ApiResponse(200, "Ticket updated successfully"));
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

  // ✅ Base filter
  const filter = {};

  if (status && status !== "All") {
    filter.status = status;
  }

  if (priority && priority !== "All") {
    filter.priority = priority;
  }

  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { ticketId: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Permission filter
  if (req.user.role !== "admin") {
    filter.$or = [
      ...(filter.$or || []), // keep existing search filters
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
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

  // ✅ Global counts (only admins see global, others see limited counts)
  let counts;
  if (req.user.role === "admin") {
    const [open, inProgress, completed, underReview, all] = await Promise.all([
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({ status: "Completed" }),
      Ticket.countDocuments({ status: "Under Review" }),
      Ticket.countDocuments({}),
    ]);
    counts = { open, inProgress, completed, underReview, total: all };
  } else {
    const [open, inProgress, completed, underReview, all] = await Promise.all([
      Ticket.countDocuments({
        status: "Open",
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      }),
      Ticket.countDocuments({
        status: "In Progress",
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      }),
      Ticket.countDocuments({
        status: "Completed",
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      }),
      Ticket.countDocuments({
        status: "Under Review",
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      }),
      Ticket.countDocuments({
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      }),
    ]);
    counts = { open, inProgress, completed, underReview, total: all };
  }

  return res.status(200).json(
    new ApiResponse(200, "Tickets fetched successfully", {
      counts,
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

export const FetchComments = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const comments = await Comment.find({ ticketId })
    .populate("userId", "firstname lastname email") // fetch user info
    .sort({ createdAt: -1 }) // oldest first, change to -1 for newest first
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ ticketId });
  res.status(200).json(
    new ApiResponse(200, "Upcoming Events fetched successfully", {
      comments: comments,
      paggination: {
        total: total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  );
});
export const AddComment = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id;
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Comment message is required");
  }

  // Upload attachments to Cloudinary
  let attachments = [];
  console.log("vdfgdfgdfgrtergrthrtheryheryjh",req.files);
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );
    const results = await Promise.all(uploadPromises);
    attachments = results.map((r) => r.secure_url);
  }

  // Create comment
  const comment = await Comment.create({
    ticketId,
    userId,
    message,
    attachments,
  });

  // Populate user info for the frontend
  const populatedComment = await Comment.findById(comment._id).populate(
    "userId",
    "firstname lastname email"
  );

  // Emit to all clients in the ticket room
  io.to(ticketId).emit("newComment", populatedComment);

  res.status(201).json(new ApiResponse(201, "Comment added successfully"));
});
