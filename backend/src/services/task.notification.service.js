import { io } from "../index.js";
import { createNotification } from "../helper/CreateNotoification.js";
import User from "../model/user.js";

const CATEGORY = "task";

const emitNotification = (recipients, notification) => {
  console.log("Emitting notification to recipients:", recipients, notification);
  for (const r of recipients) {
    io.to(`user_${r.userId.toString()}`).emit("newNotification", notification);
  }
};

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
}) => {
  if (!recipients?.length) return;

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

  emitNotification(recipients, notification);

  return notification;
};

/**
 * Fetch all super_admin ids, excluding whoever triggered the event
 * (so a super_admin performing the action doesn't notify themselves).
 */
const getSuperAdminRecipients = async (excludeUserId, session) => {
  const superAdmins = await User.find({ role: "super_admin" })
    .select("_id")
    .session(session);

  return superAdmins
    .map((u) => u._id.toString())
    .filter((id) => id !== excludeUserId?.toString())
    .map((id) => ({ userId: id }));
};

export const TaskNotificationService = {
  async taskAssigned(task, user, session) {
    const assigneeNotification = await notify({
      action: "assigned",
      severity: "info",
      title: "New Task Assigned",
      message: `You have been assigned "${task.title}" by ${user.firstName} ${user.lastName}.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    const superAdminRecipients = await getSuperAdminRecipients(
      task.assignedBy,
      session,
    );
    await notify({
      action: "assigned",
      severity: "info",
      title: "Task Assigned",
      message: `"${task.title}" was assigned to ${user.firstName} ${user.lastName} by ${user.firstName} ${user.lastName}.`,
      recipients: superAdminRecipients,
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    return assigneeNotification;
  },

  /**
   * Task reassigned
   */
  async taskReassigned(task, previousVolunteerId, session) {
    if (previousVolunteerId?.toString() !== task.assignedTo?.toString()) {
      if (previousVolunteerId) {
        await notify({
          action: "reassigned",
          severity: "info",
          title: "Task Reassigned",
          message: `"${task.title}" has been reassigned to another volunteer.`,
          recipients: [{ userId: previousVolunteerId }],
          createdBy: task.assignedBy,
          link: `/tasks/${task.slug}`,
          meta: {
            taskId: task.slug,
          },
          session,
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
          meta: {
            taskId: task.slug,
          },
          session,
        });
      }

      const superAdminRecipients = await getSuperAdminRecipients(
        task.assignedBy,
        session,
      );
      await notify({
        action: "reassigned",
        severity: "info",
        title: "Task Reassigned",
        message: `"${task.title}" was reassigned.`,
        recipients: superAdminRecipients,
        createdBy: task.assignedBy,
        link: `/tasks/${task.slug}`,
        meta: {
          taskId: task.slug,
        },
        session,
      });
    }
  },

  /**
   * Volunteer submits for review
   */
  async submittedForReview(task, session) {
    const assignerNotification = await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Submitted",
      message: `"${task.title}" has been submitted for review.`,
      recipients: [{ userId: task.assignedBy }],
      createdBy: task.assignedTo,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    const superAdminRecipients = await getSuperAdminRecipients(
      task.assignedTo,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "info",
      title: "Task Submitted for Review",
      message: `"${task.title}" was submitted for review.`,
      recipients: superAdminRecipients,
      createdBy: task.assignedTo,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    return assignerNotification;
  },

  /**
   * Admin approves task
   */
  async approved(task, adminId, session) {
    const assigneeNotification = await notify({
      action: "status_changed",
      severity: "success",
      title: "Task Approved",
      message: `Your task "${task.title}" has been approved.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
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
      meta: {
        taskId: task.slug,
      },
      session,
    });

    return assigneeNotification;
  },

  /**
   * Sent back for changes
   */
  async sentBack(task, adminId, remark, session) {
    const assigneeNotification = await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Requires Changes",
      message: remark
        ? `"${task.title}" was sent back. Reason: ${remark}`
        : `"${task.title}" was sent back for changes.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    const superAdminRecipients = await getSuperAdminRecipients(
      adminId,
      session,
    );
    await notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Sent Back",
      message: remark
        ? `"${task.title}" was sent back. Reason: ${remark}`
        : `"${task.title}" was sent back for changes.`,
      recipients: superAdminRecipients,
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });

    return assigneeNotification;
  },

  /**
   * Due date changed
   */
  async dueDateChanged(task, oldDate, newDate, session) {
    return notify({
      action: "updated",
      severity: "warning",
      title: "Due Date Updated",
      message: `Due date changed from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
        oldDate,
        newDate,
      },
      session,
    });
  },

  /**
   * Title / description updated
   */
  async detailsUpdated(task, session) {
    return notify({
      action: "updated",
      severity: "info",
      title: "Task Updated",
      message: `"${task.title}" details have been updated.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });
  },

  /**
   * Task cancelled
   */
  async cancelled(task, adminId, session) {
    return notify({
      action: "status_changed",
      severity: "error",
      title: "Task Cancelled",
      message: `"${task.title}" has been cancelled.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: adminId,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });
  },

  /**
   * Due tomorrow
   */
  async dueTomorrow(task, session) {
    return notify({
      action: "status_changed",
      severity: "warning",
      title: "Task Due Tomorrow",
      message: `"${task.title}" is due tomorrow.`,
      recipients: [{ userId: task.assignedTo }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });
  },

  /**
   * Overdue
   */
  async overdue(task, session) {
    return notify({
      action: "status_changed",
      severity: "error",
      title: "Task Overdue",
      message: `"${task.title}" is overdue.`,
      recipients: [{ userId: task.assignedTo }, { userId: task.assignedBy }],
      createdBy: task.assignedBy,
      link: `/tasks/${task.slug}`,
      meta: {
        taskId: task.slug,
      },
      session,
    });
  },
};
