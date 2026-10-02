// services/deletion/userDeletion.service.js
import mongoose from "mongoose";

import { withTransaction } from "./transaction.js";
import Ticket, { TICKET_STATUS } from "../model/ticket.js";
import Task from "../model/task.js";
import Location from "../model/location.js";
import { ApiError } from "../utills/ApiError.js";
import User, { ROLES } from "../model/user.js";
import EntityMembership from "../model/EntityMemberShip.js";
import UserNotification from "../model/notificationTrack.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import DeletionAudit from "../model/DeleteAudit.js";
import logger from "../utills/logger.js";
import VolunteerCertification from "../model/VolunteerCertification.js";
import { deleteFromCloudinary } from "../utills/cloudinary.js";
import { hardDeleteEntities, deleteFilesBestEffort } from "./hardDelete.js";

const OPEN_TICKET = [TICKET_STATUS.APPROVED, TICKET_STATUS.IN_PROGRESS];

// Tickets this user requested that get permanently deleted with them.
// Completed tickets are intentionally NOT listed, so they stay on record for reports.
const CREATED_DELETE_STATUSES = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.APPROVED,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.REJECTED,
  TICKET_STATUS.CLOSED,
];

// Who may receive reassigned work (must match what getDeletionPreview offers)
const TICKET_HANDLER_ROLES = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.STAFF];
const LOCATION_MANAGER_ROLES = [ROLES.MANAGER];
const TASK_OWNER_ROLES = [ROLES.VOLUNTEER_ADMIN, ROLES.SUPER_ADMIN];

const pad = (n) => String(n).padStart(5, "0");

export async function findBlockers(userId, session = null) {
  const opt = session ? { session } : {};
  const [tasks, ownedTasks, tickets, createdTickets, locations, certificates] =
    await Promise.all([
      Task.find(
        { assignedTo: userId, status: { $ne: "completed" } },
        "taskNumber title status",
        opt,
      ).lean(),
      Task.find(
        { assignedBy: userId, status: { $ne: "completed" } },
        "taskNumber title status",
        opt,
      ).lean(),
      Ticket.find(
        { assignedTo: userId, status: { $in: OPEN_TICKET } },
        "ticketNumber req_title",
        opt,
      ).lean(),
      Ticket.find(
        { createdBy: userId, status: { $in: CREATED_DELETE_STATUSES } },
        "ticketNumber req_title",
        opt,
      ).lean(),
      Location.find({ facilityManager: userId }, "name slug", opt).lean(),
      VolunteerCertification.find(
        { volunteer: userId },
        "title fileUrl",
        opt,
      ).lean(),
    ]);

  return {
    tasks,
    ownedTasks,
    tickets,
    createdTickets,
    locations,
    certificates,
    // things that need an admin decision
    any: !!(
      tasks.length ||
      ownedTasks.length ||
      tickets.length ||
      locations.length
    ),
    // anything at all the delete will touch (drives the preview)
    hasWork: !!(
      tasks.length ||
      ownedTasks.length ||
      tickets.length ||
      createdTickets.length ||
      locations.length ||
      certificates.length
    ),
  };
}

async function loadTarget(id, session, label, allowedRoles) {
  if (!mongoose.isValidObjectId(id))
    throw new ApiError(422, `${label}: invalid reassign target`);
  const u = await User.findOne(
    { _id: id, status: "active", isDeleted: { $ne: true } },
    "_id role",
    { session },
  );
  if (!u)
    throw new ApiError(422, `${label}: reassign target must be an active user`);
  if (allowedRoles && !allowedRoles.includes(u.role))
    throw new ApiError(422, `${label}: target has an ineligible role`);
  return u;
}

