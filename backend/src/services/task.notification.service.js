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

    const superAdminRecipients = await getSuperAdminRecipients(
      task.assignedBy,
      session,
    );
    await notify({
      action: "assigned",
      severity: "info",
      title: "Task Assigned",
      message: `"${task.title}" was assigned to ${assignee.firstname} ${assignee.lastname} by ${user.firstname} ${user.lastname}.`,
      recipients: superAdminRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: superAdminRecipients.map((r) => r.userId),
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

    const superAdminRecipients = await getSuperAdminRecipients(
      task.assignedBy,
      session,
    );
    
    await notify({
      action: "assigned",
      severity: "info",
      title: "Task Reassigned",
      message: `"${task.title}" was reassigned.`,
      recipients: superAdminRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: superAdminRecipients.map((r) => r.userId),
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

    const superAdminRecipients = await getSuperAdminRecipients(
      task.assignedTo,
      session,
    );// Don't notify the assignee again as a super admin
const filteredSuperAdminRecipients = superAdminRecipients.filter(
  (r) => r.userId.toString() !== task.assignedTo?.toString()
);
    await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Submitted for Review",
      message: `"${task.title}" was submitted for review.`,
      recipients: filteredSuperAdminRecipients,
      createdBy: task.assignedTo,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: filteredSuperAdminRecipients.map((r) => r.userId),
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

    const superAdminRecipients = await getSuperAdminRecipients(
      adminId,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "success",
      title: "Task Completed",
      message: `"${task.title}" has been approved and marked complete.`,
      recipients: superAdminRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: superAdminRecipients.map((r) => r.userId),
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

    const superAdminRecipients = await getSuperAdminRecipients(
      adminId,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Sent Back",
      message,
      recipients: superAdminRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: { taskId: task.slug },
      session,
      effects,
      email: {
        userIds: superAdminRecipients.map((r) => r.userId),
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

  async dueDateChanged(task, oldDate, newDate, session, effects = []) {
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
    return { notification, effects };
  },

  async detailsUpdated(task, session, effects = []) {
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
