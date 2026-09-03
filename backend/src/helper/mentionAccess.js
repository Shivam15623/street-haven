import User from "../model/user.js";
import Location from "../model/location.js";

/**
 * The single source of truth for "who is allowed in this Task's chat":
 * assignee, assigner, the assignee's supervisor, and every active
 * super_admin. Used for THREE things that must never drift apart:
 *   1. deciding who shows up in the @mention dropdown
 *   2. deciding whether the current user is even allowed to comment
 *   3. re-validating mention ids the client claims it inserted
 *
 * @param {object} task - a Task doc/lean-object with `assignedTo` populated
 *   (needs assignedTo._id and assignedTo.superviserId) and `assignedBy`.
 * @returns {Promise<Set<string>>}
 */
export const getTaskAccessUserIds = async (task) => {
  const ids = new Set();
  const addId = (id) => id && ids.add(id.toString());

  addId(task.assignedTo?._id ?? task.assignedTo);
  addId(task.assignedBy);
  addId(task.assignedTo?.superviserId);

  const superAdmins = await User.find({ role: "super_admin", status: "active" })
    .select("_id")
    .lean();
  superAdmins.forEach(({ _id }) => addId(_id));

  return ids;
};

/**
 * Same idea for Tickets: creator, current assignee, approver, whoever made
 * the latest reassignment, that location's managers + facility manager,
 * and every active super_admin.
 *
 * @param {object} ticket - a Ticket doc/lean-object with `location`,
 *   `createdBy`, `assignedTo`, `approvedBy`, `assignmentHistory`.
 * @returns {Promise<Set<string>>}
 */
export const getTicketAccessUserIds = async (ticket) => {
  const ids = new Set();
  const addId = (id) => id && ids.add(id.toString());

  addId(ticket.createdBy);
  addId(ticket.assignedTo);
  addId(ticket.approvedBy);

  const latestAssignment = ticket.assignmentHistory?.length
    ? ticket.assignmentHistory[ticket.assignmentHistory.length - 1]
    : null;
  addId(latestAssignment?.assignedBy);

  if (ticket.location) {
    const location = await Location.findById(ticket.location)
      .select("managers facilityManager")
      .lean();
    location?.managers?.forEach(addId);
    addId(location?.facilityManager);
  }

  const superAdmins = await User.find({ role: "super_admin", status: "active" })
    .select("_id")
    .lean();
  superAdmins.forEach(({ _id }) => addId(_id));

  return ids;
};

/**
 * Given the entityType/entity doc, returns the access Set — dispatches to
 * whichever of the two above applies. Callers that already have the entity
 * loaded (comment creation) should pass it straight in rather than
 * re-querying by slug.
 */
export const getEntityAccessUserIds = async (entityType, entity) => {
  if (entityType === "Task") return getTaskAccessUserIds(entity);
  if (entityType === "Ticket") return getTicketAccessUserIds(entity);
  throw new Error(`Unknown entityType: ${entityType}`);
};