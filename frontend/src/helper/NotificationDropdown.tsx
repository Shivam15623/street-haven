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
import { getUserNotificationPermission } from "../utills/notificationPermission";

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
    if (!socket || !user?._id) return;

    const permissions = getUserNotificationPermission(user) ?? [];

    const joinRoom = () => {
      socket.emit("joinUserRoom", { userId: user._id });

      if (permissions.length > 0) {
        socket.emit("joinPermissionRooms", { permissions });
      }
    };

    // join immediately if already connected
    if (socket.connected) joinRoom();

    // AND rejoin every time the underlying connection re-establishes
    socket.on("connect", joinRoom);

    socket.on("newNotification", (notification: notificationData) => {
      setNotifications((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item._id === notification._id,
        );
        const isNew = existingIndex === -1;

        // Bump the badge only for a genuinely new, unread notification.
        // A grouped-activity row that's just incrementing its
        // commentCount (same _id) was already counted when it first
        // arrived — re-counting it here would inflate unreadCount on
        // every new comment in the same burst.
        if (isNew && !notification.isRead) {
          setUnreadCount((count) => count + 1);
        }

        if (!isNew) {
          return prev.map((item) =>
            item._id === notification._id ? notification : item,
          );
        }

        return [notification, ...prev];
      });
    });

    return () => {
      socket.emit("leaveUserRoom", { userId: user._id });

      if (permissions.length > 0) {
        socket.emit("leavePermissionRooms", { permissions });
      }

      socket.off("connect", joinRoom);
      socket.off("newNotification");
    };
  }, [socket, user?._id]);

  useEffect(() => {
    const count = notifications.filter((notif) => !notif.isRead).length;
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
                  : n,
              ),
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
