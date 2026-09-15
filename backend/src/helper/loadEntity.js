import Task from "../model/task";
import Ticket from "../model/ticket";


/**
 * Loads the entity (Ticket or Task) once, with exactly the fields needed for:
 *   1. access-control checks (getEntityAccessUserIds)
 *   2. comment notification enrichment (normalizeCommentEntity)
 *
 * This is the ONLY place the entity is fetched for the comment flow —
 * fanOutComment() must reuse this object rather than re-querying.
 */
export async function loadEntityForAccessCheck(entityType, entityId) {
  if (entityType === "Ticket") {
    return Ticket.findById(entityId).select(
      [
        "_id",
        "ticketNumber",
        "slug",
        "req_title",
        "createdBy",
        "assignedTo",
        "approvedBy",
        "status",
      ].join(" "),
    );
  }

  if (entityType === "Task") {
    return Task.findById(entityId).select(
      [
        "_id",
        "taskNumber",
        "slug",
        "title",
        "assignedTo",
        "assignedBy",
        "status",
      ].join(" "),
    );
  }

  throw new Error(`Unsupported entityType: ${entityType}`);
}