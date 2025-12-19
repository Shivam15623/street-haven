import mongoose from "mongoose";
import { io } from "../index.js";
import Comment from "../model/comments.js";

import Ticket from "../model/ticket.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { createNotification } from "../helper/CreateNotoification.js";
import path from "path";
export const createTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
      description,
      createdBy: userId,
      priority,
      category,
      location,
    };
    if (uploadedFile?.url) {
      payload.photo = {
        fileName: uploadedFile.original_filename || "photo",
        fileUrl: uploadedFile.secure_url,
      };
    }

    // Create ticket inside transaction
    const ticket = await Ticket.create([payload], { session });
    if (!ticket || ticket.length === 0) {
      throw new ApiError(500, "Ticket creation failed");
    }

    // Create notifications inside transaction
    const admins = await User.find(
      { role: { $in: ["admin", "manager", "director", "super_admin"] } },
      "_id firstname lastname email",
      { session }
    );

    if (admins && admins.length > 0) {
      const recipients = admins.map((admin) => ({ userId: admin._id }));

      const notification = await createNotification(
        {
          recipients,
          type: "ticket_created",
          title: "New Ticket Created",
          message: `A new ticket "${reqTitle}" has been created by ${req.user.firstname} ${req.user.lastname}.`,
          link: `/it_facility?tab=track_tickets&status=Open`,
          createdBy: userId,
          meta: { ticketId: ticket[0]._id, priority },
        },

        session
      );

      // Emit notification via Socket.IO
      recipients.forEach((r) => {
        io.to(`user_${r.userId.toString()}`).emit(
          "newNotification",
          notification[0]
        );
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(201, "Ticket created successfully"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err; // Will be handled by asyncHandler
  }
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
  if (["admin", "manager", "director", "super_admin"].includes(role)) {
    // Admin can change assigned person
    if (assignedId && assignedId !== ticket.assignedTo?.toString()) {
      updatedFields.assignedTo = assignedId;
    } else if (!assignedId && ticket.assignedTo === null) {
      updatedFields.assignedTo = null;
    }
    // Admin can change status freely
    if (status && status !== ticket.status) {
      updatedFields.status = status;
    }
    // Admin can also edit requester fields if you want
    if (priority && priority !== ticket.priority) {
      updatedFields.priority = priority;
    }
    if (description && description !== ticket.description) {
      updatedFields.description = description;
    }
    if (requestTitle && requestTitle !== ticket.req_title) {
      updatedFields.req_title = requestTitle;
    }
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
  if (
    !["admin", "manager", "director", "super_admin"].includes(req.user.role)
  ) {
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
  if (["admin", "manager", "director", "super_admin"].includes(req.user.role)) {
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

  if (!message && (!req.files || req.files.length === 0)) {
    throw new ApiError(
      400,
      "Comment message or at least one attachment is required"
    );
  }

  // Cloudinary uploads
  let attachments = [];
  if (req.files?.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const uploadedFile = await uploadOnCloudinary(file.path);

      if (!uploadedFile?.secure_url) {
        throw new ApiError(
          500,
          `Attachment upload failed for ${file.originalname}`
        );
      }

      const ext = path.extname(file.originalname).toLowerCase();
      let type = "other";
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext))
        type = "image";
      else if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) type = "video";
      else if ([".mp3", ".wav", ".ogg"].includes(ext)) type = "audio";
      else if ([".pdf"].includes(ext)) type = "pdf";
      else if ([".doc", ".docx"].includes(ext)) type = "doc";
      else if ([".xls", ".xlsx"].includes(ext)) type = "excel";
      else if ([".zip", ".rar"].includes(ext)) type = "zip";

      return {
        fileName: uploadedFile.original_filename,
        fileUrl: uploadedFile.secure_url,
        size: uploadedFile.bytes,
        type,
      };
    });

    attachments = await Promise.all(uploadPromises);
  }
  const payload = { ticketId, userId };
  if (message) {
    payload.message = message;
  }
  if (attachments.length !== 0) {
    payload.attachments = attachments;
  }
  const comment = await Comment.create(payload);

  const populatedComment = await Comment.findById(comment._id).populate(
    "userId",
    "firstname lastname email"
  );

  io.to(ticketId).emit("newComment", populatedComment);

  res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", populatedComment));
});
