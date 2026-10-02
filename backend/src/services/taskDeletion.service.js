// services/deletion/taskDeletion.service.js
import mongoose from "mongoose";
import { ApiError } from "../utills/ApiError.js";
import Task from "../model/task.js";
import { ROLES } from "../model/user.js";
import { RETENTION_DAYS } from "./ticketDeletion.service.js";
import DeletionAudit from "../model/DeleteAudit.js";
import logger from "../utills/logger.js";
import Comment from "../model/comments.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import EntityMembership from "../model/EntityMemberShip.js";
import { deleteFromCloudinary } from "../utills/cloudinary.js";


const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

export async function softDelete(taskId, actor) {
  if (!mongoose.isValidObjectId(taskId)) throw new ApiError(400, "Invalid task id");

  // plugin hides already-deleted tasks, so a deleted one is a 404
  const existing = await Task.findById(taskId).select("assignedBy");
  if (!existing) throw new ApiError(404, "Task not found");

  const isSuperAdmin = actor.role === ROLES.SUPER_ADMIN;
  if (!isSuperAdmin && String(existing.assignedBy) !== String(actor._id)) {
    throw new ApiError(403, "You are not authorized to delete this task");
  }

  // conditional update: only one of two simultaneous deletes can match
  const task = await Task.findOneAndUpdate(
    { _id: taskId },
    { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: actor._id } },
    { new: true },
  );
  if (!task) throw new ApiError(404, "Task not found");

  try {
    await DeletionAudit.create({
      action: "soft_delete", entityType: "Task", entityId: task._id,
      label: `${task.displayId} ${task.title}`, actorId: actor._id,
    });
  } catch (e) {
    logger.error("Failed to write deletion audit", { taskId: String(task._id), error: e.message });
  }
  return { id: task._id, restorableUntil: addDays(task.deletedAt, RETENTION_DAYS) };
}

export async function restore(taskId, actor) {
  if (actor.role !== ROLES.SUPER_ADMIN) throw new ApiError(403, "Only super admins can restore tasks");
  const task = await Task.findOneAndUpdate(
    { _id: taskId, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null, deletedBy: null } },
    { new: true },
  ).setOptions({ withDeleted: true });
  if (!task) throw new ApiError(404, "Task not found (or already purged)");

  try {
    await DeletionAudit.create({ action: "restore", entityType: "Task", entityId: task._id, actorId: actor._id });
  } catch (e) {
    logger.error("Failed to write deletion audit", { taskId: String(task._id), error: e.message });
  }
  return { id: task._id };
}

// Purge job only. Your old controller logic, with the order fixed:
// DB first (atomic), Cloudinary after.
export async function purge(taskId) {
  const task = await Task.findOne({ _id: taskId, isDeleted: true })
    .setOptions({ withDeleted: true }).lean();
  if (!task) return null; // already purged or restored

  const comments = await Comment.find({ entityType: "Task", entityId: task._id })
    .select("attachments.fileUrl").lean();
  const fileUrls = comments
    .flatMap((c) => (c.attachments || []).map((a) => a.fileUrl))
    .filter(Boolean);

  const session = await mongoose.startSession();
  let counts;
  try {
    await session.withTransaction(async () => {
      const c = await Comment.deleteMany({ entityType: "Task", entityId: task._id }, { session });
      const n = await UserCommentNotification.deleteMany({ entityType: "Task", entityId: task._id }, { session });
      const m = await EntityMembership.deleteMany({ entityType: "Task", entityId: task._id }, { session });
      await Task.deleteOne({ _id: task._id, isDeleted: true }, { session });
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
      logger.error("Failed to delete Cloudinary attachment", { fileUrl: fileUrls[i], taskId: String(task._id), error: r.reason?.message });
    }
  });

  try {
    await DeletionAudit.create({
      action: "purge", entityType: "Task", entityId: task._id,
      label: `TASK-${String(task.taskNumber).padStart(5, "0")} ${task.title}`,
      counts: { ...counts, files: fileUrls.length }, failedFiles,
    });
  } catch (e) {
    logger.error("Failed to write deletion audit", { taskId: String(task._id), error: e.message });
  }
  return counts;
}