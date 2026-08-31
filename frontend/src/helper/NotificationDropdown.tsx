import { useEffect, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import {
  useFetchNotifyQuery,
  useFetchUnreadCountQuery,
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
  const { data, isLoading } = useFetchNotifyQuery({ limit: 20 });
  const { data: unreadData } = useFetchUnreadCountQuery();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { add, flush } = useNotificationReadBuffer();
  const [markRead] = useMarkNotificationsAsReadMutation();

  useEffect(() => {
    setNotifications(data?.data.notifications ?? []);
  }, [data?.data.notifications]);

  // server-computed unread count is the source of truth on load; local
  // deltas from socket pushes / optimistic mark-read adjust it after
  useEffect(() => {
    if (unreadData?.data.count !== undefined) {
      setUnreadCount(unreadData.data.count);
    }
  }, [unreadData?.data.count]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const permissions = getUserNotificationPermission(user) ?? [];

    const joinRoom = () => {
      socket.emit("joinUserRoom", { userId: user._id });
      if (permissions.length > 0) {
        socket.emit("joinPermissionRooms", { permissions });
      }
    };

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    // single event for both sources — discriminate via payload.source
    socket.on("notification:new", (notification: notificationData) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.emit("leaveUserRoom", { userId: user._id });
      if (permissions.length > 0) {
        socket.emit("leavePermissionRooms", { permissions });
      }
      socket.off("connect", joinRoom);
      socket.off("notification:new");
    };
  }, [socket, user?._id]);

  return (
    <Dropdown
      className="notification-dropdown"
      onToggle={async (isOpen) => {
        if (!isOpen) {
          const ids = flush();
          if (ids.length === 0) return;

          try {
            await markRead(ids).unwrap();

            setNotifications((prev) =>
              prev.map((n) =>
                ids.includes(n._id)
                  ? { ...n, isRead: true, readAt: new Date().toISOString() }
                  : n,
              ),
            );
            setUnreadCount((prev) => Math.max(0, prev - ids.length));
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
