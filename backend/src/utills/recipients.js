// recipients.js
//
// Resolves the set of userIds who are candidates for a comment
// notification on a given entity. The actor is always excluded here
// (single source of truth for "don't notify yourself").
//
// Field mapping is table-driven so adding a third commentable entity
// later is a config change, not a new if/else branch.

import Comment from "../model/comments.js";


// import User from "../model/user.js"; // uncomment when wiring admins in

const ENTITY_RECIPIENT_FIELDS = {
  Ticket: {
    single: ["createdBy", "assignedTo", "approvedBy"],
  },
  Task: {
    single: ["assignedTo", "assignedBy"],
  },
};

/**
 * @param {"Ticket"|"Task"} entityType
 * @param {object} entity - full mongoose doc (not lean-only id)
 * @param {string|ObjectId} actorId
 * @returns {Promise<Array<{userId: string}>>}
 */
export async function resolveRecipients(entityType, entity, actorId) {
  const ids = new Set();

  const config = ENTITY_RECIPIENT_FIELDS[entityType];
  if (!config) {
    throw new Error(`No recipient config defined for entityType "${entityType}"`);
  }

  for (const field of config.single) {
    const value = entity[field];
    if (value) ids.add(String(value));
  }

  // Previous participants/commenters on this exact entity
  const pastCommenters = await Comment.distinct("userId", {
    entityType,
    entityId: entity._id,
  });
  pastCommenters.forEach((id) => ids.add(String(id)));

  // Admins / super_admins — wire this up to however your permission
  // system actually works. Left commented out since you said "don't
  // automatically notify everyone unless there is a clear reason" —
  // uncomment once you've decided admins genuinely need every comment.
  //
  // const admins = await User.find(
  //   { role: { $in: ["admin", "super_admin"] } },
  //   "_id",
  // );
  // admins.forEach((a) => ids.add(String(a._id)));

  ids.delete(String(actorId));

  return [...ids].map((userId) => ({ userId }));
}