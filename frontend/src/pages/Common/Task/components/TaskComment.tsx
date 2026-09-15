import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { Icon } from "@iconify/react";

import EntityChat from "../../../../components/Comments/EntityChat";
import {
  useAddTaskCommentMutation,
  useLazyViewTaskCommentsQuery,
  type ITask,
} from "../../../../services/taskApi";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
// ---- Presentational bits -----------------------------------------------

const InfoChip = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) => (
  <div className="d-flex align-items-center gap-2">
    <div
      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
      style={{ width: 32, height: 32, background: iconBg, color: iconColor }}
    >
      <Icon icon={icon} width={16} />
    </div>
    <div className="lh-sm">
      <div
        className="text-uppercase fw-bold text-street-base"
        style={{ fontSize: 10, letterSpacing: ".5px" }}
      >
        {label}
      </div>
      <div
        className="fw-semibold text-street-dark"
        style={{ fontSize: 13.5, maxWidth: 160 }}
      >
        {value}
      </div>
    </div>
  </div>
);

const TaskInfoCard = ({ task }: { task: ITask }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDescription = Boolean(
    task.description?.replace(/<[^>]*>/g, "").trim(),
  );

  return (
    <div className="m-3  shadow-sm rounded-3 bg-card border flex-shrink-0">
      {/* Info row */}
      <div className="overflow-hidden rounded-3">
        <div className="d-flex flex-wrap justify-content-between gap-3 p-3">
          <InfoChip
            icon="mdi:account-tie-outline"
            iconBg="#e7f1ff"
            iconColor="#0d6efd"
            label="Assigned By"
            value={`${task.assignedBy.firstname} ${task.assignedBy.lastname}`}
          />
          <InfoChip
            icon="mdi:account-outline"
            iconBg="#f0fdf4"
            iconColor="#16a34a"
            label="Assigned To"
            value={`${task.assignedTo.firstname} ${task.assignedTo.lastname}`}
          />
          <InfoChip
            icon="mdi:calendar-month-outline"
            iconBg="#fff7e6"
            iconColor="#d97706"
            label="Due Date"
            value={dayjs(task.dueDate).format("MMM DD, YYYY")}
          />
        </div>

        {/* Description toggle — only show if there's a description */}
        {hasDescription && (
          <>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="btn w-100 d-flex align-items-center justify-content-between px-3 py-2 border-start-0 border-end-0 border-bottom-0 border-sh-base-50 rounded-0"
            >
              <span className="small text-street-base d-flex align-items-center gap-1">
                <Icon icon="mdi:file-document-outline" />
                Task description
              </span>
              <Icon
                icon="mdi:chevron-down"
                width={18}
                className="text-street-base"
                style={{
                  transition: "transform .2s ease",
                  transform: expanded ? "rotate(180deg)" : "none",
                }}
              />
            </button>

            {expanded && (
              <div
                className="px-3 py-2 small border-start-0 text-street-base border-end-0 border-bottom-0 border-sh-base-50 bg-card text-break break-word"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task.description),
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
const TaskComment = ({ task }: { task: ITask }) => {
  const [show, setShow] = useState(false);

  const useLazyViewComments = () => {
    const [trigger, result] = useLazyViewTaskCommentsQuery();
    return [
      (args: { cursor?: string | null; limit: number }) =>
        trigger({ taskId: task._id, ...args }),
      result,
    ] as const;
  };

  const useAddComment = () => {
    const [trigger, result] = useAddTaskCommentMutation();
    return [
      (args: { formdata: FormData }) => trigger({ taskId: task._id, ...args }),
      result,
    ] as const;
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="btn btn-street-primary d-flex align-items-center justify-content-center radius-12 p-0"
        style={{ width: 43, height: 40 }}
      >
        <Icon icon="mdi:chat-outline" className="text-xl" />
      </button>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="end"
        style={{ width: 680 }}
      >
        <Offcanvas.Header
          closeButton
          className="bg-street-primary text-white task-comment-header"
        >
          <Offcanvas.Title className="task-comment-title">
            {task.title.replace(/\b\w/g, (char) => char.toUpperCase())}
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0" style={{ background: "var(--chat)" }}>
          <div className="d-flex flex-column  h-100">
            <TaskInfoCard task={task} />
            <EntityChat
              task={task}
              entityId={task._id}
              socketRoomPrefix="task"
              useLazyViewComments={useLazyViewComments}
              useAddComment={useAddComment}
              active={show}
            />
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default TaskComment;
