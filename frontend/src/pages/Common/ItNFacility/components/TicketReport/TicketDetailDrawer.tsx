import { useEffect } from "react";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import {
  useLazyGetTicketDetailQuery,
  type TimelineItem,
} from "../../../../../services/ticketApi";
import Sheet from "../../../../../components/child/Sheet";
import Badge, {
  type BadgeVariant,
} from "../../../../../components/child/Badge";
import DOMPurify from "dompurify";
interface Props {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  Open: "warning-soft",
  Approved: "info-soft",
  "In Progress": "orange-soft",
  Completed: "success-soft",
  Rejected: "danger-soft",
  Closed: "secondary-soft",
};

// const priorityVariant: Record<string, BadgeVariant> = {
//   High: "danger-soft",
//   Medium: "warning-soft",
//   Low: "success-soft",
// };

const timelineIcon = (item: TimelineItem) =>
  item.type === "assignment"
    ? "mdi:account-arrow-right-outline"
    : "mdi:circle-medium";

const timelineLabel = (item: TimelineItem) =>
  item.type === "assignment"
    ? `Assigned to ${item.assignedTo}`
    : `Status changed to ${item.status}`;

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="d-flex align-items-start gap-10">
    <span className="d-flex align-items-center justify-content-center radius-8 bg-neutral-50 w-32-px h-32-px flex-shrink-0">
      <Icon icon={icon} width={16} className="text-neutral-500" />
    </span>
    <div>
      <p className="text-xs text-neutral-500 mb-2">{label}</p>
      <p className="text-sm fw-medium text-neutral-900 mb-0">{value ?? "—"}</p>
    </div>
  </div>
);