export async function deleteUser(userId, actor, reassign = {}) {
  if (!mongoose.isValidObjectId(userId))
    throw new ApiError(400, "Invalid user id");
  if (actor.role !== ROLES.SUPER_ADMIN)
    throw new ApiError(403, "Only super admins can remove employees");
  if (String(actor._id) === String(userId))
    throw new ApiError(403, "You cannot remove your own account");

  const target = await User.findById(userId);
  if (!target || target.isDeleted)
    throw new ApiError(404, "No such user found");

  if (target.role === ROLES.SUPER_ADMIN) {
    const others = await User.countDocuments({
      role: ROLES.SUPER_ADMIN,
      status: "active",
      isDeleted: { $ne: true },
      _id: { $ne: target._id },
    });
    if (!others)
      throw new ApiError(409, "Cannot remove the last active super admin");
  }

  // withTransaction may re-run the callback, so everything is built fresh inside it
  const {
    counts,
    toDelete,
    certs,
    fileUrls: entityFiles,
  } = await withTransaction(async (session) => {
    const now = new Date();

    // 1. Flag first and take out of service. The user row stays as a tombstone.
    const flagged = await User.updateOne(
      { _id: userId, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: actor._id,
          status: "inactive",
          refreshToken: "",
          "currentStint.endAt": now,
          "volunteerStints.$[open].endAt": now,
          "volunteerStints.$[open].endedReason": "admin_deactivated",
        },
      },
      { session, arrayFilters: [{ "open.endAt": null }] },
    );
    if (!flagged.modifiedCount) throw new ApiError(404, "No such user found");

    // 2a. Permanently delete created tickets always, owned tasks only if chosen
    const first = await findBlockers(userId, session);
    const counts = {};
    const toDelete = {
      tasks: reassign.deleteOwnedTasks ? first.ownedTasks : [],
      tickets: first.createdTickets,
    };

    const t = await hardDeleteEntities(
      "Ticket",
      toDelete.tickets.map((d) => d._id),
      session,
    );
    const k = await hardDeleteEntities(
      "Task",
      toDelete.tasks.map((d) => d._id),
      session,
    );
    counts.ticketsDeleted = t.counts.entities;
    counts.tasksDeleted = k.counts.entities;
    counts.commentsDeleted = t.counts.comments + k.counts.comments;
    const entityFilesInTx = [...t.fileUrls, ...k.fileUrls];

    // 2b. Certificates: rows now, Cloudinary files after commit
    const certs = first.certificates;
    if (certs.length) {
      await VolunteerCertification.deleteMany(
        { volunteer: userId },
        { session },
      );
    }
    counts.certificatesDeleted = certs.length;

    // 2c. Re-read: deleted items are gone, so only what still needs a target remains
    const blockers = await findBlockers(userId, session);
    const missing = {};
    if (blockers.tasks.length && !reassign.tasks)
      missing.tasks = blockers.tasks;
    if (blockers.ownedTasks.length && !reassign.owners)
      missing.ownedTasks = blockers.ownedTasks;
    if (blockers.tickets.length && !reassign.tickets)
      missing.tickets = blockers.tickets;
    if (blockers.locations.length && !reassign.locations)
      missing.locations = blockers.locations;
    if (Object.keys(missing).length) {
      // aborts the transaction: nothing above is kept
      throw new ApiError(
        409,
        "User still has open work that must be reassigned or deleted",
        missing,
      );
    }

    // 2d. Reassignments
    if (blockers.tasks.length) {
      const dest = await loadTarget(reassign.tasks, session, "tasks", [
        ROLES.VOLUNTEER,
      ]);
      const assignHist = {
        fromAssignedTo: userId,
        assignedTo: dest._id,
        assignedBy: actor._id,
        assignedAt: now,
      };
      // review pending: send back to work for the new assignee
      const a = await Task.updateMany(
        { assignedTo: userId, status: "under_review" },
        {
          $set: { assignedTo: dest._id, status: "in_progress" },
          $push: {
            assignmentHistory: assignHist,
            statusHistory: {
              fromStatus: "under_review",
              toStatus: "in_progress",
              changedBy: actor._id,
              changedAt: now,
            },
          },
        },
        { session },
      );
      const b = await Task.updateMany(
        { assignedTo: userId, status: { $ne: "completed" } },
        {
          $set: { assignedTo: dest._id },
          $push: { assignmentHistory: assignHist },
        },
        { session },
      );
      counts.tasks = a.modifiedCount + b.modifiedCount;
      counts.tasksSentBackToWork = a.modifiedCount;
    }

    if (blockers.ownedTasks.length) {
      const dest = await loadTarget(
        reassign.owners,
        session,
        "owners",
        TASK_OWNER_ROLES,
      );
      const r = await Task.updateMany(
        { assignedBy: userId, status: { $ne: "completed" } },
        {
          $set: { assignedBy: dest._id },
          $push: {
            ownershipHistory: {
              from: userId,
              to: dest._id,
              changedBy: actor._id,
              changedAt: now,
            },
          },
        },
        { session },
      );
      counts.ownedTasks = r.modifiedCount;
    }

    if (blockers.tickets.length) {
      const dest = await loadTarget(
        reassign.tickets,
        session,
        "tickets",
        TICKET_HANDLER_ROLES,
      );
      const r = await Ticket.updateMany(
        { assignedTo: userId, status: { $in: OPEN_TICKET } },
        {
          $set: { assignedTo: dest._id },
          $push: {
            assignmentHistory: {
              assignedTo: dest._id,
              assignedBy: actor._id,
              assignedAt: now,
            },
          },
        },
        { session },
      );
      counts.tickets = r.modifiedCount;
    }

    if (blockers.locations.length) {
      const dest = await loadTarget(
        reassign.locations,
        session,
        "locations",
        LOCATION_MANAGER_ROLES,
      );
      const r = await Location.updateMany(
        { facilityManager: userId },
        { $set: { facilityManager: dest._id } },
        { session },
      );
      counts.locations = r.modifiedCount;
    }

    // 3. Detach and clean up
    await Location.updateMany(
      { managers: userId },
      { $pull: { managers: userId } },
      { session },
    );
    await User.updateMany(
      { superviserId: userId },
      { $set: { superviserId: target.superviserId ?? null } },
      { session },
    );
    await EntityMembership.updateMany(
      { userId, removedAt: null },
      { $set: { removedAt: now } },
      { session },
    );
    await UserNotification.deleteMany({ userId }, { session });
    await UserCommentNotification.deleteMany({ userId }, { session });

    return { counts, toDelete, certs, fileUrls: entityFilesInTx };
  });

  // Cloudinary only after commit: a leaked file is harmless, a live record with a dead file is not
  const fileUrls = [...certs.map((c) => c.fileUrl), ...entityFiles].filter(
    Boolean,
  );
  const failedFiles = await deleteFilesBestEffort(
    fileUrls,
    deleteFromCloudinary,
    logger,
    { userId: String(target._id) },
  );
  counts.filesDeleted = fileUrls.length - failedFiles.length;

  try {
    const rows = [
      {
        action: "user_delete",
        entityType: "User",
        entityId: target._id,
        label: `${target.firstname} ${target.lastname}`,
        actorId: actor._id,
        counts,
        failedFiles,
      },
      ...toDelete.tasks.map((t) => ({
        action: "purge",
        entityType: "Task",
        entityId: t._id,
        actorId: actor._id,
        label: `TASK-${pad(t.taskNumber)} ${t.title}`,
        counts: { reason: "owner_user_deleted" },
      })),
      ...toDelete.tickets.map((t) => ({
        action: "purge",
        entityType: "Ticket",
        entityId: t._id,
        actorId: actor._id,
        label: `TICKET-${pad(t.ticketNumber)} ${t.req_title}`,
        counts: { reason: "creator_user_deleted" },
      })),
    ];
    await DeletionAudit.insertMany(rows, { ordered: false });
  } catch (e) {
    logger.error("Failed to write deletion audit rows", {
      userId: String(target._id),
      error: e.message,
    });
  }

  return { id: target._id, reassigned: counts };
}

