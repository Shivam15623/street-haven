import User from "../model/user.js";

import { io } from "../index.js";
import { createNotification } from "../helper/CreateNotoification.js";

/**
 * Emits a socket event to each recipient. Never throws — mirrors the same
 * pattern used in TaskNotificationService so a disconnected client can
 * never affect the surrounding request.
 */
const emitSocketNotification = (recipients, notification) => {
  for (const r of recipients || []) {
    try {
      io.to(`user_${r.userId.toString()}`).emit(
        "newNotification",
        notification,
      );
    } catch (err) {
      console.error("[notifications] socket emit failed:", err);
    }
  }
};

/**
 * Who should hear about something happening to this employee: every
 * super_admin, plus their direct supervisor (superviserId) if they have
 * one — minus whoever performed the action.
 */
export const getOversightRecipients = async ({
  managerId,
  actorId,
  session,
}) => {
  const superAdmins = await User.find({ role: "super_admin" })
    .select("_id")
    .session(session);

  const ids = new Set(superAdmins.map((u) => u._id.toString()));
  if (managerId) ids.add(managerId.toString());
  if (actorId) ids.delete(actorId.toString());

  return Array.from(ids).map((id) => ({ userId: id }));
};

/**
 * Notify super_admins + the assigned supervisor when a new employee is
 * added. Pushes a "socket" effect the caller should flush (via
 * flushEmployeeEffects) only AFTER the surrounding transaction commits.
 */
export const notifyEmployeeAdded = async ({
  newUser,
  superviser,
  actorId,
  session,
  effects = [],
}) => {
  const recipients = await getOversightRecipients({
    managerId: newUser.superviserId,
    actorId,
    session,
  });
  if (!recipients.length) return { effects };

  const managedByText = superviser
    ? ` They will be managed by ${superviser.firstname} ${superviser.lastname}.`
    : "";

  const notification = await createNotification(
    {
      category: "hr_updates",
      action: "created",
      severity: "info",
      title: "New Employee Added",
      message: `${newUser.firstname} ${newUser.lastname} was added as a ${newUser.role}.${managedByText}`,
      link: `/users`,
      recipients,
      createdBy: actorId,
      meta: {
        userId: newUser._id,
        role: newUser.role,
        event: "employee_added",
      },
    },
    session,
  );

  effects.push({ type: "socket", recipients, notification });
  return { notification, effects };
};

/**
 * Notify super_admins + the employee's supervisor when their active/inactive
 * status changes (e.g. a volunteer leaving or being reactivated).
 */

export const notifyEmployeeStatusChanged = async ({
  user,
  oldStatus,
  newStatus,
  actorId,
  session,
  effects = [],
}) => {
  const recipients = await getOversightRecipients({
    managerId: user.superviserId,
    actorId,
    session,
  });
  if (!recipients.length) return { effects };

  const notification = await createNotification(
    {
      category: "system",
      action: "status_changed",
      severity: newStatus === "inactive" ? "warning" : "success",
      title: "Employee Status Changed",
      message: `${user.firstname} ${user.lastname}'s status changed from ${oldStatus} to ${newStatus}.`,
      link: `/users`,
      recipients,
      createdBy: actorId,
      meta: {
        userId: user._id,
        role: user.role,
        event: "employee_status_changed",
        oldStatus,
        newStatus,
      },
    },
    session,
  );

  effects.push({ type: "socket", recipients, notification });
  return { notification, effects };
};

/**
 * Call this with `.catch()` (or without await) from the controller, AFTER
 * the transaction commits, so a socket hiccup never delays the response or
 * rolls back a write that already succeeded.
 */
export const flushEmployeeEffects = async (effects = []) => {
  for (const effect of effects) {
    if (effect.type === "socket") {
      emitSocketNotification(effect.recipients, effect.notification);
    }
  }
};
