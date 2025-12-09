import { io } from "../index.js";
import ActivityLog from "../model/ActivityLog.js";

/**
 * Add a new activity log (system-driven or user-driven)
 *
 * @param {Object} param0
 * @param {String} param0.actionType - example: "FORM_CREATED", "LOGIN", "PDF_DOWNLOADED"
 * @param {Object} param0.performedBy - { id, name, type: "system" | "user" }
 * @param {String} param0.message - human readable message
 * @param {Object} param0.meta - optional metadata (recordId, moduleName, oldValues, newValues etc.)
 * @param {Object} session - optional mongo session for transactions
 */
export const addActivityLog = async (
  { actionType, performedBy, message, meta = {} },
  session = null
) => {
  const payload = {
    actionType,
    performedBy: {
      id: performedBy?.id || null,
      name: performedBy?.name || null,
      type: performedBy?.type || "system",
    },
    message,
    meta,
  };

  const created = await ActivityLog.create(
    [payload],
    session ? { session } : {}
  );
  io.emit("activity:new", {
    ...payload,
    createdAt: created[0].createdAt,
    _id: created[0]._id,
  });
  return created[0];
};
