import mongoose from "mongoose";
import { io } from "../index.js";
import Comment from "../model/comments.js";
import { notifyTicketEmail } from "../helper/notifyTicketEvent.js";
import Ticket, { TICKET_STATUS } from "../model/ticket.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { createNotification } from "../helper/CreateNotoification.js";
import path from "path";
import { PERMISSIONS } from "../auth/permissions.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";
import { getAssignedAgentByCategory } from "../helper/getAssignedUser.js";
import Location from "../model/location.js";
import { generateEmailTemplate } from "../helper/EmailsMailer/emailTemplates.js";
import { sendEmail } from "../helper/EmailsMailer/emailSender.js";
import { addCommentForEntity, fetchCommentsForEntity } from "./comments.controller.js";

export const createTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { reqTitle, description, category, location } = req.body;

    /* ======================
       VALIDATE LOCATION EXISTS
    ====================== */
    const locationDoc = await Location.findById(location)
      .populate("managers", "_id firstname lastname email")
      .session(session);

    if (!locationDoc) {
      throw new ApiError(404, "Selected location not found");
    }
    if (!locationDoc.isActive) {
      throw new ApiError(400, "Selected location is not active");
    }

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
      category,
      location,
      status: TICKET_STATUS.OPEN,
      statusHistory: [
        {
          status: TICKET_STATUS.OPEN,
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
       NOTIFY MANAGERS FOR THIS LOCATION
    ====================== */
    const managers = locationDoc.managers; // already populated above

    if (managers.length === 0) {
      // Decide now: don't let this fail silently in production.
      // Options: notify a fallback/admin queue, or flag the ticket for manual routing.
      console.warn(
        `Ticket ${ticket.slug} created for location "${locationDoc.name}" with no assigned managers.`,
      );
      // await notifyFallbackQueue(ticket); // implement if you want this safety net
    } else {
      const recipients = managers.map((m) => ({ userId: m._id }));

      const notification = await createNotification(
        {
          recipients,
          action: "created",
          category: "ticket",
          severity: "info",
          title: "New Ticket Awaiting Approval",
          message: `A new ticket "${reqTitle}" was submitted by ${req.user.firstname} ${req.user.lastname} for ${locationDoc.name}.`,
          link: `/it_facility?tab=track_tickets&status=pending&item=${ticket.slug}`,
          createdBy: userId,
          meta: {
            ticketId: ticket.slug,
            category,
            location: locationDoc.name,
          },
        },
        session,
      );
      await Promise.all(
        managers.map((manager) => {
          const emailContent = generateEmailTemplate({
            type: "ticket_pending_manager",
            data: {
              managerName: `${manager.firstname} ${manager.lastname}`,
              ticketTitle: ticket.req_title,
              category: ticket.category,
              location: locationDoc.name,
              createdBy: `${req.user.firstname} ${req.user.lastname}`,
              link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=pending&item=${ticket.slug}`,
            },
          });

          return sendEmail({
            to: manager.email,
            ...emailContent,
          });
        }),
      );
      recipients.forEach((r) => {
        io.to(`user_${r.userId.toString()}`).emit(
          "newNotification",
          notification,
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
const FACILITIES_MANAGER_ID = process.env.FACILITIES_MANAGER_ID;

/* ======================
   SHARED HELPER
====================== */
async function isManagerOfTicketLocation(userId, locationId, session) {
  const location = await Location.findOne({
    _id: locationId,
    managers: userId,
  }).session(session);
  return !!location;
}

async function notifyAndEmit(
  session,
  { recipients, title, message, link, createdBy, meta },
) {
  if (!recipients.length) return;
  const notification = await createNotification(
    {
      recipients,
      action: "updated",
      category: "ticket",
      severity: "info",
      title,
      message,
      link,
      createdBy,
      meta,
    },
    session,
  );
  recipients.forEach((r) => {
    io.to(`user_${r.userId}`).emit("newNotification", notification);
  });
  return notification;
}

/* ======================
   APPROVE
====================== */
export const approveTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: ticketId } = req.params;
    const { priority } = req.body;
    const userId = req.user._id.toString();

    if (!priority)
      throw new ApiError(400, "Priority is required to approve a ticket");

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) throw new ApiError(404, "No such ticket found");

    if (ticket.status !== TICKET_STATUS.OPEN) {
      throw new ApiError(
        400,
        `Ticket is already ${ticket.status}, cannot approve`,
      );
    }

    const isManager = await isManagerOfTicketLocation(
      userId,
      ticket.location,
      session,
    );
    if (!isManager)
      throw new ApiError(
        403,
        "You are not a manager for this ticket's location",
      );

    if (!FACILITIES_MANAGER_ID) {
      throw new ApiError(500, "Facilities manager is not configured");
    }

    ticket.priority = priority;
    ticket.priorityLocked = true;
    ticket.status = TICKET_STATUS.APPROVED;
    ticket.approvedBy = userId;
    ticket.assignedTo = new mongoose.Types.ObjectId(FACILITIES_MANAGER_ID);

    ticket.statusHistory.push({
      status: TICKET_STATUS.APPROVED,
      changedBy: userId,
      changedAt: new Date(),
    });
    ticket.assignmentHistory.push({
      assignedTo: FACILITIES_MANAGER_ID,
      assignedBy: userId,
      assignedAt: new Date(),
    });

    await ticket.save({ session });

    /* ======================
       FETCH EVERYONE WE NEED TO NOTIFY / EMAIL
    ====================== */
    const [creator, approver, facilitiesUser, locationDoc] = await Promise.all([
      User.findById(ticket.createdBy).select("firstname lastname email").session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      User.findById(FACILITIES_MANAGER_ID).select("firstname lastname email").session(session),
      Location.findById(ticket.location).select("name").session(session),
    ]);

    const locationName = locationDoc?.name || "Unknown location";
    const approverName = approver ? `${approver.firstname} ${approver.lastname}` : "Manager";

    /* ======================
       IN-APP NOTIFICATIONS (different message per audience)
    ====================== */
    // Creator: "your request was approved"
    if (creator && creator._id.toString() !== userId) {
      await notifyAndEmit(session, {
        recipients: [{ userId: creator._id.toString() }],
        title: "Ticket Approved",
        message: `Your ticket "${ticket.req_title}" was approved and is now queued for work.`,
        link: `/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug, priority },
      });
    }

    // Facilities user: "you have new work assigned"
    if (facilitiesUser && facilitiesUser._id.toString() !== userId) {
      await notifyAndEmit(session, {
        recipients: [{ userId: facilitiesUser._id.toString() }],
        title: "New Ticket Assigned to You",
        message: `Ticket "${ticket.req_title}" (${priority} priority) has been assigned to you.`,
        link: `/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug, priority },
      });
    }

    /* ======================
       EMAILS (different template per audience)
    ====================== */
    if (creator && creator._id.toString() !== userId) {
      await notifyTicketEmail({
        userIds: [creator._id],
        templateType: "ticket_approved",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: ticket.category,
          location: locationName,
          approvedBy: approverName,
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        }),
        session,
      });
    }

    if (facilitiesUser && facilitiesUser._id.toString() !== userId) {
      await notifyTicketEmail({
        userIds: [facilitiesUser._id],
        templateType: "ticket_assigned",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: ticket.category,
          location: locationName,
          priority,
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        }),
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket approved", ticket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

/* ======================
   REJECT
====================== */
export const rejectTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: ticketId } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.user._id.toString();

    if (!rejectionReason?.trim())
      throw new ApiError(400, "Rejection reason is required");

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) throw new ApiError(404, "No such ticket found");

    if (ticket.status !== TICKET_STATUS.OPEN) {
      throw new ApiError(
        400,
        `Ticket is already ${ticket.status}, cannot reject`,
      );
    }

    const isManager = await isManagerOfTicketLocation(
      userId,
      ticket.location,
      session,
    );
    if (!isManager)
      throw new ApiError(
        403,
        "You are not a manager for this ticket's location",
      );

    ticket.status = TICKET_STATUS.CLOSED;
    ticket.rejectedBy = userId;
    ticket.rejectionReason = rejectionReason.trim();
    ticket.statusHistory.push({
      status: TICKET_STATUS.REJECTED,
      changedBy: userId,
      changedAt: new Date(),
    });

    await ticket.save({ session });

    const [creator, rejector, locationDoc] = await Promise.all([
      User.findById(ticket.createdBy).select("firstname lastname email").session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      Location.findById(ticket.location).select("name").session(session),
    ]);

    const locationName = locationDoc?.name || "Unknown location";
    const rejectorName = rejector ? `${rejector.firstname} ${rejector.lastname}` : "Manager";

    if (creator && creator._id.toString() !== userId) {
      await notifyAndEmit(session, {
        recipients: [{ userId: creator._id.toString() }],
        title: "Ticket Rejected",
        message: `Your ticket "${ticket.req_title}" was rejected: ${rejectionReason.trim()}`,
        link: `/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug, rejectionReason },
      });

      await notifyTicketEmail({
        userIds: [creator._id],
        templateType: "ticket_rejected",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: ticket.category,
          location: locationName,
          rejectedBy: rejectorName,
          rejectionReason: rejectionReason.trim(),
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
        }),
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket rejected", ticket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

/* ======================
   START (assignee only)
====================== */
export const startTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: ticketId } = req.params;
    const userId = req.user._id.toString();

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) throw new ApiError(404, "No such ticket found");

    if (!ticket.assignedTo?.equals(userId)) {
      throw new ApiError(
        403,
        "Only the assigned facilities user can start this ticket",
      );
    }
    if (ticket.status !== TICKET_STATUS.APPROVED) {
      throw new ApiError(
        400,
        `Ticket must be Approved to start work, currently ${ticket.status}`,
      );
    }

    ticket.status = TICKET_STATUS.IN_PROGRESS;
    ticket.statusHistory.push({
      status: TICKET_STATUS.IN_PROGRESS,
      changedBy: userId,
      changedAt: new Date(),
    });
    await ticket.save({ session });

    const recipientIds = [
      ticket.createdBy.toString(),
      ticket.approvedBy?.toString(),
    ]
      .filter(Boolean)
      .filter((id) => id !== userId);

    if (recipientIds.length) {
      const [users, locationDoc, assignee] = await Promise.all([
        User.find({ _id: { $in: recipientIds } }).select("firstname lastname email").session(session),
        Location.findById(ticket.location).select("name").session(session),
        User.findById(userId).select("firstname lastname").session(session),
      ]);

      const locationName = locationDoc?.name || "Unknown location";
      const assigneeName = assignee ? `${assignee.firstname} ${assignee.lastname}` : "Facilities";

      await notifyAndEmit(session, {
        recipients: recipientIds.map((id) => ({ userId: id })),
        title: "Ticket In Progress",
        message: `Work has started on ticket "${ticket.req_title}".`,
        link: `/it_facility?tab=track_tickets&status=In Progress&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug },
      });

      await notifyTicketEmail({
        userIds: recipientIds,
        templateType: "ticket_in_progress",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: ticket.category,
          location: locationName,
          assignedTo: assigneeName,
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=In Progress&item=${ticket.slug}`,
        }),
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket marked in progress", ticket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

/* ======================
   COMPLETE (assignee only)
====================== */
export const completeTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: ticketId } = req.params;
    const userId = req.user._id.toString();

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) throw new ApiError(404, "No such ticket found");

    if (!ticket.assignedTo?.equals(userId)) {
      throw new ApiError(
        403,
        "Only the assigned facilities user can complete this ticket",
      );
    }
    if (ticket.status !== TICKET_STATUS.IN_PROGRESS) {
      throw new ApiError(
        400,
        `Ticket must be In Progress to complete, currently ${ticket.status}`,
      );
    }

    ticket.status = TICKET_STATUS.COMPLETED;
    ticket.resolvedAt = new Date();
    ticket.statusHistory.push({
      status: TICKET_STATUS.COMPLETED,
      changedBy: userId,
      changedAt: new Date(),
    });
    await ticket.save({ session });

    const recipientIds = [
      ticket.createdBy.toString(),
      ticket.approvedBy?.toString(),
    ]
      .filter(Boolean)
      .filter((id) => id !== userId);

    if (recipientIds.length) {
      const locationDoc = await Location.findById(ticket.location)
        .select("name")
        .session(session);
      const locationName = locationDoc?.name || "Unknown location";

      await notifyAndEmit(session, {
        recipients: recipientIds.map((id) => ({ userId: id })),
        title: "Ticket Completed",
        message: `Ticket "${ticket.req_title}" has been completed.`,
        link: `/it_facility?tab=track_tickets&status=Completed&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug },
      });

      await notifyTicketEmail({
        userIds: recipientIds,
        templateType: "ticket_completed",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: ticket.category,
          location: locationName,
          completedAt: ticket.resolvedAt.toLocaleDateString(),
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Completed&item=${ticket.slug}`,
        }),
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket completed", ticket));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

/* ======================
   CANCEL (creator only, Pending only)
====================== */
export const cancelTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;
  const userId = req.user._id.toString();

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "No such ticket found");

  if (!ticket.createdBy.equals(userId))
    throw new ApiError(403, "Only the creator can cancel this ticket");
  if (ticket.status !== TICKET_STATUS.OPEN) {
    throw new ApiError(
      400,
      "Ticket can only be cancelled while pending approval",
    );
  }

  ticket.status = TICKET_STATUS.CLOSED;
  ticket.statusHistory.push({
    status: TICKET_STATUS.CLOSED,
    changedBy: userId,
    changedAt: new Date(),
  });
  await ticket.save();

  return res.status(200).json(new ApiResponse(200, "Ticket cancelled", ticket));
});

