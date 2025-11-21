import React, { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Dropdown } from "react-bootstrap";
import { useInView } from "../hooks/useInView";
import { useDebouncedBulkMarkRead } from "../hooks/useDebouncedBulkMarkRead";
import { type notificationData } from "../services/notificationApi";

dayjs.extend(relativeTime);

interface NotificationItemProps {
  item: notificationData;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item }) => {
  const { ref, isInView } = useInView({ threshold: 0.5 });
  const { addNotificationId } = useDebouncedBulkMarkRead(1200); // 1.2s debounce

  useEffect(() => {
    if (isInView && !item.readAt) {
      addNotificationId(item._id);
    }
  }, [isInView, item._id, item.readAt, addNotificationId]);

  return (
    <>
      <Dropdown.Item
        className={`p-10 p-sm-16 ${
          item.readAt ? "opacity-75" : ""
        } d-flex flex-row align-items-start gap-8 gap-sm-12`}
      >
        <div
          ref={ref}
          className="d-flex flex-row gap-8 justify-content-between align-items-start w-100"
        >
          <div className="flex-grow-1">
            <p className="text-sm sm:text-sm text-street-dark mb-0">
              {item.title}
            </p>
            <p className="text-xs text-street-base mt-0 mt-sm-1">
              {item.message}
            </p>
            <p className="text-xxs sm:text-xs text-street-base mt-0 mt-sm-1">
              {dayjs(item.createdAt).fromNow()}
            </p>
          </div>
          <div
            className={`w-6-px h-6-px w-sm-8-px h-sm-8-px rounded-circle mt-6 flex-shrink-0 ${
              item.readAt ? "bg-secondary" : "bg-street-primary"
            }`}
          ></div>
        </div>
      </Dropdown.Item>
      <Dropdown.Divider />
    </>
  );
};

export default NotificationItem;
