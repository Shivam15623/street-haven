import { useEffect } from "react";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import type { BadgeVariant } from "../../../../components/child/Badge";
import Badge from "../../../../components/child/Badge";
import Sheet from "../../../../components/child/Sheet";
import {
  useLazyGetTaskDetailsQuery,
  type TaskActivityTimelineItem,
  type TaskStatus,
} from "../../../../services/taskApi";
import DOMPurify from "dompurify";
interface Props {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  new: "info-soft",
  assigned: "warning-soft",
  under_review: "orange-soft",
  completed: "success-soft",
};

const statusLabel: Record<string, string> = {
  new: "New",
  assigned: "Assigned",
  under_review: "Under Review",
  completed: "Completed",
};

const activityIcon = (item: TaskActivityTimelineItem) =>
  item.action === "assignee_change"
    ? "mdi:account-arrow-right-outline"
    : "mdi:circle-medium";

const activityLabel = (item: TaskActivityTimelineItem) => {
  if (item.action === "assignee_change") {
    return item.fromValue
      ? `Reassigned from ${item.fromValue} to ${item.toValue}`
      : `Assigned to ${item.toValue}`;
  }
  return item.fromValue
    ? `Status changed from ${statusLabel[item.fromValue] ?? item.fromValue} to ${
        statusLabel[item.toValue as TaskStatus] ?? item.toValue
      }`
    : `Status set to ${statusLabel[item.toValue as TaskStatus] ?? item.toValue}`;
};

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
      <Icon icon={icon} width={16} className="text-street-dark" />
    </span>
    <div>
      <p className="text-xs text-street-dark mb-2">{label}</p>
      <p className="text-sm fw-medium text-neutral-900 mb-0">{value ?? "—"}</p>
    </div>
  </div>
);

const TaskDetailDrawer = ({ taskId, open, onClose }: Props) => {
  const [getTaskDetail, { data, isLoading, isError }] =
    useLazyGetTaskDetailsQuery();

  useEffect(() => {
    if (open && taskId) {
      getTaskDetail(taskId);
    }
  }, [open, taskId, getTaskDetail]);

  const task = data?.data?.task;
  const activity = data?.data?.activity ?? [];

  return (
    <Sheet
      show={open}
      onClose={onClose}
      title="Task Details"
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
            Failed to load task details.
          </p>
        </div>
      )}

      {task && (
        <div className="d-flex flex-column gap-24">
          {/* Header */}
          <div>
            <h5 className="text-lg fw-semibold text-neutral-900 mb-12">
              {task.title}
            </h5>
            <div className="d-flex flex-wrap gap-8">
              <Badge variant={statusVariant[task.status] ?? "secondary-soft"}>
                {statusLabel[task.status] ?? task.status}
              </Badge>
            </div>
          </div>

          {/* Key info grid */}
          <div className="border-1 border-sh-base-50 radius-12 p-16">
            <div className="row row-gap-2">
              <div className="col-6">
                <InfoRow
                  icon="mdi:calendar-outline"
                  label="Created"
                  value={dayjs(task.createdAt).format("DD MMM YYYY, h:mm A")}
                />
              </div>
              <div className="col-6">
                <InfoRow
                  icon="mdi:calendar-clock-outline"
                  label="Due Date"
                  value={
                    task.dueDate
                      ? dayjs(task.dueDate).format("DD MMM YYYY")
                      : "No due date"
                  }
                />
              </div>
              <div className="col-6">
                <InfoRow
                  icon="mdi:update"
                  label="Last Updated"
                  value={dayjs(task.updatedAt).format("DD MMM YYYY, h:mm A")}
                />
              </div>
            </div>
          </div>

          {/* People */}
          <div>
            <h6 className="text-xs fw-semibold text-street-dark text-uppercase mb-12">
              People
            </h6>
            <div className="d-flex flex-column row-gap-2">
              {task.assignedBy && (
                <InfoRow
                  icon="mdi:account-outline"
                  label="Assigned by"
                  value={`${task.assignedBy.firstname} ${task.assignedBy.lastname} · ${task.assignedBy.email}`}
                />
              )}
              {task.assignedTo ? (
                <InfoRow
                  icon="mdi:account-arrow-right-outline"
                  label="Assigned to"
                  value={`${task.assignedTo.firstname} ${task.assignedTo.lastname} · ${task.assignedTo.email}`}
                />
              ) : (
                <InfoRow
                  icon="mdi:account-arrow-right-outline"
                  label="Assigned to"
                  value="Unassigned"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h6 className="text-xs fw-semibold text-street-dark text-uppercase mb-8">
              Description
            </h6>
            <div
              className="prose Te text-street-base"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(task.description),
              }}
            />
          </div>

          {/* Activity */}
          {activity.length > 0 && (
            <div>
              <h6 className="text-xs fw-semibold text-street-dark text-uppercase mb-12">
                Activity
              </h6>
              <div className="d-flex flex-column">
                {activity
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime(),
                  )
                  .map((item, index, arr) => (
                    <div key={item._id} className="d-flex gap-12">
                      <div className="d-flex flex-column align-items-center">
                        <span className="d-flex align-items-center justify-content-center radius-circle bg-primary-50 w-24-px h-24-px flex-shrink-0">
                          <Icon
                            icon={activityIcon(item)}
                            width={14}
                            className="text-primary-600"
                          />
                        </span>
                        {index < arr.length - 1 && (
                          <span
                            className="bg-neutral-200"
                            style={{ width: 2, flexGrow: 1, minHeight: 20 }}
                          />
                        )}
                      </div>
                      <div className="pb-16">
                        <p className="text-sm fw-medium text-neutral-900 mb-2">
                          {activityLabel(item)}
                        </p>
                        <p className="text-xs text-street-dark mb-0">
                          {item.userId?.firstname
                            ? `${item.userId.firstname} ${item.userId.lastname}`.trim()
                            : "System"}{" "}
                          ·{" "}
                          {dayjs(item.createdAt).format("DD MMM YYYY, h:mm A")}
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

export default TaskDetailDrawer;
