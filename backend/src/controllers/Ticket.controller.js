import mongoose from "mongoose";
import { htmlToText } from "html-to-text";
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
import ExcelJS from "exceljs";
import { PERMISSIONS } from "../auth/permissions.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";
import { getAssignedAgentByCategory } from "../helper/getAssignedUser.js";
import Location from "../model/location.js";
import { generateEmailTemplate } from "../helper/EmailsMailer/emailTemplates.js";
import { sendEmail } from "../helper/EmailsMailer/emailSender.js";
import {
  addCommentForEntity,
  fetchCommentsForEntity,
} from "./comments.controller.js";

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
       IS THE CREATOR ALSO A MANAGER OF THIS LOCATION?
       -> self-approve: skip the pending-approval step entirely
    ====================== */
    const isSelfManaged = locationDoc.managers.some((m) =>
      m._id.equals(userId),
    );

    if (isSelfManaged && !FACILITIES_MANAGER_ID) {
      // Fail loudly rather than create a ticket that can never be assigned.
      throw new ApiError(500, "Facilities manager is not configured");
    }

    /* ======================
       BUILD TICKET PAYLOAD
    ====================== */
    const now = new Date();

    const payload = {
      req_title: reqTitle,
      description,
      createdBy: userId,
      category,
      location,
      status: isSelfManaged ? TICKET_STATUS.APPROVED : TICKET_STATUS.OPEN,
      statusHistory: [
        {
          status: TICKET_STATUS.OPEN,
          changedBy: userId,
          changedAt: now,
        },
      ],
    };

    if (isSelfManaged) {
      payload.priority = "Medium";
      payload.priorityLocked = false; // creator/manager can still adjust it later
      payload.approvedBy = userId;
      payload.assignedTo = new mongoose.Types.ObjectId(FACILITIES_MANAGER_ID);

      payload.statusHistory.push({
        status: TICKET_STATUS.APPROVED,
        changedBy: userId,
        changedAt: now,
      });
      payload.assignmentHistory = [
        {
          assignedTo: FACILITIES_MANAGER_ID,
          assignedBy: userId,
          assignedAt: now,
        },
      ];
    }

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
       NOTIFY — branches on whether this ticket needs approval
    ====================== */
    if (isSelfManaged) {
      // No approval step needed — go straight to notifying the facilities user.
      const facilitiesUser = await User.findById(FACILITIES_MANAGER_ID)
        .select("firstname lastname email")
        .session(session);

      if (facilitiesUser && !facilitiesUser._id.equals(userId)) {
        const notification = await notifyAndEmit(session, {
          recipients: [{ userId: facilitiesUser._id.toString() }],
          title: "New Ticket Assigned to You",
          message: `Ticket "${ticket.req_title}" (Medium priority) has been assigned to you.`,
          link: `/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
          createdBy: userId,
          meta: { ticketId: ticket.slug, priority: "Medium" },
          emit: false, // emit after commit, same pattern as editTicket
        });

        const emailContent = generateEmailTemplate({
          type: "ticket_assigned",
          data: {
            recipientName: `${facilitiesUser.firstname} ${facilitiesUser.lastname}`,
            ticketTitle: ticket.req_title,
            category: ticket.category,
            location: locationDoc.name,
            priority: "Medium",
            link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
          },
        });

        await session.commitTransaction();
        session.endSession();

        // fire-and-forget side effects after commit
        io.to(`user_${facilitiesUser._id.toString()}`).emit(
          "newNotification",
          notification,
        );
        await sendEmail({ to: facilitiesUser.email, ...emailContent });

        return res
          .status(201)
          .json(new ApiResponse(201, "Ticket created successfully", ticket));
      }

      await session.commitTransaction();
      session.endSession();
      return res
        .status(201)
        .json(new ApiResponse(201, "Ticket created successfully", ticket));
    }

    /* ======================
       NORMAL PATH — NOTIFY MANAGERS FOR APPROVAL
    ====================== */
    const managers = locationDoc.managers;

    if (managers.length === 0) {
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

export async function notifyAndEmit(
  session,
  { recipients, title, message, link, createdBy, meta, emit = true },
) {
  if (!recipients?.length) return null;

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

  if (emit) {
    recipients.forEach((r) => {
      io.to(`user_${r.userId}`).emit("newNotification", notification);
    });
  }

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
      User.findById(ticket.createdBy)
        .select("firstname lastname email")
        .session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      User.findById(FACILITIES_MANAGER_ID)
        .select("firstname lastname email")
        .session(session),
      Location.findById(ticket.location).select("name").session(session),
    ]);

    const locationName = locationDoc?.name || "Unknown location";
    const approverName = approver
      ? `${approver.firstname} ${approver.lastname}`
      : "Manager";

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
      User.findById(ticket.createdBy)
        .select("firstname lastname email")
        .session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      Location.findById(ticket.location).select("name").session(session),
    ]);

    const locationName = locationDoc?.name || "Unknown location";
    const rejectorName = rejector
      ? `${rejector.firstname} ${rejector.lastname}`
      : "Manager";

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
        User.find({ _id: { $in: recipientIds } })
          .select("firstname lastname email")
          .session(session),
        Location.findById(ticket.location).select("name").session(session),
        User.findById(userId).select("firstname lastname").session(session),
      ]);

      const locationName = locationDoc?.name || "Unknown location";
      const assigneeName = assignee
        ? `${assignee.firstname} ${assignee.lastname}`
        : "Facilities";

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

const CREATOR_FIELDS = new Set([
  "description",
  "requestTitle",
  "category",
  "location",
  "photo", // implicit via req.file, not a body key, listed for clarity
]);
const APPROVER_FIELDS = new Set(["priority", "assignedTo"]);
const ASSIGNEE_FIELDS = new Set(["assignedTo"]);

export const editTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;

  const {
    description,
    requestTitle,
    category,
    location: newLocationId,
    priority,
    assignedTo: newAssignedToId,
  } = req.body;

  const userId = req.user._id;
  const userIdStr = userId.toString();

  const session = await mongoose.startSession();

  // Keep these outside transaction because we need them
  // after commit for email/socket side effects.
  let emailEvents = [];

  try {
    session.startTransaction();

    let uploadedFile;
    if (req.file?.path) {
      uploadedFile = await uploadOnCloudinary(req.file.path);
      if (!uploadedFile?.secure_url) {
        throw new ApiError(500, "Photo upload failed");
      }
    }

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      throw new ApiError(404, "No such ticket found");
    }

    // -----------------------------------------
    // 1. Work out which role this user holds on THIS ticket
    // -----------------------------------------
    const isCreator = ticket.createdBy.equals(userId);
    const isApprover = ticket.approvedBy?.equals(userId) ?? false;
    const isAssignee = ticket.assignedTo?.equals(userId) ?? false;

    if (!isCreator && !isApprover && !isAssignee) {
      throw new ApiError(403, "You do not have permission to edit this ticket");
    }

    // -----------------------------------------
    // 2. Figure out which fields were actually submitted
    // -----------------------------------------
    const submittedFields = new Set();
    if (description !== undefined) submittedFields.add("description");
    if (requestTitle !== undefined) submittedFields.add("requestTitle");
    if (category !== undefined) submittedFields.add("category");
    if (newLocationId !== undefined) submittedFields.add("location");
    if (uploadedFile) submittedFields.add("photo");
    if (priority !== undefined) submittedFields.add("priority");
    if (newAssignedToId !== undefined) submittedFields.add("assignedTo");

    if (submittedFields.size === 0) {
      throw new ApiError(400, "No editable fields were provided");
    }

    // -----------------------------------------
    // 3. Validate each submitted field against the caller's role
    // -----------------------------------------
    const wantsCreatorFields = [...submittedFields].some((f) =>
      CREATOR_FIELDS.has(f),
    );
    const wantsApproverFields = [...submittedFields].some((f) =>
      APPROVER_FIELDS.has(f),
    );

    if (wantsCreatorFields) {
      if (!isCreator) {
        throw new ApiError(
          403,
          "Only the creator can edit title, description, photo, or location",
        );
      }
      if (ticket.status !== TICKET_STATUS.OPEN) {
        throw new ApiError(
          400,
          "Ticket details can only be edited while it is Open (pending approval)",
        );
      }
    }

    if (wantsApproverFields) {
      // priority and assignedTo can be touched by the approver, OR
      // assignedTo alone can be touched by the current assignee (handoff).
      const wantsPriority = submittedFields.has("priority");
      const wantsAssignedTo = submittedFields.has("assignedTo");

      if (wantsPriority && !isApprover) {
        throw new ApiError(
          403,
          "Only the approving manager can change priority",
        );
      }
      if (wantsAssignedTo && !isApprover && !isAssignee) {
        throw new ApiError(
          403,
          "Only the approving manager or current assignee can reassign this ticket",
        );
      }
      if (
        [
          TICKET_STATUS.OPEN,
          TICKET_STATUS.CLOSED,
          TICKET_STATUS.REJECTED,
        ].includes(ticket.status)
      ) {
        throw new ApiError(
          400,
          `Ticket must be Approved or later to change ${
            wantsPriority ? "priority" : "assignment"
          }, currently ${ticket.status}`,
        );
      }
    }

    // -----------------------------------------
    // 4. Location-change bookkeeping (creator path only)
    // -----------------------------------------
    const oldLocationId = ticket.location?.toString();
    const locationChanged =
      newLocationId && newLocationId.toString() !== oldLocationId;

    let oldLocation = null;
    let newLocation = null;
    let oldManagerIds = [];
    let newManagerIds = [];

    if (locationChanged) {
      [oldLocation, newLocation] = await Promise.all([
        Location.findById(oldLocationId)
          .select("_id name managers isActive")
          .session(session),
        Location.findById(newLocationId)
          .select("_id name managers isActive")
          .session(session),
      ]);

      if (!newLocation) {
        throw new ApiError(404, "New location not found");
      }
      if (!newLocation.isActive) {
        throw new ApiError(400, "Cannot move ticket to an inactive location");
      }

      oldManagerIds = oldLocation?.managers?.map((id) => id.toString()) ?? [];
      newManagerIds = newLocation.managers.map((id) => id.toString());
    }

    // -----------------------------------------
    // 5. Apply field updates
    // -----------------------------------------
    if (description !== undefined) ticket.description = description;
    if (requestTitle !== undefined) ticket.req_title = requestTitle;
    if (category !== undefined) ticket.category = category;
    if (locationChanged) ticket.location = newLocation._id;
    if (uploadedFile) {
      ticket.photo = {
        fileName: uploadedFile.original_filename,
        fileUrl: uploadedFile.secure_url,
      };
    }

    if (priority !== undefined) {
      ticket.priority = priority;
      ticket.priorityLocked = true; // approver setting it explicitly locks it again
    }

    if (newAssignedToId !== undefined) {
      const newAssignee = await User.findById(newAssignedToId).session(session);
      if (!newAssignee) throw new ApiError(404, "New assignee not found");

      ticket.assignmentHistory.push({
        assignedTo: newAssignee._id,
        assignedBy: userId,
        assignedAt: new Date(),
      });
      ticket.assignedTo = newAssignee._id;
    }

    await ticket.save({ session });

    // -----------------------------------------
    // 6. Reroute notifications (only when creator changed location)
    // -----------------------------------------
    if (locationChanged) {
      const oldManagerSet = new Set(oldManagerIds);
      const newManagerSet = new Set(newManagerIds);

      const removedManagerIds = oldManagerIds.filter(
        (managerId) => !newManagerSet.has(managerId),
      );
      const addedManagerIds = newManagerIds.filter(
        (managerId) => !oldManagerSet.has(managerId),
      );

      if (removedManagerIds.length) {
        await notifyAndEmit(session, {
          recipients: removedManagerIds.map((mid) => ({ userId: mid })),
          title: "Ticket Rerouted",
          message: `Ticket ${ticket.displayId} has been moved from ${oldLocation.name} to ${newLocation.name} and is no longer pending your approval.`,
          link: `/tickets/${ticket._id}`,
          createdBy: userId,
          meta: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            event: "ticket_rerouted",
            oldLocation: { id: oldLocation._id, name: oldLocation.name },
            newLocation: { id: newLocation._id, name: newLocation.name },
          },
          emit: false,
        });

        emailEvents.push({
          userIds: removedManagerIds,
          templateType: "ticket_rerouted_old_manager",
          dataBuilder: (user) => ({
            managerName: `${user.firstname} ${user.lastname}`,
            ticketTitle: ticket.req_title,
            oldLocation: oldLocation.name,
            newLocation: newLocation.name,
            createdBy: req.user.firstname
              ? `${req.user.firstname} ${req.user.lastname}`
              : "Ticket Creator",
            link: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
          }),
        });
      }

      if (addedManagerIds.length) {
        await notifyAndEmit(session, {
          recipients: addedManagerIds.map((mid) => ({ userId: mid })),
          title: "Ticket Requires Approval",
          message: `Ticket ${ticket.displayId} has been moved to ${newLocation.name} and is now awaiting your approval.`,
          link: `/tickets/${ticket._id}`,
          createdBy: userId,
          meta: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            event: "ticket_rerouted_to_manager",
            location: { id: newLocation._id, name: newLocation.name },
          },
          emit: false,
        });

        emailEvents.push({
          userIds: addedManagerIds,
          templateType: "ticket_pending_manager",
          dataBuilder: (user) => ({
            managerName: `${user.firstname} ${user.lastname}`,
            ticketTitle: ticket.req_title,
            category: ticket.category,
            location: newLocation.name,
            createdBy: req.user.firstname
              ? `${req.user.firstname} ${req.user.lastname}`
              : "Ticket Creator",
            link: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
          }),
        });
      }
      // unchangedManagerIds intentionally get no email/notification.
    }

    // -----------------------------------------
    // 7. Reassignment notification (approver or assignee handoff)
    // -----------------------------------------
    if (newAssignedToId !== undefined) {
      const recipientId = newAssignedToId.toString();
      if (recipientId !== userIdStr) {
        await notifyAndEmit(session, {
          recipients: [{ userId: recipientId }],
          title: "Ticket Reassigned to You",
          message: `Ticket "${ticket.req_title}" has been reassigned to you.`,
          link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
          createdBy: userId,
          meta: { ticketId: ticket.slug },
          emit: false,
        });

        emailEvents.push({
          userIds: [recipientId],
          templateType: "ticket_assigned",
          dataBuilder: (user) => ({
            recipientName: `${user.firstname} ${user.lastname}`,
            ticketTitle: ticket.req_title,
            category: ticket.category,
            priority: ticket.priority || "-",
            link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&item=${ticket.slug}`,
          }),
        });
      }
    }

    // -----------------------------------------
    // 8. Commit, then fire off emails/sockets after success
    // -----------------------------------------
    await session.commitTransaction();

    await Promise.all(
      emailEvents.map((event) =>
        notifyTicketEmail({
          ...event,
          session: undefined,
        }),
      ),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket updated successfully", ticket));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
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
    .limit(limit)
    .populate("location", "name managers")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname");

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
    total: all,
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

const buildReportFilter = async (req) => {
  const {
    startDate,
    endDate,
    location,
    status,
    createdBy,
    assignedTo,
    approvedBy,
  } = req.query;

  const andConditions = [];

  /* ---- Location filter ---- */
  if (location) {
    if (!mongoose.Types.ObjectId.isValid(location)) {
      throw new ApiError(400, "Invalid location id");
    }
    andConditions.push({
      location: new mongoose.Types.ObjectId(location),
    });
  }

  /* ---- Created By filter ---- */
  if (createdBy) {
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      throw new ApiError(400, "Invalid createdBy id");
    }
    andConditions.push({
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });
  }

  /* ---- Assigned To filter ---- */
  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assignedTo id");
    }
    andConditions.push({
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
    });
  }

  /* ---- Approved By filter ---- */
  if (approvedBy) {
    if (!mongoose.Types.ObjectId.isValid(approvedBy)) {
      throw new ApiError(400, "Invalid approvedBy id");
    }
    andConditions.push({
      approvedBy: new mongoose.Types.ObjectId(approvedBy),
    });
  }

  /* ---- Date range ---- */
  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.$lte = new Date(`${endDate}T23:59:59.999Z`);
  }

  if (!startDate && !endDate) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    dateFilter.$gte = ninetyDaysAgo;
  }

  andConditions.push({ createdAt: dateFilter });

  /* ---- Status filter ---- */
  if (status && status !== "All") {
    andConditions.push({ status });
  }

  return andConditions.length ? { $and: andConditions } : {};
};

