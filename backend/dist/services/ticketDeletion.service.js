// services/deletion/ticketDeletion.service.js
import mongoose from "mongoose";
import Location from "../model/location.js";
import { ApiError } from "../utills/ApiError.js";
import { ROLES } from "../model/user.js";
import Ticket from "../model/ticket.js";
import Comment from "../model/comments.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import EntityMembership from "../model/EntityMemberShip.js";
import { deleteFromCloudinary } from "../utills/cloudinary.js";

import logger from "../utills/logger.js";
import DeletionAudit from "../model/DeleteAudit.js";


export const RETENTION_DAYS = Number(process.env.DELETION_RETENTION_DAYS ?? 30);
const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

async function assertCanDelete(ticket, actor) {
  if (actor.role === ROLES.SUPER_ADMIN) return;
  const location = await Location.findById(ticket.location).select("managers").lean();
  if (!location) throw new ApiError(404, "Ticket's location not found");
  const isManager = location.managers.some((id) => String(id) === String(actor._id));
  if (!isManager) throw new ApiError(403, "You are not authorized to delete this ticket");
}

export async function softDelete(ticketId, actor) {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) throw new ApiError(400, "Invalid ticket id");

  // plugin hides already-deleted tickets, so a deleted one is a 404
  const existing = await Ticket.findById(ticketId).select("location");
  if (!existing) throw new ApiError(404, "No Such Ticket Found");
  await assertCanDelete(existing, actor);

  // conditional update: only one of two simultaneous deletes can match
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId },
    { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: actor._id } },
    { new: true },
  );
  if (!ticket) throw new ApiError(404, "No Such Ticket Found");

  await DeletionAudit.create({
    action: "soft_delete", entityType: "Ticket", entityId: ticket._id,
    label: `${ticket.displayId} ${ticket.req_title}`, actorId: actor._id,
  });
  return { id: ticket._id, restorableUntil: addDays(ticket.deletedAt, RETENTION_DAYS) };
}

export async function restore(ticketId, actor) {
  if (actor.role !== ROLES.SUPER_ADMIN) throw new ApiError(403, "Only super admins can restore tickets");
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null, deletedBy: null } },
    { new: true },
  ).setOptions({ withDeleted: true });
  if (!ticket) throw new ApiError(404, "Ticket not found (or already purged)");
  await DeletionAudit.create({ action: "restore", entityType: "Ticket", entityId: ticket._id, actorId: actor._id });
  return { id: ticket._id };
}

// Purge job only. This is your old controller logic, with the order fixed:
// DB first (atomic), Cloudinary after.
export async function purge(ticketId) {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: true })
    .setOptions({ withDeleted: true }).lean();
  if (!ticket) return null; // already purged or restored

  const comments = await Comment.find({ entityType: "Ticket", entityId: ticket._id })
    .select("attachments.fileUrl").lean();
  const fileUrls = [
    ticket.photo?.fileUrl,
    ...comments.flatMap((c) => (c.attachments || []).map((a) => a.fileUrl)),
  ].filter(Boolean);

  const session = await mongoose.startSession();
  let counts;
  try {
    await session.withTransaction(async () => {
      const c = await Comment.deleteMany({ entityType: "Ticket", entityId: ticket._id }, { session });
      const n = await UserCommentNotification.deleteMany({ entityType: "Ticket", entityId: ticket._id }, { session });
      const m = await EntityMembership.deleteMany({ entityType: "Ticket", entityId: ticket._id }, { session });
      await Ticket.deleteOne({ _id: ticket._id, isDeleted: true }, { session });
      counts = { comments: c.deletedCount, notifications: n.deletedCount, memberships: m.deletedCount };
    });
  } finally {
    session.endSession();
  }

  // files last: a leaked file is harmless, a live record with a dead file is not
  const results = await Promise.allSettled(fileUrls.map((u) => deleteFromCloudinary(u)));
  const failedFiles = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      failedFiles.push(fileUrls[i]);
      logger.error("Failed to delete Cloudinary attachment", { fileUrl: fileUrls[i], ticketId: String(ticket._id), error: r.reason?.message });
    }
  });

  await DeletionAudit.create({
    action: "purge", entityType: "Ticket", entityId: ticket._id,
    label: `TICKET-${String(ticket.ticketNumber).padStart(5, "0")} ${ticket.req_title}`,
    counts: { ...counts, files: fileUrls.length }, failedFiles,
  });
  return counts;
}