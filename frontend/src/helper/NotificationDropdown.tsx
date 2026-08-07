import { useEffect, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import {
  useFetchNotifyQuery,
  useMarkNotificationsAsReadMutation,
  type notificationData,
} from "../services/notificationApi";
import { useSocket } from "../hooks/useSocket";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";
import NotificationItem from "./NotificationItem";
import NotificationView from "./NotificationView";
import { useNotificationReadBuffer } from "../hooks/useNotificationReader";
import { getErrorMessage } from "../utills/utills";
import { showError } from "../utills/toastutills";

const NotificationDropdown = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<notificationData[]>([]);
  const { user } = useSelector(selectAuth);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { data, isLoading } = useFetchNotifyQuery({
    page: 1,
    limit: 10,
    readStatus: "all",
    type: undefined,
  });
  const { add, flush } = useNotificationReadBuffer();
  const [markRead] = useMarkNotificationsAsReadMutation();

  useEffect(() => {
    setNotifications(data?.data.notifications ?? []);
  }, [data?.data.notifications]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinUserRoom", { userId: user?._id });

    socket.on("newNotification", (notification: notificationData) => {
      console.log("Received new notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.emit("leaveUserRoom", { userId: user?._id });
      socket.off("newNotification");
    };
  }, [socket, user?._id]);
  useEffect(() => {
    const count = notifications.filter((notif) => !notif.readAt).length;
    setUnreadCount(count);
  }, [notifications]);

  return (
    <Dropdown
      className="notification-dropdown"
      onToggle={async (isOpen) => {
        if (!isOpen) {
          const ids = flush();
          if (ids.length === 0) return;

          try {
            await markRead(ids).unwrap();

            // optimistic UI update
            setNotifications((prev) =>
              prev.map((n) =>
                ids.includes(n._id)
                  ? { ...n, readAt: new Date().toISOString() }
                  : n
              )
            );
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }
      }}
    >
      <Dropdown.Toggle id="notification-dropdown-toggle">
        <Icon icon="basil:notification-outline" className="alarm notifyicon" />
        {unreadCount > 0 && <span className="badge-unread"></span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-0 border-1 border-sh-base">
        <Dropdown.Header className="p-sm-16 p-10 text-sm sm:text-md text-street-dark fw-medium">
          Notifications
        </Dropdown.Header>
        <Dropdown.Divider />

        <div className="max-h-400-px overflow-y-auto scroll-sm">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center p-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2 text-street-base">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-center text-sm text-street-base">
              No new notifications
            </div>
          ) : (
            notifications.map((item) => (
              <NotificationItem key={item._id} item={item} onSeen={add} />
            ))
          )}
        </div>

        <NotificationView />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
