// helper/membership.js
import mongoose from "mongoose";
import EntityMembership from "../model/EntityMemberShip.js";

/**
 * Idempotent — only creates rows that don't exist yet (upsert with
 * $setOnInsert). Never touches lastSeenCommentId/removedAt of existing
 * members. Safe to call repeatedly at every stage of a ticket's lifecycle.
 */
export async function ensureMembership(entityType, entityId, userIds, session) {
  const ids = [...new Set(
    userIds.filter(Boolean).map((id) => id.toString())
  )];
  if (!ids.length) return;

  const ops = ids.map((userId) => ({
    updateOne: {
      filter: { entityType, entityId, userId: new mongoose.Types.ObjectId(userId) },
      update: { $setOnInsert: { joinedAt: new Date() } },
      upsert: true,
    },
  }));

  await EntityMembership.bulkWrite(ops, { ordered: false, session });
}

/**
 * The inverse — revoke access. Only ever sets removedAt, never deletes,
 * so historical notifications/audit trail stay intact (case #29).
 */
export async function revokeMembership(entityType, entityId, userIds, session) {
  const ids = userIds.filter(Boolean).map((id) => id.toString());
  if (!ids.length) return;

  await EntityMembership.updateMany(
    { entityType, entityId, userId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
    { $set: { removedAt: new Date() } },
    { session }
  );
}