/* ======================
   EDIT (creator only, Pending only, no priority/status/assignment)
====================== */
export const editTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;
  const { description, requestTitle, category, location } = req.body;
  const userId = req.user._id.toString();

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "No such ticket found");

  if (!ticket.createdBy.equals(userId))
    throw new ApiError(403, "Only the creator can edit this ticket");
  if (ticket.status !== TICKET_STATUS.OPEN) {
    throw new ApiError(400, "Ticket can only be edited while Open approval");
  }

  if (description) ticket.description = description;
  if (requestTitle) ticket.req_title = requestTitle;
  if (category) ticket.category = category;
  if (location) ticket.location = location;

  await ticket.save();
  return res.status(200).json(new ApiResponse(200, "Ticket updated", ticket));
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

  // const effectivePermissions = new Set([
  //   ...rolePermissions,
  //   ...customPermissions,
  // ]);

  /* ----------------------------------
     PERMISSION SCOPE (VISIBILITY)
  -----------------------------------*/
  const visibilityOr = [];
  const managedLocations = await Location.find(
    { managers: req.user._id },
    "_id",
  );

  const managedLocationIds = managedLocations.map((l) => l._id);
  // Always allow own tickets
  visibilityOr.push({ createdBy: req.user._id }, { assignedTo: req.user._id });
  if (managedLocationIds.length) {
    visibilityOr.push({
      location: { $in: managedLocationIds },
    });
  }
  // Category-based permissions

  // Full access overrides everything

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
    .limit(limit).populate("location","name managers")
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

  const [open, approved, inProgress, completed, rejected, closed, all] =
    await Promise.all([
      countByStatus(TICKET_STATUS.OPEN),
      countByStatus(TICKET_STATUS.APPROVED),
      countByStatus(TICKET_STATUS.IN_PROGRESS),
      countByStatus(TICKET_STATUS.COMPLETED),
      countByStatus(TICKET_STATUS.REJECTED),
      countByStatus(TICKET_STATUS.CLOSED),
      countByStatus(),
    ]);

  const counts = {
    open,
    approved,
    inProgress,
    completed,
    total:all
  };

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
    }),
  );
});


export const FetchTicketComments = (req, res) =>
  fetchCommentsForEntity(req, res, "Ticket");

export const AddTicketComment = (req, res) =>
  addCommentForEntity(req, res, "Ticket");

