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
    default:
      throw new Error("Invalid email type");
  }
};
