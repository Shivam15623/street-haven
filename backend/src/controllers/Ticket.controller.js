import mongoose from "mongoose";
import { htmlToText } from "html-to-text";
import { io } from "../index.js";
import { notifyTicketEmail } from "../helper/notifyTicketEvent.js";
import Ticket, { TICKET_STATUS } from "../model/ticket.js";
import User, { ROLES } from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { createNotification } from "../helper/CreateNotoification.js";
import ExcelJS from "exceljs";
import Location from "../model/location.js";
import {
  generateEmailTemplate,
  getCategoryDisplayName,
} from "../helper/EmailsMailer/emailTemplates.js";
import { sendEmail } from "../helper/EmailsMailer/emailSender.js";
import {
  addCommentForEntity,
  fetchCommentsForEntity,
} from "./comments.controller.js";
import TicketCategory from "../model/ticketCategory.js";
import { resyncTicketMembership } from "../helper/entitymembershipSync.js";
import * as ticketDeletion from "../services/ticketDeletion.service.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Toronto";

async function getSuperAdminIds(session) {
  const superAdmins = await User.find({ role: "super_admin" })
    .select("_id")
    .session(session);
  return superAdmins.map((u) => u._id.toString());
}
export const createTicket = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { reqTitle, description, category, categoryOtherText, location } =
      req.body;

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

    // AFTER the existing categoryDoc active-check, add the "Other" guard:
    const categoryDoc =
      await TicketCategory.findById(category).session(session);

    if (!categoryDoc) {
      throw new ApiError(404, "Selected category not found");
    }
    if (!categoryDoc.isActive) {
      throw new ApiError(400, "Selected category is not active");
    }

    const isOtherCategory =
      categoryDoc.isSystem && categoryDoc.name === "Other";
    if (isOtherCategory && !categoryOtherText?.trim()) {
      throw new ApiError(
        400,
        "Please specify a category when selecting 'Other'",
      );
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

    if (isSelfManaged && !locationDoc.facilityManager) {
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
      categoryOtherText: isOtherCategory ? categoryOtherText.trim() : null,
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
      payload.assignedTo = new mongoose.Types.ObjectId(
        locationDoc.facilityManager,
      );

      payload.statusHistory.push({
        status: TICKET_STATUS.APPROVED,
        changedBy: userId,
        changedAt: now,
      });
      payload.assignmentHistory = [
        {
          assignedTo: locationDoc.facilityManager,
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
    await resyncTicketMembership(ticket, session);
    /* ======================
       NOTIFY — branches on whether this ticket needs approval
    ====================== */
    if (isSelfManaged) {
      // No approval step needed — go straight to notifying the facilities user.
      const facilitiesUser = await User.findById(locationDoc.facilityManager)
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
            category: getCategoryDisplayName(
              categoryDoc,
              ticket.categoryOtherText,
            ),
            location: locationDoc.name,
            priority: "Medium",
            link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
          },
        });
        const superAdminIds = (await getSuperAdminIds(session)).filter(
          (id) => id !== userId.toString(),
        );
        let superAdminNotification = null;
        if (superAdminIds.length) {
          superAdminNotification = await notifyAndEmit(session, {
            recipients: superAdminIds.map((id) => ({ userId: id })),
            title: "New Ticket Created",
            message: `A new ticket "${ticket.req_title}" was created by ${req.user.firstname} ${req.user.lastname}.`,
            link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
            createdBy: userId,
            meta: { ticketId: ticket.slug },
            emit: false,
          });
        }

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
            category: getCategoryDisplayName(
              categoryDoc,
              ticket.categoryOtherText,
            ),
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
              category: getCategoryDisplayName(
                categoryDoc,
                ticket.categoryOtherText,
              ),
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
    const superAdminIds = await getSuperAdminIds(session);
    if (superAdminIds.length) {
      const superAdminNotification = await notifyAndEmit(session, {
        recipients: superAdminIds.map((id) => ({ userId: id })),
        title: "New Ticket Created",
        message: `A new ticket "${ticket.req_title}" was created by ${req.user.firstname} ${req.user.lastname}.`,
        link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug },
        emit: false, // emit after commit, same as the rest of this handler
      });
      superAdminIds.forEach((id) =>
        io.to(`user_${id}`).emit("newNotification", superAdminNotification),
      );
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
    const isSuperAdmin = req.user.role === "super_admin";

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
    if (!isManager && !isSuperAdmin)
      throw new ApiError(403, "You are not Authorized");

    const locationDoc = await Location.findById(ticket.location)
      .select("name facilityManager")
      .session(session);

    if (!locationDoc) {
      throw new ApiError(404, "Ticket's location not found");
    }
    if (!locationDoc.facilityManager) {
      throw new ApiError(
        500,
        "Facilities manager is not configured for this location",
      );
    }

    const facilityManagerId = locationDoc.facilityManager;

    ticket.priority = priority;
    ticket.priorityLocked = true;
    ticket.status = TICKET_STATUS.APPROVED;
    ticket.approvedBy = userId;
    ticket.assignedTo = new mongoose.Types.ObjectId(facilityManagerId);

    ticket.statusHistory.push({
      status: TICKET_STATUS.APPROVED,
      changedBy: userId,
      changedAt: new Date(),
    });
    ticket.assignmentHistory.push({
      assignedTo: facilityManagerId,
      assignedBy: userId,
      assignedAt: new Date(),
    });

    await ticket.save({ session });
    await resyncTicketMembership(ticket, session);

    /* ======================
       FETCH EVERYONE WE NEED TO NOTIFY / EMAIL
    ====================== */
    const [creator, approver, facilitiesUser, categoryDoc] = await Promise.all([
      User.findById(ticket.createdBy)
        .select("firstname lastname email")
        .session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      User.findById(facilityManagerId)
        .select("firstname lastname email")
        .session(session),
      TicketCategory.findById(ticket.category).select("name").session(session),
    ]);

    const categoryName = getCategoryDisplayName(
      categoryDoc,
      ticket.categoryOtherText,
    );
    // replaces: const categoryName = categoryDoc?.name;

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
          category: categoryName,
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
          category: categoryName,
          location: locationName,
          priority,
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        }),
        session,
      });
    }
    const superAdminIds = await getSuperAdminIds(session);
    if (superAdminIds.length) {
      await notifyAndEmit(session, {
        recipients: superAdminIds.map((id) => ({ userId: id })),
        title: "Ticket Approved",
        message: `Ticket "${ticket.req_title}" was approved by ${approverName}.`,
        link: `/it_facility?tab=track_tickets&status=Approved&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug, priority },
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
    const isSuperAdmin = req.user.role === "super_admin";
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
    if (!isManager && !isSuperAdmin)
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

    const [creator, rejector, locationDoc, categoryDoc] = await Promise.all([
      User.findById(ticket.createdBy)
        .select("firstname lastname email")
        .session(session),
      User.findById(userId).select("firstname lastname email").session(session),
      Location.findById(ticket.location).select("name").session(session),
      TicketCategory.findById(ticket.category).select("name").session(session),
    ]);

    const locationName = locationDoc?.name || "Unknown location";
    const categoryName = getCategoryDisplayName(
      categoryDoc,
      ticket.categoryOtherText,
    );
    // replaces: const categoryName = categoryDoc?.name;
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
          category: categoryName,
          location: locationName,
          rejectedBy: rejectorName,
          rejectionReason: rejectionReason.trim(),
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
        }),
        session,
      });
    }
    const superAdminIds = await getSuperAdminIds(session);
    if (superAdminIds.length) {
      await notifyAndEmit(session, {
        recipients: superAdminIds.map((id) => ({ userId: id })),
        title: "Ticket Rejected",
        message: `Ticket "${ticket.req_title}" was rejected by ${rejectorName}.`,
        link: `/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug },
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
    await resyncTicketMembership(ticket, session); // no-op most of the time, cheap insurance

    const recipientIds = [
      ticket.createdBy.toString(),
      ticket.approvedBy?.toString(),
    ]
      .filter(Boolean)
      .filter((id) => id !== userId);

    if (recipientIds.length) {
      const [users, locationDoc, assignee, categoryDoc] = await Promise.all([
        User.find({ _id: { $in: recipientIds } })
          .select("firstname lastname email")
          .session(session),
        Location.findById(ticket.location).select("name").session(session),
        User.findById(userId).select("firstname lastname").session(session),
        TicketCategory.findById(ticket.category)
          .select("name")
          .session(session),
      ]);

      const locationName = locationDoc?.name || "Unknown location";
      const categoryName = getCategoryDisplayName(
        categoryDoc,
        ticket.categoryOtherText,
      );
      // replaces: const categoryName = categoryDoc?.name;

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
      const superAdminIds = await getSuperAdminIds(session);
      if (superAdminIds.length) {
        await notifyAndEmit(session, {
          recipients: superAdminIds.map((id) => ({ userId: id })),
          title: "Ticket In Progress",
          message: `Work has started on ticket "${ticket.req_title}" by ${assigneeName}.`,
          link: `/it_facility?tab=track_tickets&status=In Progress&item=${ticket.slug}`,
          createdBy: userId,
          meta: { ticketId: ticket.slug },
        });
      }

      await notifyTicketEmail({
        userIds: recipientIds,
        templateType: "ticket_in_progress",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: categoryName,
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
      const [locationDoc, categoryDoc] = await Promise.all([
        Location.findById(ticket.location).select("name").session(session),
        TicketCategory.findById(ticket.category)
          .select("name")
          .session(session),
      ]);
      const locationName = locationDoc?.name || "Unknown location";
      const categoryName = getCategoryDisplayName(
        categoryDoc,
        ticket.categoryOtherText,
      );
      // replaces: const categoryName = categoryDoc?.name;

      await notifyAndEmit(session, {
        recipients: recipientIds.map((id) => ({ userId: id })),
        title: "Ticket Completed",
        message: `Ticket "${ticket.req_title}" has been completed.`,
        link: `/it_facility?tab=track_tickets&status=Completed&item=${ticket.slug}`,
        createdBy: userId,
        meta: { ticketId: ticket.slug },
      });
      const superAdminIds = await getSuperAdminIds(session);
      if (superAdminIds.length) {
        await notifyAndEmit(session, {
          recipients: superAdminIds.map((id) => ({ userId: id })),
          title: `Ticket Completed`,
          message: `Ticket "${ticket.req_title}" has been completed.`,
          link: `/it_facility?tab=track_tickets&status=Completed&item=${ticket.slug}`,
          createdBy: userId,
          meta: { ticketId: ticket.slug },
        });
      }
      await notifyTicketEmail({
        userIds: recipientIds,
        templateType: "ticket_completed",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: categoryName,
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

  ticket.status = TICKET_STATUS.CANCELLED;
  ticket.statusHistory.push({
    status: TICKET_STATUS.CANCELLED,
    changedBy: userId,
    changedAt: new Date(),
  });
  await ticket.save();

  return res.status(200).json(new ApiResponse(200, "Ticket cancelled", ticket));
});

/* ======================
   EDIT (creator only, Pending only, no priority/status/assignment)
====================== */

const DETAIL_FIELDS = new Set([
  "description",
  "requestTitle",
  "category",
  "categoryOtherText",
  "photo",
]);
const LOCATION_FIELD = "location";

const STATUS_EMAIL_TEMPLATE_MAP = {
  Approved: "ticket_approved",
  "In Progress": "ticket_in_progress",
  Completed: "ticket_completed",
  Rejected: "ticket_rejected",
};

const LOCATION_PERMISSION_MESSAGE = "Only the creator can edit the location";
const DETAILS_PERMISSION_MESSAGE =
  "Only the creator, approving manager, or super admin can edit ticket details";
const STATUS_PERMISSION_MESSAGE =
  "Only the approving manager or super admin can change status";
/**
 * editTicket — organized into small single-purpose helpers:
 *
 *   1. loadTicketAndUploadPhoto   - fetch ticket, handle optional photo upload
 *   2. resolveCallerPermissions   - who is the caller relative to this ticket
 *   3. collectSubmittedFields     - which fields were actually sent
 *   4. assertFieldPermissions     - role/status checks per field group
 *   5. resolveLocationChange /
 *      resolveCategoryChange      - lookups needed before applying updates
 *   6. applyTicketUpdates         - mutate the ticket document
 *   7. buildRerouteNotifications /
 *      buildReassignmentNotification /
 *      buildStatusChangeNotification /
 *      buildGenericEditNotification
 *                                 - each returns a list of "notification jobs"
 *   8. withSuperAdminCc           - adds super_admins to any job's recipients
 *   9. dispatchNotificationJobs   - actually calls notifyAndEmit + queues email
 *
 * All notification-shaping logic is pure (returns plain job objects); only
 * `dispatchNotificationJobs` touches notifyAndEmit/email queues, so the
 * transaction-vs-post-commit boundary is easy to see in `editTicket` itself.
 */

// ---------------------------------------------------------------------------
// 1. Ticket + photo
// ---------------------------------------------------------------------------
async function loadTicket(ticketId, session) {
  const ticket = await Ticket.findById(ticketId).session(session);
  if (!ticket) throw new ApiError(404, "No such ticket found");
  return ticket;
}

async function uploadPhotoIfPresent(file) {
  if (!file?.path) return undefined;
  const uploaded = await uploadOnCloudinary(file.path);
  if (!uploaded?.secure_url) throw new ApiError(500, "Photo upload failed");
  return uploaded;
}

// ---------------------------------------------------------------------------
// 2. Caller's relationship to the ticket
// ---------------------------------------------------------------------------
function resolveCallerPermissions(ticket, userId, isSuperAdmin) {
  const isCreator = ticket.createdBy.equals(userId);
  const isApprover = ticket.approvedBy?.equals(userId) ?? false;
  const isAssignee = ticket.assignedTo?.equals(userId) ?? false;

  if (!isSuperAdmin && !isCreator && !isApprover && !isAssignee) {
    throw new ApiError(403, "You do not have permission to edit this ticket");
  }

  return { isCreator, isApprover, isAssignee };
}
// ---------------------------------------------------------------------------
// 3. Which fields did the caller actually submit?
// ---------------------------------------------------------------------------
function collectSubmittedFields(body, hasFile) {
  const submittedFields = new Set();
  const fieldKeys = [
    "description",
    "requestTitle",
    "category",
    "categoryOtherText",
    "location",
    "priority",
    "assignedTo",
    "status",
    "overview",
  ];
  for (const key of fieldKeys) {
    if (body[key] !== undefined) submittedFields.add(key);
  }
  if (hasFile) submittedFields.add("photo");

  if (submittedFields.size === 0) {
    throw new ApiError(400, "No editable fields were provided");
  }
  return submittedFields;
}

// ---------------------------------------------------------------------------
// 4. Field-level permission + state checks
// ---------------------------------------------------------------------------
function assertFieldPermissions({
  submittedFields,
  ticket,
  newStatus,
  isCreator,
  isApprover,
  isAssignee,
  isSuperAdmin,
  isLocationManager,
}) {
  const wantsDetails = [...submittedFields].some((f) => DETAIL_FIELDS.has(f));
  const wantsLocation = submittedFields.has(LOCATION_FIELD);
  const wantsStatus = submittedFields.has("status");
  const wantsPriority = submittedFields.has("priority");
  const wantsAssignedTo = submittedFields.has("assignedTo");
  const wantsOverview = submittedFields.has("overview");
  const isPrivileged = isApprover || isSuperAdmin;
  const isOpen = ticket.status === TICKET_STATUS.OPEN;

  if (wantsOverview) {
    if (!isApprover && !isAssignee && !isLocationManager && !isSuperAdmin) {
      throw new ApiError(
        403,
        "Only the property manager, assignee, or super admin can edit the overview",
      );
    }
  }
  // Location: creator only, Open only
  if (wantsLocation) {
    if (!isCreator) throw new ApiError(403, LOCATION_PERMISSION_MESSAGE);
    if (!isOpen) {
      throw new ApiError(
        400,
        "Location can only be edited while the ticket is Open (pending approval)",
      );
    }
  }

  // Details: creator (Open only) or approver / super admin (any status)
  if (wantsDetails) {
    if (!isCreator && !isPrivileged) {
      throw new ApiError(403, DETAILS_PERMISSION_MESSAGE);
    }
    if (!isPrivileged && !isOpen) {
      throw new ApiError(
        400,
        "Ticket details can only be edited while it is Open (pending approval)",
      );
    }
  }

  // Status: approver / super admin
  if (wantsStatus) {
    if (!isPrivileged) throw new ApiError(403, STATUS_PERMISSION_MESSAGE);
    if (!Object.values(TICKET_STATUS).includes(newStatus)) {
      throw new ApiError(400, "Invalid status value");
    }
  }

  const effectiveStatus = wantsStatus ? newStatus : ticket.status;

  // Priority / assignment: only meaningful once Approved or later
  if (wantsPriority || wantsAssignedTo) {
    if (wantsPriority && !isPrivileged) {
      throw new ApiError(
        403,
        "Only the approving manager or super admin can change priority",
      );
    }
    if (wantsAssignedTo && !isPrivileged) {
      throw new ApiError(
        403,
        "Only the approving manager, current assignee, or super admin can reassign this ticket",
      );
    }
    if (
      [
        TICKET_STATUS.OPEN,
        TICKET_STATUS.CLOSED,
        TICKET_STATUS.REJECTED,
      ].includes(effectiveStatus)
    ) {
      throw new ApiError(
        400,
        `Ticket must be Approved or later to change ${wantsPriority ? "priority" : "assignment"}, currently ${effectiveStatus}`,
      );
    }
  }

  return { wantsStatus };
}

// ---------------------------------------------------------------------------
// 5. Lookups needed before mutating the ticket
// ---------------------------------------------------------------------------
async function resolveLocationChange(ticket, newLocationId, session) {
  const oldLocationId = ticket.location?.toString();
  const locationChanged =
    newLocationId && newLocationId.toString() !== oldLocationId;

  if (!locationChanged) {
    return {
      locationChanged: false,
      oldLocation: null,
      newLocation: null,
      oldManagerIds: [],
      newManagerIds: [],
    };
  }

  const [oldLocation, newLocation] = await Promise.all([
    Location.findById(oldLocationId)
      .select("_id name managers isActive")
      .session(session),
    Location.findById(newLocationId)
      .select("_id name managers isActive")
      .session(session),
  ]);

  if (!newLocation) throw new ApiError(404, "New location not found");
  if (!newLocation.isActive)
    throw new ApiError(400, "Cannot move ticket to an inactive location");

  return {
    locationChanged: true,
    oldLocation,
    newLocation,
    oldManagerIds: oldLocation?.managers?.map((id) => id.toString()) ?? [],
    newManagerIds: newLocation.managers.map((id) => id.toString()),
  };
}

async function resolveCategoryChange(category, categoryOtherText, session) {
  if (category === undefined) return null;

  const newCategoryDoc =
    await TicketCategory.findById(category).session(session);
  if (!newCategoryDoc) throw new ApiError(404, "Selected category not found");
  if (!newCategoryDoc.isActive)
    throw new ApiError(400, "Selected category is not active");

  const isOtherCategory =
    newCategoryDoc.isSystem && newCategoryDoc.name === "Other";
  if (isOtherCategory && !categoryOtherText?.trim()) {
    throw new ApiError(400, "Please specify a category when selecting 'Other'");
  }

  return newCategoryDoc;
}
async function resolveCategoryForEmail(ticket, newCategoryDoc, session) {
  return (
    newCategoryDoc ??
    (await TicketCategory.findById(ticket.category)
      .select("name isSystem")
      .session(session))
  );
}

// ---------------------------------------------------------------------------
// 6. Apply updates to the ticket document
// ---------------------------------------------------------------------------
async function applyTicketUpdates({
  ticket,
  body,
  uploadedFile,
  newCategoryDoc,
  locationChange,
  wantsStatus,
  userId,
  session,
}) {
  const {
    description,
    requestTitle,
    categoryOtherText,
    priority,
    assignedTo: newAssignedToId,
    status: newStatus,
    overview,
  } = body;

  if (description !== undefined) ticket.description = description;
  if (requestTitle !== undefined) ticket.req_title = requestTitle;
  const oldStatus = ticket.status;
  if (overview !== undefined) {
    ticket.overview = String(overview).trim();
    ticket.overviewUpdatedBy = userId;
    ticket.overviewUpdatedAt = new Date();
  }
  if (newCategoryDoc) {
    ticket.category = newCategoryDoc._id;
    const isOtherCategory =
      newCategoryDoc.isSystem && newCategoryDoc.name === "Other";
    ticket.categoryOtherText = isOtherCategory
      ? categoryOtherText.trim()
      : null;
  } else if (categoryOtherText !== undefined) {
    // category itself wasn't resubmitted, but text was updated in place —
    // only allow this if the ticket's *current* category is still "Other"
    const currentCategoryDoc = await TicketCategory.findById(
      ticket.category,
    ).session(session);
    const isOtherCategory =
      currentCategoryDoc?.isSystem && currentCategoryDoc?.name === "Other";
    if (!isOtherCategory) {
      throw new ApiError(
        400,
        "categoryOtherText can only be set when category is 'Other'",
      );
    }
    if (!categoryOtherText?.trim()) {
      throw new ApiError(400, "Please specify a category");
    }
    ticket.categoryOtherText = categoryOtherText.trim();
  }
  if (locationChange.locationChanged)
    ticket.location = locationChange.newLocation._id;
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

  let newAssignee = null;
  if (newAssignedToId !== undefined) {
    newAssignee = await User.findById(newAssignedToId).session(session);
    if (!newAssignee) throw new ApiError(404, "New assignee not found");

    const isSamePerson = ticket.assignedTo?.equals(newAssignee._id);
    if (!isSamePerson) {
      ticket.assignmentHistory.push({
        assignedTo: newAssignee._id,
        assignedBy: userId,
        assignedAt: new Date(),
      });
      ticket.assignedTo = newAssignee._id;

      // hand-over mid-work: new person must press Start themselves
      if (ticket.status === TICKET_STATUS.IN_PROGRESS) {
        ticket.status = TICKET_STATUS.APPROVED;
        ticket.statusHistory.push({
          status: TICKET_STATUS.APPROVED,

          changedBy: userId,
          changedAt: new Date(),
        });
      }
    }
  }

  const statusChanged = wantsStatus && newStatus !== oldStatus;
  if (statusChanged) {
    ticket.status = newStatus;
    if (Array.isArray(ticket.statusHistory)) {
      ticket.statusHistory.push({
        status: newStatus,
        changedBy: userId,
        changedAt: new Date(),
      });
    }
  }

  await ticket.save({ session });

  return { oldStatus, statusChanged, newAssignee };
}

// ---------------------------------------------------------------------------
// 7. Notification job builders — each returns [] or a list of job objects:
//    { recipients, title, message, link, createdBy, meta, email }
//    Nothing here calls notifyAndEmit; that happens in dispatchNotificationJobs.
// ---------------------------------------------------------------------------
function buildRerouteNotifications({
  ticket,
  locationChange,
  userId,
  req,
  categoryDisplayName,
}) {
  if (!locationChange.locationChanged) return [];

  const { oldLocation, newLocation, oldManagerIds, newManagerIds } =
    locationChange;
  const oldManagerSet = new Set(oldManagerIds);
  const newManagerSet = new Set(newManagerIds);

  const removedManagerIds = oldManagerIds.filter(
    (id) => !newManagerSet.has(id),
  );
  const addedManagerIds = newManagerIds.filter((id) => !oldManagerSet.has(id));

  const createdByName = req.user.firstname
    ? `${req.user.firstname} ${req.user.lastname}`
    : "Ticket Creator";

  const jobs = [];

  if (removedManagerIds.length) {
    jobs.push({
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
      email: {
        userIds: removedManagerIds,
        templateType: "ticket_rerouted_old_manager",
        dataBuilder: (user) => ({
          managerName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          oldLocation: oldLocation.name,
          newLocation: newLocation.name,
          createdBy: createdByName,
          link: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
        }),
      },
    });
  }

  if (addedManagerIds.length) {
    jobs.push({
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
      email: {
        userIds: addedManagerIds,
        templateType: "ticket_pending_manager",
        dataBuilder: (user) => ({
          managerName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: categoryDisplayName,
          location: newLocation.name,
          createdBy: createdByName,
          link: `${process.env.FRONTEND_URL}/tickets/${ticket._id}`,
        }),
      },
    });
  }
  // unchangedManagerIds intentionally get no email/notification.

  return jobs;
}

function buildReassignmentNotification({
  ticket,
  newAssignedToId,
  userIdStr,
  userId,
  categoryDisplayName,
}) {
  if (newAssignedToId === undefined) return [];

  const recipientId = newAssignedToId.toString();
  if (recipientId === userIdStr) return [];

  return [
    {
      recipients: [{ userId: recipientId }],
      title: "Ticket Reassigned to You",
      message: `Ticket "${ticket.req_title}" has been reassigned to you.`,
      link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
      createdBy: userId,
      meta: { ticketId: ticket.slug },
      email: {
        userIds: [recipientId],
        templateType: "ticket_assigned",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: categoryDisplayName,
          priority: ticket.priority || "-",
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&item=${ticket.slug}`,
        }),
      },
    },
  ];
}

function buildStatusChangeNotification({
  ticket,
  statusChanged,
  oldStatus,
  newStatus,
  userId,
  userIdStr,
  categoryForEmail,
}) {
  if (!statusChanged) return [];

  const statusRecipients = [
    ticket.createdBy,
    ticket.assignedTo,
    ticket.approvedBy,
  ]
    .filter(Boolean)
    .map((id) => id.toString())
    .filter((id, idx, arr) => arr.indexOf(id) === idx) // dedupe
    .filter((id) => id !== userIdStr); // don't notify the actor

  if (!statusRecipients.length) return [];

  const job = {
    recipients: statusRecipients.map((uid) => ({ userId: uid })),
    title: "Ticket Status Updated",
    message: `Ticket "${ticket.req_title}" status changed from ${oldStatus} to ${newStatus}.`,
    link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
    createdBy: userId,
    meta: {
      ticketId: ticket.slug,
      event: "ticket_status_changed",
      fromStatus: oldStatus,
      toStatus: newStatus,
    },
  };

  const statusEmailTemplate = STATUS_EMAIL_TEMPLATE_MAP[newStatus];
  if (statusEmailTemplate) {
    job.email = {
      userIds: statusRecipients,
      templateType: statusEmailTemplate,
      dataBuilder: (user) => ({
        recipientName: `${user.firstname} ${user.lastname}`,
        ticketTitle: ticket.req_title,
        category: categoryForEmail?.name ?? "-",
        location: ticket.location?.name ?? "-",
        link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&item=${ticket.slug}`,
      }),
    };
  }

  return [job];
}

/**
 * Catch-all so super_admins hear about edits that don't otherwise generate
 * any notification job above — e.g. the creator only changed the
 * description/title/photo, or only priority changed with no reassignment
 * or status change. Without this, those edits were previously silent to
 * everyone, including super_admins.
 */
function buildGenericEditNotification({
  ticket,
  submittedFields,
  hasOtherJobs,
  userId,
}) {
  if (hasOtherJobs) return [];

  const changedFieldList = [...submittedFields].join(", ");

  return [
    {
      recipients: [], // filled in by withSuperAdminCc — this job exists purely for super_admin visibility
      title: "Ticket Edited",
      message: `Ticket "${ticket.req_title}" was edited (${changedFieldList}).`,
      link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
      createdBy: userId,
      meta: {
        ticketId: ticket.slug,
        event: "ticket_edited",
        changedFields: [...submittedFields],
      },
      superAdminOnly: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// 8. Fold super_admins into every job's recipients (deduped, actor excluded)
// ---------------------------------------------------------------------------
async function withSuperAdminCc(jobs, { userId, session }) {
  if (!jobs.length) return jobs;

  const superAdmins = await User.find({ role: "super_admin" })
    .select("_id")
    .session(session);
  const superAdminIds = superAdmins
    .map((u) => u._id.toString())
    .filter((id) => id !== userId.toString());

  return jobs.map((job) => {
    const existingIds = new Set(job.recipients.map((r) => r.userId.toString()));
    const ccIds = superAdminIds.filter((id) => !existingIds.has(id));
    if (!ccIds.length) return job;

    const mergedRecipients = [
      ...job.recipients,
      ...ccIds.map((id) => ({ userId: id })),
    ];
    const mergedEmailUserIds = job.email
      ? [...new Set([...job.email.userIds, ...ccIds])]
      : undefined;

    return {
      ...job,
      recipients: mergedRecipients,
      email: job.email
        ? { ...job.email, userIds: mergedEmailUserIds }
        : job.email,
    };
  });
}

// ---------------------------------------------------------------------------
// 9. Execute jobs: DB notification + socket queued now, email queued for
//    after commit (into the emailEvents array owned by the caller).
// ---------------------------------------------------------------------------
async function dispatchNotificationJobs(jobs, { session, emailEvents }) {
  for (const job of jobs) {
    if (!job.recipients.length) continue;

    await notifyAndEmit(session, {
      recipients: job.recipients,
      title: job.title,
      message: job.message,
      link: job.link,
      createdBy: job.createdBy,
      meta: job.meta,
      emit: false,
    });

    if (job.email) {
      emailEvents.push(job.email);
    }
  }
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------
export const editTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;
  const userId = req.user._id;
  const userIdStr = userId.toString();
  const isSuperAdmin = req.user.role === "super_admin";
  const session = await mongoose.startSession();

  // Kept outside the transaction because emails fire only after commit.
  const emailEvents = [];

  try {
    session.startTransaction();

    const ticket = await loadTicket(ticketId, session);

    const { isCreator, isApprover, isAssignee } = resolveCallerPermissions(
      ticket,
      userId,
      isSuperAdmin,
    );
    // controller, after resolveCallerPermissions
    const isLocationManager = await isManagerOfTicketLocation(
      userId,
      ticket.location,
      session,
    );
    const submittedFields = collectSubmittedFields(req.body, Boolean(req.file));

    const { wantsStatus } = assertFieldPermissions({
      submittedFields,
      ticket,
      newStatus: req.body.status,
      isCreator,
      isApprover,
      isAssignee,
      isSuperAdmin,
    });

    // only upload once the caller is known to be allowed to edit
    const uploadedFile = await uploadPhotoIfPresent(req.file);
    const locationChange = await resolveLocationChange(
      ticket,
      req.body.location,
      session,
    );
    const newCategoryDoc = await resolveCategoryChange(
      req.body.category,
      req.body.categoryOtherText,
      session,
    );

    const { oldStatus, statusChanged, newAssignee } = await applyTicketUpdates({
      ticket,
      body: req.body,
      uploadedFile,
      newCategoryDoc,
      locationChange,
      wantsStatus,
      userId,
      session,
    });
    await resyncTicketMembership(ticket, session);
    // ---- Build notification jobs (pure — no side effects yet) ----
    const rerouteJobs = buildRerouteNotifications({
      ticket,
      locationChange,
      userId,
      req,
      categoryDisplayName: getCategoryDisplayName(
        await TicketCategory.findById(ticket.category)
          .select("name isSystem")
          .session(session),
        ticket.categoryOtherText,
      ),
    });

    // in editTicket controller, right after resolving:
    const reassignmentCategoryForEmail =
      req.body.assignedTo !== undefined
        ? await resolveCategoryForEmail(ticket, newCategoryDoc, session)
        : null;

    const reassignmentJobs = buildReassignmentNotification({
      ticket,
      newAssignedToId: req.body.assignedTo,
      userIdStr,
      userId,
      categoryDisplayName: getCategoryDisplayName(
        reassignmentCategoryForEmail,
        ticket.categoryOtherText,
      ),
    });

    const statusCategoryForEmail = statusChanged
      ? await resolveCategoryForEmail(ticket, newCategoryDoc, session)
      : null;
    const statusJobs = buildStatusChangeNotification({
      ticket,
      statusChanged,
      oldStatus,
      newStatus: req.body.status,
      userId,
      userIdStr,
      categoryForEmail: statusCategoryForEmail,
    });

    const hasOtherJobs = Boolean(
      rerouteJobs.length || reassignmentJobs.length || statusJobs.length,
    );
    const genericJobs = buildGenericEditNotification({
      ticket,
      submittedFields,
      hasOtherJobs,
      userId,
    });

    const allJobs = [
      ...rerouteJobs,
      ...reassignmentJobs,
      ...statusJobs,
      ...genericJobs,
    ];
    const jobsWithSuperAdminCc = await withSuperAdminCc(allJobs, {
      userId,
      session,
    });

    await dispatchNotificationJobs(jobsWithSuperAdminCc, {
      session,
      emailEvents,
    });

    await session.commitTransaction();

    await Promise.all(
      emailEvents.map((event) =>
        notifyTicketEmail({ ...event, session: undefined }),
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

  // const effectivePermissions = new Set([
  //   ...rolePermissions,
  //   ...customPermissions,
  // ]);

  /* ----------------------------------
     PERMISSION SCOPE (VISIBILITY)
  -----------------------------------*/
  /* ----------------------------------
   PERMISSION SCOPE (VISIBILITY)
-----------------------------------*/

  const visibilityOr = [];

  if (req.user.role !== "super_admin") {
    const managedLocations = await Location.find(
      { managers: req.user._id },
      "_id",
    );

    const managedLocationIds = managedLocations.map((l) => l._id);

    // Always allow own tickets
    visibilityOr.push(
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
    );

    // Allow tickets from managed locations
    if (managedLocationIds.length) {
      visibilityOr.push({
        location: { $in: managedLocationIds },
      });
    }

    if (visibilityOr.length) {
      andConditions.push({ $or: visibilityOr });
    }
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
    .populate("category", "name isActive")
    .populate("location", "name managers")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname")
    .populate("overviewUpdatedBy", "firstname lastname");

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
    closed,
    rejected,
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
export const FetchTicketBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw new ApiError(400, "Ticket slug is required");
  }

  /* ----------------------------------
     PERMISSION SCOPE
  -----------------------------------*/

  const visibilityOr = [];

  // Super admin can view all tickets
  if (req.user.role !== "super_admin") {
    const managedLocations = await Location.find(
      { managers: req.user._id },
      "_id",
    );

    const managedLocationIds = managedLocations.map((location) => location._id);

    // Own tickets
    visibilityOr.push(
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
    );

    // Tickets from locations managed by the user
    if (managedLocationIds.length) {
      visibilityOr.push({
        location: { $in: managedLocationIds },
      });
    }
  }

  /* ----------------------------------
     FIND TICKET
  -----------------------------------*/

  const ticketFilter = {
    slug,
    ...(visibilityOr.length ? { $or: visibilityOr } : {}),
  };

  const ticket = await Ticket.findOne(ticketFilter)
    .populate("category", "name isActive")
    .populate("location", "name managers")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname")
    .populate("overviewUpdatedBy", "firstname lastname");

  /* ----------------------------------
     NOT FOUND
  -----------------------------------*/

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  /* ----------------------------------
     RESPONSE
  -----------------------------------*/

  return res
    .status(200)
    .json(new ApiResponse(200, "Ticket fetched successfully", ticket));
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
      .populate("category", "name")
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
    // GetTicketsReport mapping
    category:
      t.category.name === "Other" && t.categoryOtherText
        ? `Other: ${t.categoryOtherText}`
        : t.category.name,
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
    .populate("category", "name isActive")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname email")
    .populate("rejectedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname")
    .populate("assignmentHistory.assignedBy", "firstname lastname")
    .populate("statusHistory.changedBy", "firstname lastname")
    .populate("overviewUpdatedBy", "firstname lastname")
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
    category: ticket.category?.name || "-",
    categoryId: ticket.category?._id || null,
    location: ticket.location?.name || "-",
    photo: ticket.photo || null,
    categoryOtherText: ticket.categoryOtherText || null,
    overviewUpdatedBy: ticket.overviewUpdatedBy
      ? `${ticket.overviewUpdatedBy.firstname} ${ticket.overviewUpdatedBy.lastname}`
      : null,
    overviewUpdatedAt: ticket.overviewUpdatedAt || null,
    overview: ticket.overview || null,
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
const formatDate = (date) => (date ? new Date(date).toLocaleString() : "-");
/* ---- Pull the timestamp of the first assignment from assignmentHistory ---- */
const getAssignedDate = (assignmentHistory) => {
  if (!assignmentHistory?.length) return null;
  return assignmentHistory[0].assignedAt;
};

/* ---- Human-readable duration between two dates ---- */
const getDuration = (start, end) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "-";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
};

/* ------------------------------ helpers ------------------------------ */

// Toronto time, handles EST/EDT automatically
const fmt = (date) =>
  date ? dayjs(date).tz(TZ).format("YYYY-MM-DD hh:mm A") : "-";

const fullName = (u) => {
  if (!u || (!u.firstname && !u.lastname)) return "-";
  return `${u.firstname || ""} ${u.lastname || ""}`.trim();
};

const diffMs = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms >= 0 ? ms : null;
};

const fmtMs = (ms) => {
  if (ms === null || ms === undefined) return "-";
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  return `${d}d ${h}h ${m}m`;
};

const duration = (start, end) => fmtMs(diffMs(start, end));

const byDate = (arr, field) =>
  [...(arr || [])].sort((a, b) => new Date(a[field]) - new Date(b[field]));

const lastWhere = (arr, fn) => {
  for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i])) return arr[i];
  return null;
};

// index of the assignment that was active at a given moment (-1 if none)
const assignmentIndexAt = (assigns, at) => {
  let idx = -1;
  assigns.forEach((a, i) => {
    if (new Date(a.assignedAt) <= new Date(at)) idx = i;
  });
  return idx;
};

const displayId = (t) => `TICKET-${String(t.ticketNumber).padStart(5, "0")}`;

/* -------------------- everything derived from history -------------------- */
const analyzeTicket = (t) => {
  const S = TICKET_STATUS;
  const hist = byDate(t.statusHistory, "changedAt");
  const assigns = byDate(t.assignmentHistory, "assignedAt");

  /* ---- work sessions: every In Progress -> next status ---- */
  const sessions = [];
  let open = null;
  const closeSession = (end) => {
    const idx = assignmentIndexAt(assigns, open.changedAt);
    const assignment = idx >= 0 ? assigns[idx] : null;
    sessions.push({
      assignmentNo: idx >= 0 ? idx + 1 : "-",
      worker: assignment?.assignedTo
        ? fullName(assignment.assignedTo)
        : fullName(open.changedBy),
      assignedAt: assignment?.assignedAt || null,
      startedAt: open.changedAt,
      endedAt: end?.changedAt || null,
      endedWith: end ? end.status || "(not recorded)" : "Still in progress",
      endedBy: end ? fullName(end.changedBy) : "-",
      ms: end ? diffMs(open.changedAt, end.changedAt) : null,
    });
    open = null;
  };
  for (const h of hist) {
    if (h.status === S.IN_PROGRESS) {
      if (!open) open = h;
    } else if (open) {
      closeSession(h);
    }
  }
  if (open) closeSession(null);

  const totalWorkMs = sessions.reduce((sum, s) => sum + (s.ms || 0), 0);

  /* ---- key milestones ---- */
  const completions = hist.filter((h) => h.status === S.COMPLETED);
  const lastCompletion = completions[completions.length - 1] || null;
  const completedAt = lastCompletion?.changedAt || t.resolvedAt || null;

  let resolvedBy = fullName(lastCompletion?.changedBy);
  if (resolvedBy === "-" && completedAt) resolvedBy = fullName(t.assignedTo);

  const approved = lastWhere(hist, (h) => h.status === S.APPROVED);
  const rejected = lastWhere(hist, (h) => h.status === S.REJECTED);
  // an "Open" entry that is not the first entry = a reopen
  const reopens = hist.filter((h, i) => i > 0 && h.status === S.OPEN);

  /* ---- timeline: status changes + assignments merged ---- */
  const events = [];
  hist.forEach((h, i) => {
    events.push({
      at: h.changedAt,
      type: "Status change",
      from: h.fromStatus || hist[i - 1]?.status || "-",
      to: h.status || "(not recorded)",
      by: fullName(h.changedBy),
    });
  });
  assigns.forEach((a, i) => {
    events.push({
      at: a.assignedAt,
      type: i === 0 ? "Assigned" : `Reassigned (assignment #${i + 1})`,
      from: i > 0 ? fullName(assigns[i - 1].assignedTo) : "-",
      to: fullName(a.assignedTo),
      by: fullName(a.assignedBy),
    });
  });
  events.sort((a, b) => new Date(a.at) - new Date(b.at));

  return {
    hist,
    assigns,
    sessions,
    events,
    totalWorkMs,
    completedAt,
    resolvedBy,
    timesCompleted: completions.length,
    approved,
    rejected,
    reopens,
  };
};

const styleHeader = (sheet) => {
  const row = sheet.getRow(1);
  row.font = { bold: true };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
};

/* ------------------------------ controller ------------------------------ */
export const ExportTicketsReport = asyncHandler(async (req, res) => {
  const filter = await buildReportFilter(req);

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .populate("location", "name")
    .populate("category", "name")
    .populate("createdBy", "firstname lastname email")
    .populate("assignedTo", "firstname lastname email")
    .populate("approvedBy", "firstname lastname email")
    .populate("rejectedBy", "firstname lastname email")
    .populate("statusHistory.changedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname email")
    .populate("assignmentHistory.assignedBy", "firstname lastname email")
    .populate("overviewUpdatedBy", "firstname lastname")
    .lean();

  const workbook = new ExcelJS.Workbook();

  /* ============================ Sheet 1: Tickets ============================ */
  const sheet = workbook.addWorksheet("Tickets");
  sheet.columns = [
    { header: "Ticket ID", key: "ticketId", width: 14 },
    { header: "Title", key: "title", width: 28 },
    { header: "Description", key: "description", width: 40 },
    { header: "Overview", key: "overview", width: 40 },
    { header: "Overview Updated By", key: "overviewUpdatedBy", width: 22 },
    { header: "Overview Updated Date", key: "overviewUpdatedAt", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Priority", key: "priority", width: 10 },
    { header: "Category", key: "category", width: 16 },
    { header: "Category Detail", key: "categoryOtherText", width: 22 },
    { header: "Location", key: "location", width: 20 },
    { header: "Submitted By", key: "submittedBy", width: 22 },
    { header: "Submitted Email", key: "submittedEmail", width: 26 },
    { header: "Created Date", key: "createdDate", width: 20 },
    { header: "Approved By", key: "approvedBy", width: 22 },
    { header: "Approved Date (latest)", key: "approvedDate", width: 22 },
    { header: "Rejected By", key: "rejectedBy", width: 22 },
    { header: "Rejected Date (latest)", key: "rejectedDate", width: 22 },
    { header: "Rejection Reason", key: "rejectionReason", width: 30 },
    { header: "Currently Assigned To", key: "assignedTo", width: 22 },
    { header: "First Assigned Date", key: "firstAssignedDate", width: 20 },
    { header: "Last Assigned Date", key: "lastAssignedDate", width: 20 },
    { header: "Times Assigned", key: "timesAssigned", width: 12 },
    { header: "Times Reassigned", key: "timesReassigned", width: 12 },
    { header: "Times Reopened", key: "timesReopened", width: 12 },
    { header: "Last Reopened Date", key: "lastReopenedDate", width: 20 },
    { header: "First Started Work", key: "firstStarted", width: 20 },
    { header: "Latest Started Work", key: "lastStarted", width: 20 },
    { header: "Work Sessions", key: "sessionCount", width: 12 },
    { header: "Completed Date (latest)", key: "completedDate", width: 22 },
    { header: "Times Completed", key: "timesCompleted", width: 12 },
    { header: "Resolved By", key: "resolvedBy", width: 22 },
    {
      header: "Resolution Time (Created→Completed)",
      key: "resolutionTime",
      width: 24,
    },
    {
      header: "Time (First Assigned→Completed)",
      key: "assignToDone",
      width: 24,
    },
    { header: "Actual Work Time (all sessions)", key: "workTime", width: 24 },
    { header: "Last Updated Date", key: "updatedDate", width: 20 },
    { header: "Attachment URL", key: "attachmentUrl", width: 40 },
  ];

  /* ============================ Sheet 2: Timeline ============================ */
  const timeline = workbook.addWorksheet("Timeline");
  timeline.columns = [
    { header: "Ticket ID", key: "ticketId", width: 14 },
    { header: "Title", key: "title", width: 28 },
    { header: "Step #", key: "step", width: 8 },
    { header: "Date & Time (Toronto)", key: "at", width: 22 },
    { header: "Event", key: "type", width: 30 },
    { header: "From", key: "from", width: 22 },
    { header: "To / Assignee", key: "to", width: 22 },
    { header: "Done By", key: "by", width: 22 },
    { header: "Time Since Previous Step", key: "since", width: 22 },
  ];

  /* ========================== Sheet 3: Work Sessions ========================== */
  const sessionsSheet = workbook.addWorksheet("Work Sessions");
  sessionsSheet.columns = [
    { header: "Ticket ID", key: "ticketId", width: 14 },
    { header: "Title", key: "title", width: 28 },
    { header: "Session #", key: "no", width: 10 },
    { header: "Assignment #", key: "assignmentNo", width: 12 },
    { header: "Worker", key: "worker", width: 22 },
    { header: "Assigned At", key: "assignedAt", width: 20 },
    { header: "Started At", key: "startedAt", width: 20 },
    { header: "Ended At", key: "endedAt", width: 20 },
    { header: "Ended With Status", key: "endedWith", width: 18 },
    { header: "Ended By", key: "endedBy", width: 22 },
    { header: "Time Assigned→Started", key: "toStart", width: 22 },
    { header: "Work Duration", key: "duration", width: 18 },
  ];

  /* ========================== Sheet 4: Conversation ========================== */

  /* ------------------------------ fill rows ------------------------------ */
  tickets.forEach((t) => {
    const a = analyzeTicket(t);
    const tid = displayId(t);

    const firstAssigned = a.assigns[0]?.assignedAt || null;
    const lastAssigned = a.assigns[a.assigns.length - 1]?.assignedAt || null;
    const lastReopen = a.reopens[a.reopens.length - 1] || null;

    sheet.addRow({
      ticketId: tid,
      title: t.req_title,
      description: stripHtml(t.description),
      overview: t.overview || "-",
      overviewUpdatedBy: fullName(t.overviewUpdatedBy),
      overviewUpdatedAt: fmt(t.overviewUpdatedAt),
      status: t.status,
      priority: t.priority || "-",
      category: t.category?.name || "-",
      categoryOtherText: t.categoryOtherText || "-",
      location: t.location?.name || "-",
      submittedBy: fullName(t.createdBy),
      submittedEmail: t.createdBy?.email || "-",
      createdDate: fmt(t.createdAt),
      approvedBy: fullName(t.approvedBy),
      approvedDate: fmt(a.approved?.changedAt),
      rejectedBy: fullName(t.rejectedBy),
      rejectedDate: fmt(a.rejected?.changedAt),
      rejectionReason: t.rejectionReason || "-",
      assignedTo: fullName(t.assignedTo),
      firstAssignedDate: fmt(firstAssigned),
      lastAssignedDate: fmt(lastAssigned),
      timesAssigned: a.assigns.length,
      timesReassigned: Math.max(0, a.assigns.length - 1),
      timesReopened: a.reopens.length,
      lastReopenedDate: fmt(lastReopen?.changedAt),
      firstStarted: fmt(a.sessions[0]?.startedAt),
      lastStarted: fmt(a.sessions[a.sessions.length - 1]?.startedAt),
      sessionCount: a.sessions.length,
      completedDate: fmt(a.completedAt),
      timesCompleted: a.timesCompleted,
      resolvedBy: a.resolvedBy,
      resolutionTime: duration(t.createdAt, a.completedAt),
      assignToDone: duration(firstAssigned, a.completedAt),
      workTime: a.sessions.length ? fmtMs(a.totalWorkMs) : "-",

      updatedDate: fmt(t.updatedAt),
      attachmentUrl: t.photo?.fileUrl || "-",
    });

    // ---- timeline rows
    a.events.forEach((e, i) => {
      timeline.addRow({
        ticketId: tid,
        title: t.req_title,
        step: i + 1,
        at: fmt(e.at),
        type: e.type,
        from: e.from,
        to: e.to,
        by: e.by,
        since: i === 0 ? "-" : duration(a.events[i - 1].at, e.at),
      });
    });

    // ---- work session rows
    a.sessions.forEach((s, i) => {
      sessionsSheet.addRow({
        ticketId: tid,
        title: t.req_title,
        no: i + 1,
        assignmentNo: s.assignmentNo,
        worker: s.worker,
        assignedAt: fmt(s.assignedAt),
        startedAt: fmt(s.startedAt),
        endedAt: fmt(s.endedAt),
        endedWith: s.endedWith,
        endedBy: s.endedBy,
        toStart: duration(s.assignedAt, s.startedAt),
        duration: fmtMs(s.ms),
      });
    });
  });

  if (tickets.length === 0) {
    sheet.addRow({ ticketId: "No tickets found for the selected filters." });
  }

  /* ------------------------------ formatting ------------------------------ */
  [sheet, timeline, sessionsSheet].forEach(styleHeader);

  sheet.getColumn("description").alignment = {
    wrapText: true,
    vertical: "top",
  };
  sheet.getColumn("rejectionReason").alignment = {
    wrapText: true,
    vertical: "top",
  };
  sheet.getColumn("overview").alignment = {
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

/* ------------------------------------------------------------------
   PATCH /api/tickets/:id/reopen
   Allows a Closed, Rejected, or Completed ticket to be reopened.
   Only the creator, the approving manager, or a super admin can do this.
   Reopening always sends the ticket back to "Open" so it re-enters the
   normal approval flow.
-------------------------------------------------------------------*/
const REOPENABLE_STATUSES = [
  TICKET_STATUS.CLOSED,
  TICKET_STATUS.REJECTED,
  TICKET_STATUS.COMPLETED,
];

export const reopenTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;

  const userId = req.user._id;
  const userIdStr = userId.toString();
  const isSuperAdmin = req.user.role === "super_admin";
  const session = await mongoose.startSession();

  let emailEvents = [];

  try {
    session.startTransaction();

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      throw new ApiError(404, "No such ticket found");
    }

    const isApprover = ticket.approvedBy?.equals(userId) ?? false;

    if (!isSuperAdmin && !isApprover) {
      throw new ApiError(
        403,
        "Only the approving manager, or super admin can reopen this ticket",
      );
    }

    if (!REOPENABLE_STATUSES.includes(ticket.status)) {
      throw new ApiError(
        400,
        `Ticket cannot be reopened from its current status (${ticket.status})`,
      );
    }

    const oldStatus = ticket.status;

    ticket.status = TICKET_STATUS.APPROVED;

    if (Array.isArray(ticket.statusHistory)) {
      ticket.statusHistory.push({
        status: TICKET_STATUS.APPROVED,
        changedBy: userId,
        changedAt: new Date(),
      });
    }

    // Reopening resets prior approval/assignment decisions so it goes
    // through the normal flow again. Adjust if you want to preserve these.

    ticket.priorityLocked = false;

    await ticket.save({ session });
    await resyncTicketMembership(ticket, session);
    // -----------------------------------------
    // Notify: creator (if not the actor) + previous assignee (if any)
    // -----------------------------------------
    const recipients = [ticket.createdBy, ticket.assignedTo]
      .filter(Boolean)
      .map((id) => id.toString())
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .filter((id) => id !== userIdStr);

    if (recipients.length) {
      await notifyAndEmit(session, {
        recipients: recipients.map((uid) => ({ userId: uid })),
        title: "Ticket Reopened",
        message: `Ticket "${ticket.req_title}" has been reopened.`,
        link: `/it_facility?tab=track_tickets&item=${ticket.slug}`,
        createdBy: userId,
        meta: {
          ticketId: ticket.slug,
          event: "ticket_reopened",
          fromStatus: oldStatus,
          toStatus: TICKET_STATUS.OPEN,
        },
        emit: false,
      });

      const categoryForEmail = await TicketCategory.findById(ticket.category)
        .select("name isSystem") // add isSystem
        .session(session);

      emailEvents.push({
        userIds: recipients,
        templateType: "ticket_reopened",
        dataBuilder: (user) => ({
          recipientName: `${user.firstname} ${user.lastname}`,
          ticketTitle: ticket.req_title,
          category: getCategoryDisplayName(
            categoryForEmail,
            ticket.categoryOtherText,
          ),
          reason: null,
          reopenedBy: req.user.firstname
            ? `${req.user.firstname} ${req.user.lastname}`
            : "Admin",
          link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&item=${ticket.slug}`,
        }),
      });
    }

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
      .json(new ApiResponse(200, "Ticket reopened successfully", ticket));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const deleteTicket = asyncHandler(async (req, res) => {
  const data = await ticketDeletion.softDelete(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, "Ticket deleted successfully", data));
});

export const restoreTicket = asyncHandler(async (req, res) => {
  const data = await ticketDeletion.restore(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, "Ticket restored", data));
});

export const closeTicket = asyncHandler(async (req, res) => {
  const { id: ticketId } = req.params;

  const userId = req.user._id;
  const userIdStr = userId.toString();
  const isSuperAdmin = req.user.role === "super_admin";
  const session = await mongoose.startSession();

  const emailEvents = [];
  let notification = null;
  let notifiedIds = [];

  try {
    session.startTransaction();

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      throw new ApiError(404, "No such ticket found");
    }

    const isApprover = ticket.approvedBy?.equals(userId) ?? false;
    if (!isSuperAdmin && !isApprover) {
      throw new ApiError(
        403,
        "Only the approving manager or super admin can close this ticket",
      );
    }

    if (ticket.status !== TICKET_STATUS.COMPLETED) {
      throw new ApiError(
        400,
        `Ticket must be Completed to close, currently ${ticket.status}`,
      );
    }

    const now = new Date();
    ticket.status = TICKET_STATUS.CLOSED;
    ticket.closedBy = userId;
    ticket.closedAt = now;
    ticket.statusHistory.push({
      status: TICKET_STATUS.CLOSED,
      changedBy: userId,
      changedAt: now,
    });

    await ticket.save({ session });
    await resyncTicketMembership(ticket, session);

    /* ======================
       NOTIFY: creator + assignee (actor excluded), super admins cc'd
    ====================== */
    const stakeholderIds = [ticket.createdBy, ticket.assignedTo]
      .filter(Boolean)
      .map((id) => id.toString())
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .filter((id) => id !== userIdStr);

    const superAdminIds = (await getSuperAdminIds(session)).filter(
      (id) => id !== userIdStr && !stakeholderIds.includes(id),
    );

    notifiedIds = [...stakeholderIds, ...superAdminIds];

    if (notifiedIds.length) {
      const [closer, locationDoc, categoryDoc] = await Promise.all([
        User.findById(userId).select("firstname lastname").session(session),
        Location.findById(ticket.location).select("name").session(session),
        TicketCategory.findById(ticket.category)
          .select("name isSystem")
          .session(session),
      ]);

      const closerName = closer
        ? `${closer.firstname} ${closer.lastname}`
        : "Manager";

      notification = await notifyAndEmit(session, {
        recipients: notifiedIds.map((id) => ({ userId: id })),
        title: "Ticket Closed",
        message: `Ticket "${ticket.req_title}" was closed by ${closerName}.`,
        link: `/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
        createdBy: userId,
        meta: {
          ticketId: ticket.slug,
          event: "ticket_closed",
          fromStatus: TICKET_STATUS.COMPLETED,
          toStatus: TICKET_STATUS.CLOSED,
        },
        emit: false, // emitted after commit
      });

      // emails only to stakeholders (not super admins)
      if (stakeholderIds.length) {
        emailEvents.push({
          userIds: stakeholderIds,
          templateType: "ticket_closed",
          dataBuilder: (user) => ({
            recipientName: `${user.firstname} ${user.lastname}`,
            ticketTitle: ticket.req_title,
            category: getCategoryDisplayName(
              categoryDoc,
              ticket.categoryOtherText,
            ),
            location: locationDoc?.name || "Unknown location",
            closedBy: closerName,
            closedAt: now.toLocaleDateString(),
            link: `${process.env.DOMAIN}/it_facility?tab=track_tickets&status=Closed&item=${ticket.slug}`,
          }),
        });
      }
    }

    await session.commitTransaction();

    // ---- side effects only after a successful commit ----
    if (notification) {
      notifiedIds.forEach((id) =>
        io.to(`user_${id}`).emit("newNotification", notification),
      );
    }

    await Promise.all(
      emailEvents.map((event) =>
        notifyTicketEmail({ ...event, session: undefined }),
      ),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Ticket closed successfully", ticket));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
