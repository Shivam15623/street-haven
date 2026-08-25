import { useEffect, useRef, useState } from "react";
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
import { useFetchCommentsNotifyQuery, useMarkCommentNotificationsAsReadMutation, type CommentNotificationData } from "../services/commentNotificationApi";

// Unified shape the dropdown renders — both sources get mapped into this.
type FeedItem = {
  _id: string;
  kind: "generic" | "comment";
  title: string;
  message: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const toFeedItem = (n: notificationData): FeedItem => ({
  _id: n._id,
  kind: "generic",
  title: n.title,
  message: n.message,
  link: n.link,
  readAt: n.readAt,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt ?? n.createdAt,
});

const commentToFeedItem = (n: CommentNotificationData): FeedItem => {
  const activity = n.activityId;
  const actorName = activity?.lastActorId?.firstname ?? "Someone";
  const count = activity?.commentCount ?? 1;
  return {
    _id: n._id,
    kind: "comment",
    title: `${actorName} commented on ${activity?.entityType ?? "an item"}`,
    message: count > 1 ? `${count} new comments` : "1 new comment",
    link: activity
      ? `/${activity.entityType.toLowerCase()}/${activity.entityId}`
      : undefined,
    readAt: n.readAt,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
};

const mergeAndSort = (items: FeedItem[]): FeedItem[] =>
  [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const NotificationDropdown = () => {
  const { socket, connected } = useSocket();
  const { user } = useSelector(selectAuth);

  const [genericFeed, setGenericFeed] = useState<FeedItem[]>([]);
  const [commentFeed, setCommentFeed] = useState<FeedItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const {
    data,
    isLoading,
    refetch: refetchGeneric,
  } = useFetchNotifyQuery({
    page: 1,
    limit: 10,
    readStatus: "all",
    type: undefined,
  });
  const {
    data: commentData,
    isLoading: commentLoading,
    refetch: refetchComments,
  } = useFetchCommentsNotifyQuery({ page: 1, limit: 10, readStatus: "all" });

  const { add, flush } = useNotificationReadBuffer();
  const [markRead] = useMarkNotificationsAsReadMutation();
  const [markCommentRead] = useMarkCommentNotificationsAsReadMutation();

  // track the newest updatedAt we've seen, for reconnect reconciliation
  const lastSyncRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    setGenericFeed((data?.data.notifications ?? []).map(toFeedItem));
  }, [data?.data.notifications]);

  useEffect(() => {
    setCommentFeed(
      (commentData?.data.notifications ?? []).map(commentToFeedItem),
    );
  }, [commentData?.data.notifications]);

  // ── socket wiring: join rooms, listen for both event types ──
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

    socket.on("newNotification", (notification: notificationData) => {
      setGenericFeed((prev) => [toFeedItem(notification), ...prev]);
      lastSyncRef.current = new Date().toISOString();
    });

    socket.on(
      "notification:comment",
      (payload: {
        _id: string;
        activityId: {
          entityType: string;
          entityId: string;
          lastActorId?: { firstname?: string };
          commentCount: number;
        };
        readAt: string | null;
        createdAt: string;
        updatedAt: string;
      }) => {
        console.log("notification",payload)
        // best-effort optimistic insert; reconciliation fetch is the source of truth
        setCommentFeed((prev) => {
          const withoutStale = prev.filter((f) => f._id !== payload._id);
          return [
            commentToFeedItem(payload as CommentNotificationData),
            ...withoutStale,
          ];
        });
        lastSyncRef.current = new Date().toISOString();
      },
    );

    return () => {
      socket.emit("leaveUserRoom", { userId: user._id });
      if (permissions.length > 0) {
        socket.emit("leavePermissionRooms", { permissions });
      }
      socket.off("connect", joinRoom);
      socket.off("newNotification");
      socket.off("notification:comment");
    };
  }, [socket, user?._id]);

  // ── reconnect reconciliation — the actual correctness backstop.
  //    Sockets are best-effort; this fetch is what guarantees nothing
  //    was missed while disconnected. ──
  const wasConnected = useRef(connected);
  useEffect(() => {
    if (!wasConnected.current && connected) {
      // transitioned from disconnected -> connected: refetch everything
      // rather than trust whatever socket events did or didn't arrive
      refetchGeneric();
      refetchComments();
      lastSyncRef.current = new Date().toISOString();
    }
    wasConnected.current = connected;
  }, [connected, refetchGeneric, refetchComments]);

  useEffect(() => {
    const merged = mergeAndSort([...genericFeed, ...commentFeed]);
    const count = merged.filter((n) => !n.readAt).length;
    setUnreadCount(count);
  }, [genericFeed, commentFeed]);

  const feed = mergeAndSort([...genericFeed, ...commentFeed]);
  const loading = isLoading || commentLoading;

  return (
    <Dropdown
      className="notification-dropdown"
      onToggle={async (isOpen) => {
        if (!isOpen) {
          const ids = flush(); // { genericIds, commentIds } — see note below
          if (ids.genericIds.length === 0 && ids.commentIds.length === 0)
            return;

          try {
            const calls = [];
            if (ids.genericIds.length > 0)
              calls.push(markRead(ids.genericIds).unwrap());
            if (ids.commentIds.length > 0)
              calls.push(markCommentRead(ids.commentIds).unwrap());
            await Promise.all(calls);

            const now = new Date().toISOString();
            setGenericFeed((prev) =>
              prev.map((n) =>
                ids.genericIds.includes(n._id) ? { ...n, readAt: now } : n,
              ),
            );
            setCommentFeed((prev) =>
              prev.map((n) =>
                ids.commentIds.includes(n._id) ? { ...n, readAt: now } : n,
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
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2 text-street-base">Loading...</span>
            </div>
          ) : feed.length === 0 ? (
            <div className="p-3 text-center text-sm text-street-base">
              No new notifications
            </div>
          ) : (
            feed.map((item) => (
              <NotificationItem
                key={item._id}
                item={item}
                onSeen={() => add(item._id, item.kind)}
              />
            ))
          )}
        </div>

        <NotificationView />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
