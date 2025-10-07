import mongoose from "mongoose";
import { activeTicketUsers, io } from "../index.js";
import Comment from "../model/comments.js";
import Notification from "../model/notification.js";
import Ticket from "../model/ticket.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";

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

    const payload= {
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
      { role: "admin" },
      "_id firstname lastname email",
      { session }
    );

    if (admins && admins.length > 0) {
      const recipients = admins.map((admin) => ({ userId: admin._id }));

      const notification = await Notification.create(
        [
          {
            recipients,
            type: "ticket_created",
            title: "New Ticket Created",
            message: `A new ticket "${reqTitle}" has been created by ${req.user.firstname} ${req.user.lastname}.`,
            link: `/it_facility?tab=track_tickets&status=Open`,
            createdBy: userId,
            meta: { ticketId: ticket[0]._id, priority },
          },
        ],
        { session }
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
  console.log(status);
  // Find the ticket
  const ticket = await Ticket.findById(ticketId);
  let notifymessages = [];
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

  // --- Notification logic ---
  const ticket = await Ticket.findById(ticketId).populate(
    "createdBy assignedTo",
    "_id firstname lastname email"
  );
  if (ticket) {
    // Determine recipients: creator + assigned user, excluding comment author
    const recipients = [];
    if (
      ticket.createdBy &&
      ticket.createdBy._id.toString() !== userId.toString()
    ) {
      recipients.push(ticket.createdBy._id);
    }
    if (
      ticket.assignedTo &&
      ticket.assignedTo._id.toString() !== userId.toString()
    ) {
      recipients.push(ticket.assignedTo._id);
    }
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      admins.map((a) => recipients.push(a._id));
    }

    if (recipients.length > 0) {
      const notification = await Notification.create({
        recipients: recipients.map((u) => ({ userId: u, read: false })),
        type: "ticket_comment",
        title: "New Comment Added",
        message: `${req.user.firstname} commented on ticket "${ticket.req_title}"`,
        link: `/it_facility?tab=track_tickets&status=${ticket.status}`,
        createdBy: userId,
       
        meta: { ticketId, commentId: comment._id },
      });

      // --- Emit notification only to users NOT currently viewing the ticket ---
      recipients.forEach((r) => {
        if (!activeTicketUsers[ticketId]?.has(r)) {
          io.to(`user_${r.toString()}`).emit("newNotification", notification);
          console.log(`user_${r.toString()}`);
        }
      });
    }
  }

  res.status(201).json(new ApiResponse(201, "Comment added successfully"));
});
