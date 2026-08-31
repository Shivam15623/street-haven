import React, { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Dropdown } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useInView } from "../hooks/useInView";
import { type notificationData } from "../services/notificationApi";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

interface NotificationItemProps {
  item: notificationData;
  onSeen: (id: string) => void;
  variant?: "dropdown" | "list";
}

// Shorten a Mongo ObjectId to something scannable in a badge —
// last 6 chars is enough to disambiguate visually without needing
// the entity's display name (which we don't have on the notification row).
const shortId = (id: string) => id.slice(-6).toUpperCase();

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  onSeen,
  variant = "dropdown",
}) => {
  const { ref, isInView } = useInView({ threshold: 0.5 });
  const navigate = useNavigate();

  useEffect(() => {
    if (isInView && !item.isRead) {
      onSeen(item._id);
    }
  }, [isInView, item._id, item.isRead, onSeen]);

  const handleClick = () => {
    if (item.link) navigate(item.link);
  };

  // comment notifications have no separate title — message alone carries
  // the full line ("John mentioned you", "Sarah and 2 others added 3 comments")
  const showTitle = item.source === "system" && item.title;

  // comment notifications carry entityType/entityId — surface that as a
  // small "Task #A1B2C3" / "Ticket #4F9E21" badge so the user knows which
  // thread this is about before they click through.
  const entitySource =
    item.source === "comment" ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className="btn p-0 d-inline-flex align-items-center gap-1 text-xxs fw-medium text-street-primary mb-1 border-0 bg-transparent"
      >
        <Icon
          icon={
            item.entityType === "Task"
              ? "mdi:checkbox-marked-outline"
              : "mdi:ticket-outline"
          }
          width={12}
        />
        <span>
          {item.entityType} #{shortId(item.entityId)}
        </span>
      </button>
    ) : null;

  const content = (
    <div
      ref={ref}
      onClick={handleClick}
      className="d-flex flex-row gap-8 justify-content-between align-items-start w-100"
    >
      <div className="flex-grow-1">
        {entitySource}
        {showTitle && (
          <p className="text-sm sm:text-sm text-street-dark mb-0">
            {item.title}
          </p>
        )}
        <p className="text-xs text-street-base mt-0 mt-sm-1">{item.message}</p>
        <p className="text-xxs sm:text-xs text-street-base mt-0 mt-sm-1">
          {dayjs(item.createdAt).fromNow()}
        </p>
      </div>
      <div
        className={`w-6-px h-6-px w-sm-8-px h-sm-8-px rounded-circle mt-6 flex-shrink-0 ${
          item.isRead ? "bg-secondary" : "bg-street-primary"
        }`}
      ></div>
    </div>
  );

  if (variant === "dropdown") {
    return (
      <>
        <Dropdown.Item
          className={`p-10 p-sm-16 ${
            item.isRead ? "opacity-75" : ""
          } d-flex flex-row align-items-start gap-8 gap-sm-12`}
        >
          {content}
        </Dropdown.Item>
        <Dropdown.Divider />
      </>
    );
  }

  return (
    <div className="p-3 border-1 border-sh-base-50 radius-12 d-flex flex-column gap-8">
      {content}
    </div>
  );
};

export default NotificationItem;
