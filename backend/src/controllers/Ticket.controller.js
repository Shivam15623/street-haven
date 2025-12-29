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
import { PERMISSIONS } from "../auth/permissions.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";
export const createTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { reqTitle, description, priority, category, location } = req.body;

    /* ======================
       PHOTO UPLOAD
    ====================== */
    let uploadedFile;
    if (req.file?.path) {
      uploadedFile = await uploadOnCloudinary(req.file.path);
      if (!uploadedFile?.secure_url) {
        throw new ApiError(500, "Photo upload failed");
      }
    }

    /* ======================
       CREATE TICKET PAYLOAD
    ====================== */
    const payload = {
      req_title: reqTitle,
      description,
      createdBy: userId,
      priority,
      category,
      location,
      status: "Open",
      statusHistory: [
        {
          status: "Open",
          changedBy: userId,
          changedAt: new Date(),
        },
      ],
    };

    if (uploadedFile) {
      payload.photo = {
        fileName: uploadedFile.original_filename || "photo",
        fileUrl: uploadedFile.secure_url,
      };
    }

    /* ======================
       CREATE TICKET
    ====================== */
    const [ticket] = await Ticket.create([payload], { session });
    if (!ticket) throw new ApiError(500, "Ticket creation failed");

    /* ======================
       NOTIFY USERS WITH PERMISSION
    ====================== */
    const categoryPermission =
      category === "Property Maintenance"
        ? PERMISSIONS.VIEW_PROPERTY_TICKETS
        : PERMISSIONS.VIEW_IT_TICKETS;

    const admins = await User.find(
      {
        $or: [
          { rolePermissions: categoryPermission },
          { customPermissions: categoryPermission },
        ],
      },
      "_id firstname lastname email",
      { session }
    );

    if (admins.length > 0) {
      const recipients = admins.map((u) => ({ userId: u._id }));

      const notification = await createNotification(
        {
          recipients,
          action: "created",
          category: "ticket",
          severity: "info",
          title: "New Ticket Created",
          message: `A new ticket "${reqTitle}" was created by ${req.user.firstname} ${req.user.lastname}.`,
          link: `/it_facility?tab=track_tickets&status=Open`,
          createdBy: userId,
          meta: {
            ticketId: ticket._id,
            priority,
            category,
          },
        },
        session
      );

      // Emit socket notifications
      recipients.forEach((r) => {
        io.to(`user_${r.userId.toString()}`).emit(
          "newNotification",
          notification
        );
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, "Ticket created successfully", ticket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const editTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
    const userId = req.user._id.toString();

    let statusChanged = false;
    let assigneeChanged = false;
    let requesterFieldsChanged = false;

    /* ======================
       PERMISSIONS
    ====================== */
    const rolePermissions = ROLE_PERMISSIONS[req.user.role] ?? [];
    const customPermissions = req.user.customPermissions ?? [];
    const permissions = new Set([...rolePermissions, ...customPermissions]);

    /* ======================
       FETCH TICKET
    ====================== */
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) throw new ApiError(404, "No such ticket found");

    const isRequester = ticket.createdBy.equals(userId);
    const isAssigned = ticket.assignedTo?.equals(userId);

    const categoryPermission =
      ticket.category === "Property Maintenance"
        ? PERMISSIONS.VIEW_PROPERTY_TICKETS
        : PERMISSIONS.VIEW_IT_TICKETS;

    /* ======================
       FILE UPLOAD
    ====================== */
    let uploadedFile;
    if (req.file?.path) {
      uploadedFile = await uploadOnCloudinary(req.file.path);
      if (!uploadedFile?.secure_url) {
        throw new ApiError(500, "Photo upload failed");
      }
    }

    const updatedFields = {};
    const updateOps = {};

    /* ======================
       ASSIGNMENT
    ====================== */
    if (
      assignedId &&
      assignedId !== ticket.assignedTo?.toString() &&
      permissions.has(categoryPermission)
    ) {
      updatedFields.assignedTo = assignedId;
      assigneeChanged = true;

      updateOps.$push = {
        ...(updateOps.$push || {}),
        assignmentHistory: {
          assignedTo: assignedId,
          assignedBy: userId,
          assignedAt: new Date(),
        },
      };
    }

    /* ======================
       STATUS
    ====================== */
    if (
      status &&
      status !== ticket.status &&
      (permissions.has(categoryPermission) || isAssigned)
    ) {
      updatedFields.status = status;
      statusChanged = true;

      updateOps.$push = {
        ...(updateOps.$push || {}),
        statusHistory: {
          status,
          changedBy: userId,
          changedAt: new Date(),
        },
      };

      if (status === "Completed") {
        updatedFields.resolvedAt = new Date();
      }
    }

    /* ======================
       REQUESTER FIELDS
    ====================== */
    if (isRequester) {
      const hasChanges =
        description !== ticket.description ||
        requestTitle !== ticket.req_title ||
        priority !== ticket.priority ||
        category !== ticket.category ||
        location !== ticket.location ||
        uploadedFile;

      requesterFieldsChanged = hasChanges;

      if (description && description !== ticket.description)
        updatedFields.description = description;

      if (requestTitle && requestTitle !== ticket.req_title)
        updatedFields.req_title = requestTitle;

      if (category && category !== ticket.category)
        updatedFields.category = category;

      if (priority && priority !== ticket.priority)
        updatedFields.priority = priority;

      if (location && location !== ticket.location)
        updatedFields.location = location;

      if (uploadedFile && uploadedFile.secure_url !== ticket.photo?.fileUrl) {
        updatedFields.photo = {
          fileName: uploadedFile.original_filename || "photo",
          fileUrl: uploadedFile.secure_url,
        };
      }
    }

    /* ======================
       NO CHANGES
    ====================== */
    if (!Object.keys(updatedFields).length && !Object.keys(updateOps).length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json(new ApiResponse(200, "No changes were made"));
    }

    /* ======================
       UPDATE TICKET
    ====================== */
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { ...updatedFields, ...updateOps },
      { new: true, session }
    )
      .populate("createdBy", "firstname lastname email")
      .populate("assignedTo", "firstname lastname email");

    /* ======================
       NOTIFICATIONS
    ====================== */
    const recipientsSet = new Set();

    if (statusChanged) {
      recipientsSet.add(ticket.createdBy.toString());
      if (ticket.assignedTo) {
        const latestAssignedBy =
          ticket.assignmentHistory[ticket.assignmentHistory.length - 1]
            .assignedBy;

        recipientsSet.add(latestAssignedBy.toString());
      }

      if (ticket.assignedTo) recipientsSet.add(ticket.assignedTo.toString());
    }

    if (assigneeChanged) {
      recipientsSet.add(ticket.createdBy.toString());
      if (ticket.assignedTo) {
        const latestAssignedBy =
          ticket.assignmentHistory[ticket.assignmentHistory.length - 1]
            .assignedBy;

        recipientsSet.add(latestAssignedBy.toString());
      }
      recipientsSet.add(assignedId);
    }

    if (requesterFieldsChanged && ticket.assignedTo) {
      recipientsSet.add(ticket.assignedTo.toString());
    }

    recipientsSet.delete(userId); // ❌ no self notifications

    const recipients = [...recipientsSet].map((id) => ({ userId: id }));

    if (recipients.length) {
      const messageParts = [];
      if (statusChanged) messageParts.push(`status changed to "${status}"`);
      if (assigneeChanged) messageParts.push("ticket was reassigned");
      if (requesterFieldsChanged)
        messageParts.push("ticket details were updated");

      const notification = await createNotification(
        {
          recipients,
          action: "updated",
          category: "ticket",
          severity: "info",
          title: "Ticket Updated",
          message: `Ticket "${ticket.req_title}" ${messageParts.join(", ")}.`,
          link: `/it_facility?tab=track_tickets&ticketId=${ticketId}`,
          createdBy: userId,
          meta: { ticketId, statusChanged, assigneeChanged },
        },
        session
      );

      recipients.forEach((r) => {
        io.to(`user_${r.userId}`).emit("newNotification", notification);
      });
    }

    /* ======================
       COMMIT
    ====================== */
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json(new ApiResponse(200, "Ticket updated successfully", updatedTicket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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

  page = Number(page);
  limit = Number(limit);

  const filter = {};
  const andConditions = [];

  /* ----------------------------------
     BASIC FILTERS
  -----------------------------------*/
  if (status !== "All") filter.status = status;
  if (priority !== "All") filter.priority = priority;

  if (search.trim()) {
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
      ],
    });
  }

  /* ----------------------------------
     EFFECTIVE PERMISSIONS
  -----------------------------------*/
  const rolePermissions = ROLE_PERMISSIONS[req.user.role] ?? [];
  const customPermissions = req.user.customPermissions ?? [];

  const effectivePermissions = new Set([
    ...rolePermissions,
    ...customPermissions,
  ]);

  /* ----------------------------------
     PERMISSION SCOPE (VISIBILITY)
  -----------------------------------*/
  const visibilityOr = [];

  // Always allow own tickets
  visibilityOr.push({ createdBy: req.user._id }, { assignedTo: req.user._id });

  // Category-based permissions
  if (effectivePermissions.has(PERMISSIONS.VIEW_IT_TICKETS)) {
    visibilityOr.push({ category: "IT Help Desk" });
  }

  if (effectivePermissions.has(PERMISSIONS.VIEW_PROPERTY_TICKETS)) {
    visibilityOr.push({ category: "Property Maintenance" });
  }

  // Full access overrides everything
  if (
    effectivePermissions.has(PERMISSIONS.VIEW_PROPERTY_TICKETS) &&
    effectivePermissions.has(PERMISSIONS.VIEW_IT_TICKETS)
  ) {
    visibilityOr.length = 0; // 🔥 remove restrictions
  }

  if (visibilityOr.length) {
    andConditions.push({ $or: visibilityOr });
  }

  if (andConditions.length) {
    filter.$and = andConditions;
  }

  /* ----------------------------------
     FETCH TICKETS
  -----------------------------------*/
  const sortOrder = order === "asc" ? 1 : -1;

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email");

  const total = await Ticket.countDocuments(filter);

  /* ----------------------------------
     COUNTS (PERMISSION-BASED)
  -----------------------------------*/
  const countByStatus = async (ticketStatus) => {
    const cFilter = {};
    if (ticketStatus) cFilter.status = ticketStatus;

    if (visibilityOr.length) cFilter.$or = visibilityOr;

    return Ticket.countDocuments(cFilter);
  };

  const [open, inProgress, completed, underReview, all] = await Promise.all([
    countByStatus("Open"),
    countByStatus("In Progress"),
    countByStatus("Completed"),
    countByStatus("Under Review"),
    countByStatus(),
  ]);

  const counts = { open, inProgress, completed, underReview, total: all };

  /* ----------------------------------
     RESPONSE
  -----------------------------------*/
  return res.status(200).json(
    new ApiResponse(200, "Tickets fetched successfully", {
      counts,
      tickets,
      pagination: {
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
  const { message, clientId } = req.body;

  if (!message && (!req.files || req.files.length === 0)) {
    throw new ApiError(
      400,
      "Comment message or at least one attachment is required"
    );
  }

  // Cloudinary uploads
  const typeMap = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    video: [".mp4", ".mov", ".avi", ".mkv"],
    audio: [".mp3", ".wav", ".ogg"],
    pdf: [".pdf"],
    doc: [".doc", ".docx"],
    ppt: [".ppt", ".pptx"],
    excel: [".xls", ".xlsx"],
    zip: [".zip", ".rar"],
  };

  const detectFileType = (ext) => {
    return (
      Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) || "other"
    );
  };
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

      return {
        fileName: uploadedFile.original_filename,
        fileUrl: uploadedFile.secure_url,
        size: uploadedFile.bytes,
        type: detectFileType(ext),
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
  console.log(populatedComment);
  io.to(ticketId).emit("newComment", { comment: populatedComment, clientId });

  res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", populatedComment));
});