const TicketDetailDrawer = ({ ticketId, open, onClose }: Props) => {
  const [getTicketDetail, { data, isLoading, isError }] =
    useLazyGetTicketDetailQuery();

  useEffect(() => {
    if (open && ticketId) {
      getTicketDetail({ id: ticketId });
    }
  }, [open, ticketId, getTicketDetail]);

  const ticket = data?.data;


  return (
    <Sheet
      show={open}
      onClose={onClose}
      title="Ticket Details"
      placement="end"
      size={700}
    >
      {isLoading && (
        <div className="d-flex align-items-center justify-content-center py-64">
          <div
            className="spinner-border spinner-border-sm text-primary-600"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="d-flex flex-column align-items-center text-center py-64 gap-8">
          <Icon
            icon="mdi:alert-circle-outline"
            width={32}
            className="text-danger-main"
          />
          <p className="text-sm text-danger-main mb-0">
            Failed to load ticket details.
          </p>
        </div>
      )}

      {ticket && (
        <div className="d-flex flex-column gap-24">
          {/* Header */}
          <div>
            <p className="text-xs text-neutral-500 mb-4">#{ticket.ticketId}</p>
            <h5 className="text-lg fw-semibold text-neutral-900 mb-12">
              {ticket.title}
            </h5>
            <div className="d-flex flex-wrap gap-8">
              <Badge variant={statusVariant[ticket.status] ?? "secondary-soft"}>
                {ticket.status}
              </Badge>

              {ticket.priority&&ticket.priority!=="-" && (
                <Badge
                  variant={
                    ticket.priority === "High"
                      ? "danger-soft"
                      : ticket.priority === "Medium"
                        ? "warning-soft"
                        : "success-soft"
                  }
                >
                  {ticket.priority}{" "}
                  {ticket.priorityLocked && (
                    <Icon icon="mdi:lock-outline" width={12} className="ms-4" />
                  )}
                </Badge>
              )}
            </div>
          </div>

          {/* Key info grid */}
          <div className="border border-neutral-200 radius-12 p-16">
            <div className="row row-gap-2">
              <div className="col-6">
                <InfoRow
                  icon="mdi:shape-outline"
                  label="Category"
                  value={ticket.category}
                />
              </div>
              <div className="col-6">
                <InfoRow
                  icon="mdi:map-marker-outline"
                  label="Location"
                  value={ticket.location}
                />
              </div>
              <div className="col-6">
                <InfoRow
                  icon="mdi:calendar-outline"
                  label="Submitted"
                  value={dayjs(ticket.createdAt).format("DD MMM YYYY, h:mm A")}
                />
              </div>
              <div className="col-6">
                <InfoRow
                  icon="mdi:timer-check-outline"
                  label="Turnaround"
                  value={
                    ticket.turnaround ??
                    (ticket.resolvedAt ? "—" : "In progress")
                  }
                />
              </div>
            </div>
          </div>

          {/* People */}
          <div>
            <h6 className="text-xs fw-semibold text-neutral-500 text-uppercase mb-12">
              People
            </h6>
            <div className="d-flex flex-column row-gap-2">
              {ticket.submittedBy && (
                <InfoRow
                  icon="mdi:account-outline"
                  label="Submitted by"
                  value={`${ticket.submittedBy.name} · ${ticket.submittedBy.email}`}
                />
              )}
              {ticket.assignedTo && (
                <InfoRow
                  icon="mdi:account-arrow-right-outline"
                  label="Assigned to"
                  value={`${ticket.assignedTo.name} · ${ticket.assignedTo.email}`}
                />
              )}
              {ticket.approvedBy && (
                <InfoRow
                  icon="mdi:account-check-outline"
                  label="Approved by"
                  value={`${ticket.approvedBy.name} · ${ticket.approvedBy.email}`}
                />
              )}
              {ticket.rejectedBy && (
                <InfoRow
                  icon="mdi:account-cancel-outline"
                  label="Rejected by"
                  value={`${ticket.rejectedBy.name} · ${ticket.rejectedBy.email}`}
                />
              )}
            </div>
          </div>

          {/* Rejection reason */}
          {ticket.rejectionReason && (
            <div className="d-flex align-items-start gap-8 bg-danger-focus radius-8 p-12">
              <Icon
                icon="mdi:alert-circle-outline"
                width={16}
                className="text-danger-main flex-shrink-0 mt-2-px"
              />
              <p className="text-xs text-danger-main mb-0">
                <span className="fw-semibold">Rejection reason: </span>
                {ticket.rejectionReason}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h6 className="text-xs fw-semibold text-neutral-500 text-uppercase mb-8">
              Description
            </h6>

            <div
              className="parse Te text-sm text-neutral-700 mb-0"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(ticket.description),
              }}
            />
          </div>

          {/* Attachment */}
          {ticket.photo && (
            <div>
              <h6 className="text-xs fw-semibold text-neutral-500 text-uppercase mb-8">
                Attachment
              </h6>
              <a
                href={ticket.photo.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center gap-8 border border-neutral-200 radius-8 px-12 py-8 text-sm fw-medium text-primary-600 hover-text-primary w-fit"
              >
                <Icon icon="mdi:paperclip" width={16} />
                View attachment
              </a>
            </div>
          )}

          {/* Latest comment */}
          {ticket.latestComment && (
            <div>
              <h6 className="text-xs fw-semibold text-neutral-500 text-uppercase mb-8">
                Latest Comment
              </h6>
              <div className="bg-neutral-50 radius-12 p-12">
                <p className="text-sm text-neutral-800 mb-8">
                  {ticket.latestComment.text}
                </p>
                <p className="text-xs text-neutral-500 mb-0">
                  {ticket.latestComment.author} ·{" "}
                  {dayjs(ticket.latestComment.createdAt).format(
                    "DD MMM YYYY, h:mm A",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          {ticket.timeline?.length > 0 && (
            <div>
              <h6 className="text-xs fw-semibold text-neutral-500 text-uppercase mb-12">
                Timeline
              </h6>
              <div className="d-flex flex-column">
                {ticket.timeline.map((item, index) => (
                  <div key={index} className="d-flex gap-12">
                    <div className="d-flex flex-column align-items-center">
                      <span className="d-flex align-items-center justify-content-center radius-circle bg-primary-50 w-24-px h-24-px flex-shrink-0">
                        <Icon
                          icon={timelineIcon(item)}
                          width={14}
                          className="text-primary-600"
                        />
                      </span>
                      {index < ticket.timeline.length - 1 && (
                        <span
                          className="bg-neutral-200"
                          style={{ width: 2, flexGrow: 1, minHeight: 20 }}
                        />
                      )}
                    </div>
                    <div className="pb-16">
                      <p className="text-sm fw-medium text-neutral-900 mb-2">
                        {timelineLabel(item)}
                      </p>
                      <p className="text-xs text-neutral-500 mb-0">
                        {item.by} ·{" "}
                        {dayjs(item.at).format("DD MMM YYYY, h:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
};

export default TicketDetailDrawer;
