// services/deletion/hardDelete.js
import Ticket from "../model/ticket.js";
import Task from "../model/task.js";
import Comment from "../model/comments.js";
import UserCommentNotification from "../model/UserCommentNotification.js";
import EntityMembership from "../model/EntityMemberShip.js";

const CONFIG = {
  Ticket: { Model: Ticket, photo: true },
  Task: { Model: Task, photo: false },
};

// Runs INSIDE a transaction. Deletes DB rows and returns the Cloudinary URLs
// to remove AFTER commit. Pass docs with { _id } (and `photo` for tickets, if loaded).
export async function hardDeleteEntities(entityType, ids, session) {
  if (!ids.length) return { counts: { entities: 0, comments: 0, notifications: 0, memberships: 0 }, fileUrls: [] };
  const { Model } = CONFIG[entityType];
  const filter = { entityType, entityId: { $in: ids } };

  // read the files first, in the same session
  const comments = await Comment.find(filter, "attachments.fileUrl", { session }).lean();
  const fileUrls = comments.flatMap((c) => (c.attachments || []).map((a) => a.fileUrl));

  if (CONFIG[entityType].photo) {
    const withPhotos = await Model.find({ _id: { $in: ids } }, "photo.fileUrl", { session })
      .setOptions({ withDeleted: true }).lean();
    fileUrls.push(...withPhotos.map((t) => t.photo?.fileUrl));
  }

  const c = await Comment.deleteMany(filter, { session });
  const n = await UserCommentNotification.deleteMany(filter, { session });
  const m = await EntityMembership.deleteMany(filter, { session });
  const e = await Model.deleteMany({ _id: { $in: ids } }, { session });

  return {
    counts: { entities: e.deletedCount, comments: c.deletedCount, notifications: n.deletedCount, memberships: m.deletedCount },
    fileUrls: fileUrls.filter(Boolean),
  };
}

// Call AFTER the transaction commits. Never throws; returns the URLs that failed.
export async function deleteFilesBestEffort(fileUrls, deleteFromCloudinary, logger, ctx = {}) {
  const settled = await Promise.allSettled(fileUrls.map((u) => deleteFromCloudinary(u)));
  const failed = [];
  settled.forEach((r, i) => {
    if (r.status === "rejected") {
      failed.push(fileUrls[i]);
      logger.error("Failed to delete Cloudinary file", { fileUrl: fileUrls[i], ...ctx, error: r.reason?.message });
    }
  });
  return failed;
}