/* ------------------------------------------------------------------
   GET /api/tickets/report
   Paginated preview + counts for the on-screen Reports tab.
   Admin-only — gate this in the route with authorize(["admin","super-admin"]).
-------------------------------------------------------------------*/
export const GetTicketsReport = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = Number(page);
  limit = Number(limit);

  const filter = await buildReportFilter(req);

  const [ticketsRaw, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("location", "name")
      .populate("createdBy", "firstname lastname email")
      .populate("assignedTo", "firstname lastname email")
      .populate("approvedBy", "firstname lastname email"),
    Ticket.countDocuments(filter),
  ]);

  /* ---- Counts scoped to the SAME filter (minus status, so cards show breakdown) ---- */
  const { status: _omit, ...countsFilterBase } = req.query;

  const countsFilter = await buildReportFilter({
    ...req,
    query: countsFilterBase,
  });
  const tickets = ticketsRaw.map((t) => ({
    id: t._id,
    slug: t.slug,
    ticketId: t.displayId,
    title: t.req_title,
    status: t.status,
    priority: t.priority || "-",
    category: t.category,
    location: t.location?.name || "-",
    submittedBy: t.createdBy
      ? `${t.createdBy.firstname} ${t.createdBy.lastname}`
      : "-",
    assignedTo: t.assignedTo
      ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
      : "Unassigned",
    created: t.createdAt,
    approvedBy: t.approvedBy
      ? `${t.approvedBy.firstname} ${t.approvedBy.lastname}`
      : "Unapproved",
    resolved: t.resolvedAt || null,
  }));
  const countByStatus = (ticketStatus) =>
    Ticket.countDocuments({
      $and: [...(countsFilter.$and || []), { status: ticketStatus }],
    });

  const [open, approved, inProgress, completed, rejected, closed, all] =
    await Promise.all([
      countByStatus(TICKET_STATUS.OPEN),
      countByStatus(TICKET_STATUS.APPROVED),
      countByStatus(TICKET_STATUS.IN_PROGRESS),
      countByStatus(TICKET_STATUS.COMPLETED),
      countByStatus(TICKET_STATUS.REJECTED),
      countByStatus(TICKET_STATUS.CLOSED),
      Ticket.countDocuments(countsFilter),
    ]);

  const counts = {
    open,
    approved,
    inProgress,
    completed,
    rejected,
    closed,
    total: all,
  };

  return res.status(200).json(
    new ApiResponse(200, "Report fetched successfully", {
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

/* ------------------------------------------------------------------
   GET /api/tickets/report/:id
   Full detail view for a single ticket (drawer/modal on click).
   Admin-only — gate this in the route with authorize(["admin","super-admin"]).
-------------------------------------------------------------------*/
export const GetTicketDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ticket id");
  }

  const ticket = await Ticket.findById(id)
    .populate("location", "name")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname email")
    .populate("rejectedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname")
    .populate("assignmentHistory.assignedBy", "firstname lastname")
    .populate("statusHistory.changedBy", "firstname lastname")
    .populate({
      path: "latestComment",
      populate: { path: "author", select: "firstname lastname" }, // adjust field name if your Comment schema differs
    });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  /* ---- Turnaround time, only meaningful once resolved ---- */
  let turnaround = null;
  if (ticket.resolvedAt) {
    const diffMs = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    turnaround = `${days}d ${hours}h`;
  }

  /* ---- Merge statusHistory + assignmentHistory into one chronological timeline ---- */
  const timeline = [
    ...ticket.statusHistory.map((h) => ({
      type: "status",
      status: h.status,
      by: h.changedBy
        ? `${h.changedBy.firstname} ${h.changedBy.lastname}`
        : "System",
      at: h.changedAt,
    })),
    ...ticket.assignmentHistory.map((h) => ({
      type: "assignment",
      assignedTo: h.assignedTo
        ? `${h.assignedTo.firstname} ${h.assignedTo.lastname}`
        : "Unassigned",
      by: h.assignedBy
        ? `${h.assignedBy.firstname} ${h.assignedBy.lastname}`
        : "System",
      at: h.assignedAt,
    })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  const detail = {
    ticketId: ticket.displayId,
    title: ticket.req_title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority || "-",
    priorityLocked: ticket.priorityLocked,
    category: ticket.category,
    location: ticket.location?.name || "-",
    photo: ticket.photo || null,

    submittedBy: ticket.createdBy
      ? {
          name: `${ticket.createdBy.firstname} ${ticket.createdBy.lastname}`,
          email: ticket.createdBy.email,
        }
      : null,
    assignedTo: ticket.assignedTo
      ? {
          name: `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`,
          email: ticket.assignedTo.email,
        }
      : null,
    approvedBy: ticket.approvedBy
      ? {
          name: `${ticket.approvedBy.firstname} ${ticket.approvedBy.lastname}`,
          email: ticket.approvedBy.email,
        }
      : null,
    rejectedBy: ticket.rejectedBy
      ? {
          name: `${ticket.rejectedBy.firstname} ${ticket.rejectedBy.lastname}`,
          email: ticket.rejectedBy.email,
        }
      : null,
    rejectionReason: ticket.rejectionReason || null,

    createdAt: ticket.createdAt,
    resolvedAt: ticket.resolvedAt || null,
    turnaround,

    latestComment: ticket.latestComment
      ? {
          text: ticket.latestComment.text, // adjust field name if different
          author: ticket.latestComment.author
            ? `${ticket.latestComment.author.firstname} ${ticket.latestComment.author.lastname}`
            : "-",
          createdAt: ticket.latestComment.createdAt,
        }
      : null,

    timeline,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Ticket detail fetched successfully", detail));
});
/* ------------------------------------------------------------------
   GET /api/tickets/report/export
   Same filter, no pagination — streams an .xlsx file.
-------------------------------------------------------------------*/
const stripHtml = (html) => {
  if (!html) return "-";
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  }).trim();
};

/* ---- Pull the timestamp of a specific status transition from statusHistory ---- */
const getStatusDate = (statusHistory, statusName) => {
  const entry = statusHistory?.find((h) => h.status === statusName);
  return entry ? entry.changedAt : null;
};

/* ---- Pull the timestamp of the first assignment from assignmentHistory ---- */
const getAssignedDate = (assignmentHistory) => {
  if (!assignmentHistory?.length) return null;
  return assignmentHistory[0].assignedAt;
};

/* ---- Format a Date (or null) for Excel display ---- */
const formatDate = (date) => (date ? new Date(date).toLocaleString() : "-");

/* ---- Human-readable duration between two dates ---- */
const getDuration = (start, end) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "-";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
};
export const ExportTicketsReport = asyncHandler(async (req, res) => {
  const filter = await buildReportFilter(req);

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .populate("location", "name")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname email")
    .populate("rejectedBy", "firstname lastname email")
    .populate("statusHistory.changedBy", "firstname lastname email")
    .lean();

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Tickets Report");

  sheet.columns = [
    { header: "Ticket ID", key: "ticketId", width: 16 },
    { header: "Ticket Number", key: "ticketNumber", width: 14 },
    { header: "Title", key: "title", width: 28 },
    { header: "Description", key: "description", width: 40 },
    { header: "Status", key: "status", width: 14 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Category", key: "category", width: 16 },
    { header: "Location", key: "location", width: 22 },
    { header: "Submitted By", key: "submittedBy", width: 22 },
    { header: "Submitted Email", key: "submittedEmail", width: 26 },
    { header: "Approved By", key: "approvedBy", width: 22 },
    { header: "Assigned To", key: "assignedTo", width: 22 },
    { header: "Rejected By", key: "rejectedBy", width: 22 },
    { header: "Rejection Reason", key: "rejectionReason", width: 30 },
    { header: "Created Date", key: "createdDate", width: 20 },
    { header: "Approved Date", key: "approvedDate", width: 20 },
    { header: "Assigned Date", key: "assignedDate", width: 20 },
    { header: "Last Updated Date", key: "updatedDate", width: 20 },
    { header: "Resolved By", key: "resolvedBy", width: 22 },
    { header: "Resolved Date", key: "resolvedDate", width: 20 },
    { header: "Resolution Time", key: "resolutionTime", width: 16 },
    { header: "Attachment URL", key: "attachmentUrl", width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };

  tickets.forEach((t) => {
    const approvedDate = getStatusDate(t.statusHistory, TICKET_STATUS.APPROVED);
    const assignedDate = getAssignedDate(t.assignmentHistory);
    const completedStatus = t.statusHistory?.find(
      (history) => history.status === TICKET_STATUS.COMPLETED,
    );
    sheet.addRow({
      ticketId: `TICKET-${String(t.ticketNumber).padStart(5, "0")}`,
      ticketNumber: t.ticketNumber,
      title: t.req_title,
      description: stripHtml(t.description),
      status: t.status,
      priority: t.priority || "-",
      category: t.category,
      location: t.location?.name || "-",
      submittedBy: t.createdBy
        ? `${t.createdBy.firstname} ${t.createdBy.lastname}`
        : "-",
      submittedEmail: t.createdBy?.email || "-",
      approvedBy: t.approvedBy
        ? `${t.approvedBy.firstname} ${t.approvedBy.lastname}`
        : "-",
      assignedTo: t.assignedTo
        ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
        : "-",
      rejectedBy: t.rejectedBy
        ? `${t.rejectedBy.firstname} ${t.rejectedBy.lastname}`
        : "-",
      rejectionReason: t.rejectionReason || "-",
      createdDate: formatDate(t.createdAt),
      approvedDate: formatDate(approvedDate),
      assignedDate: formatDate(assignedDate),
      updatedDate: formatDate(t.updatedAt),
      resolvedBy: completedStatus?.changedBy
        ? `${completedStatus.changedBy.firstname} ${completedStatus.changedBy.lastname}`
        : "-",

      resolvedDate: formatDate(t.resolvedAt),
      resolutionTime: getDuration(t.createdAt, t.resolvedAt),
      attachmentUrl: t.photo?.fileUrl || "-",
    });
  });

  if (tickets.length === 0) {
    sheet.addRow({ ticketId: "No tickets found for the selected filters." });
  }

  // Wrap long text columns (description, rejection reason) for readability
  sheet.getColumn("description").alignment = {
    wrapText: true,
    vertical: "top",
  };
  sheet.getColumn("rejectionReason").alignment = {
    wrapText: true,
    vertical: "top",
  };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="tickets-report-${Date.now()}.xlsx"`,
  );

  await workbook.xlsx.write(res);
  res.end();
});
