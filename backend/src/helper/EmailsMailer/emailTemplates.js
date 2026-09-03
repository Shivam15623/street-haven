export const generateEmailTemplate = ({ type, data }) => {
  switch (type) {
    case "verification":
      return {
        subject: "Verify Your Email",
        html: `
          <h2>Verify Your Email</h2>
          <p>Click below to verify:</p>
          <a href="${data.link}" style="background:#007bff; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Verify</a>
          <p>Expires in 1 hour.</p>
        `,
      };

    case "reset":
      return {
        subject: "Reset Your Password",
        html: `
          <h2>Reset Your Password</h2>
          <p>Click below to reset:</p>
          <a href="${data.link}" style="background:#007bff; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Reset</a>
          <p>Expires in 1 hour.</p>
        `,
      };

    case "user_added":
      return {
        subject: "Your Account Has Been Created",
        html: `
      <h2>Welcome to the Platform</h2>

      <p>Hello ${data.userName},</p>

      <p>
        An account has been created for you. You can use the following
        credentials to log in.
      </p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;">
            <strong>Name</strong>
          </td>
          <td>${data.userName}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>Email</strong>
          </td>
          <td>${data.email}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>Temporary Password</strong>
          </td>
          <td>${data.password}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>Role</strong>
          </td>
          <td>${data.role}</td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        <a
          href="${data.link}"
          style="
            background:#2563eb;
            color:#fff;
            padding:12px 18px;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Log In
        </a>
      </p>

      <p>
        For security reasons, we recommend changing your password after your
        first login.
      </p>
    `,
      };
    case "ticket_pending_manager":
      return {
        subject: `New Ticket Pending Approval - ${data.ticketTitle}`,
        html: `
      <h2>New Ticket Pending Approval</h2>

      <p>Hello ${data.managerName},</p>

      <p>
        A new maintenance ticket has been submitted for a location you manage and is awaiting your review.
      </p>

      <table style="border-collapse: collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>Ticket</strong></td>
          <td>${data.ticketTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Category</strong></td>
          <td>${data.category}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Submitted By</strong></td>
          <td>${data.createdBy}</td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        <a
          href="${data.link}"
          style="background:#2563eb;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;"
        >
          Review Ticket
        </a>
      </p>

      <p>Please review this ticket and approve or reject it at your earliest convenience.</p>
    `,
      };
    case "ticket_approved":
      return {
        subject: `Ticket Approved - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Approved</h2>

      <p>Hello ${data.recipientName},</p>

      <p>The following ticket has been approved.</p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>Ticket</strong></td>
          <td>${data.ticketTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Category</strong></td>
          <td>${data.category}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Approved By</strong></td>
          <td>${data.approvedBy}</td>
        </tr>
      </table>

      <p>The ticket will now move to the next stage.</p>

      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#16a34a;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Ticket
        </a>
      </p>
    `,
      };
    case "ticket_in_progress":
      return {
        subject: `Work Started - ${data.ticketTitle}`,
        html: `
      <h2>Ticket In Progress</h2>

      <p>Hello ${data.recipientName},</p>

      <p>Work has started on the following maintenance request.</p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>Ticket</strong></td>
          <td>${data.ticketTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Category</strong></td>
          <td>${data.category}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Assigned To</strong></td>
          <td>${data.assignedTo}</td>
        </tr>
      </table>

      <p>Your request is currently being worked on.</p>

      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#ea580c;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          Track Ticket
        </a>
      </p>
    `,
      };
    case "ticket_completed":
      return {
        subject: `Ticket Completed - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Completed</h2>

      <p>Hello ${data.recipientName},</p>

      <p>The following maintenance request has been completed.</p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>Ticket</strong></td>
          <td>${data.ticketTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Category</strong></td>
          <td>${data.category}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;"><strong>Completed On</strong></td>
          <td>${data.completedAt}</td>
        </tr>
      </table>

      <p>The maintenance work has been marked as completed.</p>

      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#0f766e;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Ticket
        </a>
      </p>
    `,
      };
    case "ticket_rejected":
      return {
        subject: `Ticket Rejected - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Rejected</h2>
      <p>Hello ${data.recipientName},</p>
      <p>Unfortunately, the following ticket was not approved.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px;"><strong>Ticket</strong></td><td>${data.ticketTitle}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Category</strong></td><td>${data.category}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Location</strong></td><td>${data.location}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Rejected By</strong></td><td>${data.rejectedBy}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Reason</strong></td><td>${data.rejectionReason}</td></tr>
      </table>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#dc2626;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Ticket
        </a>
      </p>
    `,
      };

    case "ticket_assigned":
      return {
        subject: `New Ticket Assigned - ${data.ticketTitle}`,
        html: `
      <h2>New Ticket Assigned to You</h2>
      <p>Hello ${data.recipientName},</p>
      <p>A ticket has been approved and assigned to you for work.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px;"><strong>Ticket</strong></td><td>${data.ticketTitle}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Category</strong></td><td>${data.category}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Location</strong></td><td>${data.location}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Priority</strong></td><td>${data.priority}</td></tr>
      </table>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          Start Work
        </a>
      </p>
    `,
      };

    case "ticket_cancelled":
      return {
        subject: `Ticket Cancelled - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Cancelled</h2>
      <p>Hello ${data.recipientName},</p>
      <p>The following ticket was cancelled by its creator before approval.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px;"><strong>Ticket</strong></td><td>${data.ticketTitle}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Location</strong></td><td>${data.location}</td></tr>
      </table>
    `,
      };

    case "ticket_rerouted_old_manager":
      return {
        subject: `Ticket No Longer Assigned to You - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Rerouted</h2>

      <p>Hello ${data.managerName},</p>

      <p>
        The following ticket has been moved to a different location and
        is no longer awaiting approval from you.
      </p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;">
            <strong>Ticket</strong>
          </td>
          <td>${data.ticketTitle}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>Previous Location</strong>
          </td>
          <td>${data.oldLocation}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>New Location</strong>
          </td>
          <td>${data.newLocation}</td>
        </tr>

        <tr>
          <td style="padding:6px 12px;">
            <strong>Submitted By</strong>
          </td>
          <td>${data.createdBy}</td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        This ticket is no longer pending approval from you.
      </p>

      
    `,
      };
    case "task_assigned":
      return {
        subject: `New Task Assigned - ${data.taskTitle}`,
        html: `
      <h2>New Task Assigned to You</h2>
      <p>Hello ${data.recipientName},</p>
      <p>You have been assigned a new task by ${data.assignedByName}.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px;"><strong>Task</strong></td><td>${data.taskTitle}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Due Date</strong></td><td>${data.dueDate || "Not set"}</td></tr>
      </table>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };

    case "task_reassigned":
      return {
        subject: `Task Reassigned - ${data.taskTitle}`,
        html: `
      <h2>Task Reassigned</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" has been reassigned${data.stillAssignee ? " to you" : " to another volunteer"}.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };

    case "task_submitted_for_review":
      return {
        subject: `Task Submitted for Review - ${data.taskTitle}`,
        html: `
      <h2>Task Submitted for Review</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" was submitted for review by ${data.submittedByName}.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#0f766e;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          Review Task
        </a>
      </p>
    `,
      };

    case "task_approved":
      return {
        subject: `Task Approved - ${data.taskTitle}`,
        html: `
      <h2>Task Approved</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" has been approved and marked complete.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#16a34a;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };

    case "task_sent_back":
      return {
        subject: `Task Requires Changes - ${data.taskTitle}`,
        html: `
      <h2>Task Sent Back</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" was sent back for changes.</p>
      ${data.remark ? `<p><strong>Reason:</strong> ${data.remark}</p>` : ""}
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#d97706;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };

    case "task_due_date_changed":
      return {
        subject: `Due Date Updated - ${data.taskTitle}`,
        html: `
      <h2>Due Date Updated</h2>
      <p>Hello ${data.recipientName},</p>
      <p>The due date for "${data.taskTitle}" changed from ${data.oldDate} to ${data.newDate}.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#d97706;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };
    case "task_status_changed":
      return {
        subject: `Task Status Changed - ${data.taskTitle}`,
        html: `
      <h2>Task Status Changed</h2>

      <p>Hello ${data.recipientName},</p>

      <p>
        The status of <strong>"${data.taskTitle}"</strong> has changed
        from <strong>${data.oldStatus}</strong> to
        <strong>${data.newStatus}</strong>.
      </p>

      <p style="margin-top:24px;">
        <a
          href="${data.link}"
          style="
            background:#2563eb;
            color:#fff;
            padding:12px 18px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          View Task
        </a>
      </p>
    `,
      };
    case "task_cancelled":
      return {
        subject: `Task Cancelled - ${data.taskTitle}`,
        html: `
      <h2>Task Cancelled</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" has been cancelled.</p>
    `,
      };

    case "task_due_tomorrow":
      return {
        subject: `Task Due Tomorrow - ${data.taskTitle}`,
        html: `
      <h2>Task Due Tomorrow</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" is due tomorrow.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#d97706;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };

    case "task_overdue":
      return {
        subject: `Task Overdue - ${data.taskTitle}`,
        html: `
      <h2>Task Overdue</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" is overdue.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#dc2626;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };
    case "task_updated":
      return {
        subject: `Task Updated - ${data.taskTitle}`,
        html: `
      <h2>Task Updated</h2>
      <p>Hello ${data.recipientName},</p>
      <p>"${data.taskTitle}" details have been updated.</p>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Task
        </a>
      </p>
    `,
      };
    case "ticket_reopened":
      return {
        subject: `Ticket Reopened - ${data.ticketTitle}`,
        html: `
      <h2>Ticket Reopened</h2>
      <p>Hello ${data.recipientName},</p>
      <p>The following ticket has been reopened by ${data.reopenedBy}.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px;"><strong>Ticket</strong></td><td>${data.ticketTitle}</td></tr>
        <tr><td style="padding:6px 12px;"><strong>Category</strong></td><td>${data.category}</td></tr>
        ${data.reason ? `<tr><td style="padding:6px 12px;"><strong>Reason</strong></td><td>${data.reason}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">
          View Ticket
        </a>
      </p>
    `,
      };
    case "comment_mention":
      return {
        subject: `${data.mentionedByName} mentioned you in ${data.entityLabel}`,
        html: `
      <h2>You Were Mentioned</h2>

      <p>Hello ${data.recipientName},</p>

      <p>
        <strong>${data.mentionedByName}</strong> mentioned you in a comment
        on the following ${data.entityLabel}.
      </p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>${data.entityLabel}</strong></td>
          <td>${data.entityTitle}</td>
        </tr>
        ${
          data.location
            ? `
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>`
            : ""
        }
      </table>

      <div style="margin:20px 0; padding:14px 18px; background:#f8f5ff; border-left:4px solid #7c3aed; border-radius:4px;">
        <p style="margin:0; color:#4b5563; font-style:italic;">
          "${data.commentSnippet}"
        </p>
      </div>

      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#7c3aed;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block;">
          View Comment
        </a>
      </p>
    `,
      };

    case "comment_reply":
      return {
        subject: `${data.repliedByName} replied to your comment in ${data.entityLabel}`,
        html: `
      <h2>New Reply</h2>

      <p>Hello ${data.recipientName},</p>

      <p>
        <strong>${data.repliedByName}</strong> replied to your comment on the
        following ${data.entityLabel}.
      </p>

      <table style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;"><strong>${data.entityLabel}</strong></td>
          <td>${data.entityTitle}</td>
        </tr>
        ${
          data.location
            ? `
        <tr>
          <td style="padding:6px 12px;"><strong>Location</strong></td>
          <td>${data.location}</td>
        </tr>`
            : ""
        }
      </table>

      <div style="margin:20px 0; padding:14px 18px; background:#eff6ff; border-left:4px solid #2563eb; border-radius:4px;">
        <p style="margin:0; color:#4b5563; font-style:italic;">
          "${data.commentSnippet}"
        </p>
      </div>

      <p style="margin-top:24px;">
        <a href="${data.link}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block;">
          View Reply
        </a>
      </p>
    `,
      };
    default:
      throw new Error("Invalid email type");
  }
};