export async function getDeletionPreview(userId, actor) {
  if (!mongoose.isValidObjectId(userId))
    throw new ApiError(400, "Invalid user id");
  if (actor.role !== ROLES.SUPER_ADMIN)
    throw new ApiError(403, "Only super admins can remove employees");

  const target = await User.findById(userId).select("_id isDeleted");
  if (!target || target.isDeleted)
    throw new ApiError(404, "No such user found");

  const blockers = await findBlockers(userId);

  // the UI only needs titles, never file URLs
  blockers.certificates = blockers.certificates.map(({ _id, title }) => ({
    _id,
    title,
  }));

  if (!blockers.hasWork) return { blockers, candidates: {} };

  const pick = (roles) =>
    User.find(
      {
        _id: { $ne: userId },
        status: "active",
        isDeleted: { $ne: true },
        role: { $in: roles },
      },
      "firstname lastname role",
    )
      .sort({ firstname: 1 })
      .limit(300)
      .lean();

  const [volunteers, owners, handlers, managers] = await Promise.all([
    blockers.tasks.length ? pick([ROLES.VOLUNTEER]) : [],
    blockers.ownedTasks.length ? pick(TASK_OWNER_ROLES) : [],
    blockers.tickets.length ? pick(TICKET_HANDLER_ROLES) : [],
    blockers.locations.length ? pick(LOCATION_MANAGER_ROLES) : [],
  ]);

  return { blockers, candidates: { volunteers, owners, handlers, managers } };
}
