import User from "../model/user.js";
import { createNotification } from "../helper/CreateNotoification.js";
import { notifyTaskEmail } from "../helper/notifyTaskEmail.js";
import { io } from "../index.js";

/**
 * Emits a socket event to each recipient. Never throws — a disconnected
 * client or socket error must never bubble up and affect anything else.
 */
export const emitSocketNotification = (recipients, notification) => {
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
 * Fetch all super_admin ids, excluding whoever triggered the event.
 * Kept for backwards compatibility / direct use, but most call sites below
 * now use `getManagementRecipients`, which also folds in the volunteer's
 * direct manager (superviserId).
 */
export const getSuperAdminRecipients = async (excludeUserId, session) => {
  const superAdmins = await User.find({ role: "super_admin" })
    .select("_id")
    .session(session);

  return superAdmins
    .map((u) => u._id.toString())
    .filter((id) => id !== excludeUserId?.toString())
    .map((id) => ({ userId: id }));
};

/**
 * Returns the "oversight" recipients for one or more volunteers: every
 * super_admin PLUS each volunteer's direct manager (User.superviserId),
 * deduped, with the acting user(s) removed.
 *
 * Why this exists: a volunteer_admin only manages a subset of volunteers,
 * while a super_admin manages everyone. Whichever of the two DIDN'T
 * perform the action still needs visibility into it — e.g. if a
 * super_admin reassigns/approves/cancels a task, the volunteer_admin who
 * actually manages that volunteer was previously never told.
 *
 * @param {string|string[]} volunteerIds - assignedTo (and, for reassignment,
 *   the previous assignedTo) whose manager(s) should be notified.
 * @param {string|string[]} excludeUserIds - the actor(s) to skip (they
 *   already know, or are getting their own primary notification elsewhere).
 */
export const getManagementRecipients = async (
  volunteerIds,
  excludeUserIds,
  session,
) => {
  const ids = (Array.isArray(volunteerIds) ? volunteerIds : [volunteerIds])
    .filter(Boolean)
    .map((id) => id.toString());

  const excludeSet = new Set(
    (Array.isArray(excludeUserIds) ? excludeUserIds : [excludeUserIds])
      .filter(Boolean)
      .map((id) => id.toString()),
  );

  const [volunteers, superAdmins] = await Promise.all([
    ids.length
      ? User.find({ _id: { $in: ids } })
          .select("superviserId")
          .session(session)
      : Promise.resolve([]),
    User.find({ role: "super_admin" }).select("_id").session(session),
  ]);

  const recipientIds = new Set();
  volunteers.forEach((v) => {
    if (v.superviserId) recipientIds.add(v.superviserId.toString());
  });
  superAdmins.forEach((u) => recipientIds.add(u._id.toString()));

  excludeSet.forEach((id) => recipientIds.delete(id));

  return Array.from(recipientIds).map((id) => ({ userId: id }));
};

const CATEGORY = "task";

/**
 * Creates the DB notification (part of the caller's transaction — this is
 * correct, it should roll back with the task if the task write fails).
 *
 * Crucially, it does NOT emit the socket event or send the email here.
 * Instead it pushes both onto `effects`, an array the caller owns. Nothing
 * in this function can throw because of a down email/socket service, so it
 * can never cause an unrelated transaction to abort.
 */
const notify = async ({
  action,
  severity = "info",
  title,
  message,
  recipients,
  createdBy,
  link,
  meta,
  session,
  effects,
  email, // optional: { userIds, templateType, dataBuilder }
}) => {
  if (!recipients?.length) return null;

  const notification = await createNotification(
    {
      category: CATEGORY,
      action,
      severity,
      title,
      message,
      recipients,
      createdBy,
      link,
      meta,
    },
    session,
  );

  if (effects) {
    effects.push({ type: "socket", recipients, notification });
    if (email?.userIds?.length) {
      effects.push({ type: "email", ...email });
    }
  }

  return notification;
};

export const TaskNotificationService = {
  async taskAssigned(task, user, session, effects = []) {
    const assignee = await User.findById(task.assignedTo)
      .select("firstname lastname")
      .session(session);

    const assigneeNotification = await notify({
      action: "assigned",
      severity: "info",
      title: "New Task Assigned",
      message: `You have been assigned "${task.title}" by ${user.firstname} ${user.lastname}.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_assigned",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          assignedByName: `${user.firstname} ${user.lastname}`,
          dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : null,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // Notify super_admins AND the volunteer's manager (superviserId) — not
    // just super_admins — so a volunteer_admin-managed assignment run by a
    // super_admin (or vice versa) still reaches the other oversight party.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      task.assignedBy,
      session,
    );
    await notify({
      action: "assigned",
      severity: "info",
      title: "Task Assigned",
      message: `"${task.title}" was assigned to ${assignee.firstname} ${assignee.lastname} by ${user.firstname} ${user.lastname}.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_assigned",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          assignedByName: `${user.firstname} ${user.lastname}`,
          dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : null,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification: assigneeNotification, effects };
  },
  async statusChanged(
    task,
    oldStatus,
    newStatus,
    changedBy,
    session,
    effects = [],
  ) {
    const notification = await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Status Changed",
      message: `"${task.title}" status changed from ${oldStatus} to ${newStatus} by ${changedBy.firstname} ${changedBy.lastname}.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: changedBy._id,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
        oldStatus,
        newStatus,
      },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_status_changed",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          oldStatus,
          newStatus,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // Previously this never told anyone but the volunteer. Now: the
    // volunteer's manager + super_admins also learn about status changes,
    // excluding whoever triggered the change and the volunteer themself.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [changedBy._id, task.assignedTo],
      session,
    );
    await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Status Changed",
      message: `"${task.title}" status changed from ${oldStatus} to ${newStatus} by ${changedBy.firstname} ${changedBy.lastname}.`,
      recipients: managementRecipients,
      createdBy: changedBy._id,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug, oldStatus, newStatus },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_status_changed",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          oldStatus,
          newStatus,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification, effects };
  },
  async taskReassigned(task, previousVolunteerId, session, effects = []) {
    if (previousVolunteerId?.toString() === task.assignedTo?.toString()) {
      return { effects };
    }

    if (previousVolunteerId) {
      await notify({
        action: "assigned",
        severity: "info",
        title: "Task Reassigned",
        message: `"${task.title}" has been reassigned to another volunteer.`,
        recipients: [{ userId: previousVolunteerId }],
        createdBy: task.assignedBy,
        link: `/tasks/${task.slug}`,
        meta: { taskId: task.slug },
        session,
        effects,
        email: {
          userIds: [previousVolunteerId],
          templateType: "task_reassigned",
          dataBuilder: (recipient) => ({
            recipientName: `${recipient.firstname} ${recipient.lastname}`,
            taskTitle: task.title,
            stillAssignee: false,
            link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
          }),
        },
      });
    }

    if (task.assignedTo) {
      await notify({
        action: "assigned",
        severity: "info",
        title: "New Task Assigned",
        message: `You have been assigned "${task.title}".`,
        recipients: [{ userId: task.assignedTo }],
        createdBy: task.assignedBy,
        link: `/tasks/${task.slug}`,
        meta: { taskId: task.slug },
        session,
        effects,
        email: {
          userIds: [task.assignedTo],
          templateType: "task_reassigned",
          dataBuilder: (recipient) => ({
            recipientName: `${recipient.firstname} ${recipient.lastname}`,
            taskTitle: task.title,
            stillAssignee: true,
            link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
          }),
        },
      });
    }

    // Both the OLD and NEW volunteer can have different managers
    // (volunteer_admins), and either notification may have been triggered
    // by a super_admin. Fold both volunteers' managers + all super_admins
    // into one deduped list so nobody with oversight is missed.
    const managementRecipients = await getManagementRecipients(
      [previousVolunteerId, task.assignedTo],
      task.assignedBy,
      session,
    );

    await notify({
      action: "assigned",
      severity: "info",
      title: "Task Reassigned",
      message: `"${task.title}" was reassigned.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_reassigned",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          stillAssignee: false,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { effects };
  },

  async submittedForReview(task, session, effects = []) {
    const assignerNotification = await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Submitted",
      message: `"${task.title}" has been submitted for review.`,
      recipients: [{ userId: task.assignedBy }],
      createdBy: task.assignedTo,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedBy],
        templateType: "task_submitted_for_review",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          submittedByName: "the assigned volunteer",
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // Exclude both the submitter (assignedTo) and whoever already got the
    // direct notification above (assignedBy) so we don't double-notify the
    // same person via the management channel.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [task.assignedTo, task.assignedBy],
      session,
    );
    await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Submitted for Review",
      message: `"${task.title}" was submitted for review.`,
      recipients: managementRecipients,
      createdBy: task.assignedTo,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_submitted_for_review",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          submittedByName: "the assigned volunteer",
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification: assignerNotification, effects };
  },

  async approved(task, adminId, session, effects = []) {
    const assigneeNotification = await notify({
      action: "status_changed",
      severity: "success",
      title: "Task Approved",
      message: `Your task "${task.title}" has been approved.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_approved",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      adminId,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "success",
      title: "Task Completed",
      message: `"${task.title}" has been approved and marked complete.`,
      recipients: managementRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_approved",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification: assigneeNotification, effects };
  },

  async sentBack(task, adminId, remark, session, effects = []) {
    const message = remark
      ? `"${task.title}" was sent back. Reason: ${remark}`
      : `"${task.title}" was sent back for changes.`;

    const assigneeNotification = await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Requires Changes",
      message,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_sent_back",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          remark,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      adminId,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Sent Back",
      message,
      recipients: managementRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_sent_back",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          remark,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification: assigneeNotification, effects };
  },

  // NOTE: added an optional trailing `changedBy` param (defaults to
  // task.assignedBy) purely so we know who to exclude from the management
  // notification. Existing callers that don't pass it still work exactly
  // as before, just with the assumption that the assigner made the change.
  async dueDateChanged(
    task,
    oldDate,
    newDate,
    session,
    effects = [],
    changedBy = task.assignedBy,
  ) {
    const notification = await notify({
      action: "updated",
      severity: "warning",
      title: "Due Date Updated",
      message: `Due date changed from ${oldDate.toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()}.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug, oldDate, newDate },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_due_date_changed",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          oldDate: oldDate.toLocaleDateString(),
          newDate: newDate.toLocaleDateString(),
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // Previously nobody but the volunteer heard about a due-date change.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [changedBy, task.assignedTo],
      session,
    );
    await notify({
      action: "updated",
      severity: "warning",
      title: "Task Due Date Updated",
      message: `Due date for "${task.title}" changed from ${oldDate.toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()}.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug, oldDate, newDate },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_due_date_changed",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          oldDate: oldDate.toLocaleDateString(),
          newDate: newDate.toLocaleDateString(),
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification, effects };
  },

  // Same pattern: optional trailing `updatedBy`, defaults to assignedBy.
  async detailsUpdated(
    task,
    session,
    effects = [],
    updatedBy = task.assignedBy,
  ) {
    const notification = await notify({
      action: "updated",
      severity: "info",
      title: "Task Updated",
      message: `"${task.title}" details have been updated.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_updated",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // Previously nobody but the volunteer heard about detail edits.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [updatedBy, task.assignedTo],
      session,
    );
    await notify({
      action: "updated",
      severity: "info",
      title: "Task Updated",
      message: `"${task.title}" details have been updated.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_updated",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification, effects };
  },

  async cancelled(task, adminId, session, effects = []) {
    const notification = await notify({
      action: "status_changed",
      severity: "error",
      title: "Task Cancelled",
      message: `"${task.title}" has been cancelled.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_cancelled",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
        }),
      },
    });

    // Previously nobody but the volunteer heard about a cancellation.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [adminId, task.assignedTo],
      session,
    );
    await notify({
      action: "status_changed",
      severity: "error",
      title: "Task Cancelled",
      message: `"${task.title}" has been cancelled.`,
      recipients: managementRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_cancelled",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
        }),
      },
    });

    return { notification, effects };
  },

  async dueTomorrow(task, session, effects = []) {
    const notification = await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Due Tomorrow",
      message: `"${task.title}" is due tomorrow.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo],
        templateType: "task_due_tomorrow",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // This is a system-triggered reminder (no human "actor"), so the only
    // exclusion is the volunteer themself, who already got the direct one.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      task.assignedTo,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Due Tomorrow",
      message: `"${task.title}" is due tomorrow.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_due_tomorrow",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification, effects };
  },

  async overdue(task, session, effects = []) {
    const notification = await notify({
      action: "status_changed",
      severity: "error",
      title: "Task Overdue",
      message: `"${task.title}" is overdue.`,
      recipients: [{ userId: task.assignedTo }, { userId: task.assignedBy }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: [task.assignedTo, task.assignedBy],
        templateType: "task_overdue",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    // assignedBy is who created/assigned the task, but that's not
    // necessarily the volunteer's CURRENT manager (e.g. after a
    // reassignment) and never included super_admins. Cover both.
    const managementRecipients = await getManagementRecipients(
      task.assignedTo,
      [task.assignedTo, task.assignedBy],
      session,
    );
    await notify({
      action: "status_changed",
      severity: "error",
      title: "Task Overdue",
      message: `"${task.title}" is overdue.`,
      recipients: managementRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: managementRecipients.map((r) => r.userId),
        templateType: "task_overdue",
        dataBuilder: (recipient) => ({
          recipientName: `${recipient.firstname} ${recipient.lastname}`,
          taskTitle: task.title,
          link: `${process.env.CLIENT_URL}/tasks/${task.slug}`,
        }),
      },
    });

    return { notification, effects };
  },
};

/**
 * Runs every queued side effect (socket emits + emails) ONCE the
 * transaction that created the notifications has committed.
 *
 * Each effect is isolated: one failing email will never block another
 * email, a socket emit, or (most importantly) the DB write that already
 * succeeded. Call this with `.catch()` or without `await` from the
 * controller so a slow email provider never delays the HTTP response.
 */
export const flushTaskEffects = async (effects = []) => {
  const results = await Promise.allSettled(
    effects.map((effect) => {
      if (effect.type === "socket") {
        emitSocketNotification(effect.recipients, effect.notification);
        return Promise.resolve();
      }
      if (effect.type === "email") {
        return notifyTaskEmail({
          userIds: effect.userIds,
          templateType: effect.templateType,
          dataBuilder: effect.dataBuilder,
        });
      }
      return Promise.resolve();
    }),
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `[notifications] side effect #${i} (${effects[i]?.type}) failed:`,
        r.reason,
      );
    }
  });
};
