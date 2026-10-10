import EntityMembership from "../model/EntityMemberShip.js";
import Location from "../model/location.js";
import { TICKET_STATUS } from "../model/ticket.js";


const ENTITY_RECIPIENT_FIELDS = {
  Ticket: {
    // ticket fields that map 1:1 to a permanent member, once populated
    single: ["createdBy", "assignedTo", "approvedBy"],
  },
  Task: {
    single: ["assignedTo", "assignedBy"],
  },
};

// ---- Ticket-specific: who should be a member RIGHT NOW, given ticket state ----
async function computeTicketMemberIds(ticket, session) {
  const ids = new Set();

  ENTITY_RECIPIENT_FIELDS.Ticket.single.forEach((field) => {
    const v = ticket[field];
    if (v) ids.add(v.toString());
  });


  // Location managers: only while still OPEN (pool of possible approvers).
  // Once approved/rejected, they fall out and get removedAt set.
  if (ticket.status === TICKET_STATUS.OPEN) {
    const location = await Location.findById(ticket.location)
      .select("managers")
      .session(session);
    location?.managers.forEach((m) => ids.add(m.toString()));
  }

  return [...ids];
}

// ---- Generic: reconcile EntityMembership rows against a target member set ----
async function syncEntityMembership({
  entityType,
  entityId,
  targetUserIds,
  session,
}) {
  const targetSet = new Set(targetUserIds.map(String));

  const existing = await EntityMembership.find({ entityType, entityId }).session(
    session,
  );
  const existingByUser = new Map(existing.map((m) => [m.userId.toString(), m]));

  const ops = [];

  // Add or re-activate members who should now be in.
  for (const userId of targetSet) {
    const row = existingByUser.get(userId);
    if (!row) {
      ops.push({
        insertOne: {
          document: { entityType, entityId, userId, joinedAt: new Date() },
        },
      });
    } else if (row.removedAt) {
      ops.push({
        updateOne: {
          filter: { _id: row._id },
          update: { $set: { removedAt: null } },
        },
      });
    }
  }

  // Soft-remove members who fell off the target set (e.g. old assignee,
  // non-approving managers once approved).
  for (const row of existing) {
    const userId = row.userId.toString();
    if (!targetSet.has(userId) && !row.removedAt) {
      ops.push({
        updateOne: {
          filter: { _id: row._id },
          update: { $set: { removedAt: new Date() } },
        },
      });
    }
  }

  if (ops.length) {
    await EntityMembership.bulkWrite(ops, { session });
  }
}

// ---- Convenience wrapper to call after any ticket mutation ----
export async function resyncTicketMembership(ticket, session) {
  const memberIds = await computeTicketMemberIds(ticket, session);
  await syncEntityMembership({
    entityType: "Ticket",
    entityId: ticket._id,
    targetUserIds: memberIds,
    session,
  });
}
// ---- Task-specific: who should be a member RIGHT NOW, given task state ----
function computeTaskMemberIds(task) {
  const ids = new Set();

  ENTITY_RECIPIENT_FIELDS.Task.single.forEach((field) => {
    const v = task[field];
    if (v) ids.add(v.toString());
  });

  return [...ids];
}

// ---- Convenience wrapper to call after any task mutation ----
export async function resyncTaskMembership(task, session) {
  const memberIds = computeTaskMemberIds(task);
  await syncEntityMembership({
    entityType: "Task",
    entityId: task._id,
    targetUserIds: memberIds,
    session,
  });
}