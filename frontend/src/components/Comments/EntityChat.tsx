import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  lazy,
} from "react";

import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import type { FileItem, FileType } from "../../interfaces/fileinterface";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSocket } from "../../hooks/useSocket";
import { selectAuth } from "../../redux/AuthSlice";
import { useSelector } from "react-redux";

import FileViewer from "../FileViewer/FileViewer";
import { useInfiniteScroll } from "./hooks";
import { showError, showSuccess } from "../../utills/toastutills";
import { getErrorMessage } from "../../utills/utills";
import { AttachmentPreview } from "./AttachmentPreview";
import {
  type GetTaskTimelineResponseData,
  type TaskTimelineItem,
  type TaskCommentTimelineItem,
  type TaskActivityTimelineItem,
  type TaskTimelineUser,
  type TaskStatus,
  useUpdateTaskStatusMutation,
  type ITask,
} from "../../services/taskApi";
import DOMPurify from "dompurify";
import type { ApiResponse } from "../../interfaces/Response";
import useHasPermission from "../../hooks/Auth";

const QuillEditor = lazy(() => import("../child/QuillEditor"));
dayjs.extend(relativeTime);

// Types
interface Attachment {
  _id: string;
  type: FileType;
  fileName: string;
  size: number;
  fileUrl: string;
  thumbnail?: string;
}

// Constants
const COMMENTS_PER_PAGE = 15;
const MAX_ATTACHMENTS = 7;

type UseLazyViewCommentsHook = () => readonly [
  (args: { taskId: string; limit: number; cursor?: string | null }) => any,
  {
    data?: ApiResponse<GetTaskTimelineResponseData>;
    isLoading: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
  },
];

type UseAddCommentHook = () => readonly [
  (args: { formdata: FormData }) => {
    unwrap: () => Promise<{ success: boolean }>;
  },
  {
    isLoading: boolean;
  },
];

// ---- Grouping helpers -------------------------------------------------

type CommentGroup = {
  kind: "comments";
  key: string;
  user: TaskTimelineUser | null;
  messages: TaskCommentTimelineItem[];
};

type ActivityRow = {
  kind: "activity";
  key: string;
  item: TaskActivityTimelineItem;
};

type DateGroup = {
  dateLabel: string;
  groups: (CommentGroup | ActivityRow)[];
};

const formatDateLabel = (date: string) => {
  const d = dayjs(date);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.format("MMM DD, YYYY");
};
const STATUS_LABELS: Record<TaskStatus, string> = {
  new: "New",
  assigned: "Assigned",
  under_review: "Under Review",
  completed: "Completed",
};

const getStatusLabel = (status: string | null | undefined) => {
  if (!status) return "—";
  return STATUS_LABELS[status as TaskStatus] ?? status;
};
const sameUser = (
  a: TaskTimelineUser | null,
  b: TaskTimelineUser | null,
): boolean => {
  if (!a || !b) return a === b;
  return a._id === b._id;
};

/**
 * Groups the flat timeline (comments + activity log entries) by date, then
 * clusters consecutive comments from the same user into a single bubble
 * group. Activity entries always render as their own standalone row and
 * break comment grouping.
 */
const groupTimelineByDate = (items: TaskTimelineItem[]): DateGroup[] => {
  const byDate = new Map<string, TaskTimelineItem[]>();

  for (const item of items) {
    const label = formatDateLabel(item.createdAt);
    if (!byDate.has(label)) byDate.set(label, []);
    byDate.get(label)!.push(item);
  }

  const result: DateGroup[] = [];

  for (const [dateLabel, dayItems] of byDate.entries()) {
    const groups: (CommentGroup | ActivityRow)[] = [];

    for (const item of dayItems) {
      if (item.itemType === "activity") {
        groups.push({ kind: "activity", key: item._id, item });
        continue;
      }

      const last = groups[groups.length - 1];
      if (
        last &&
        last.kind === "comments" &&
        sameUser(last.user, item.userId)
      ) {
        last.messages.push(item);
      } else {
        groups.push({
          kind: "comments",
          key: item._id,
          user: item.userId,
          messages: [item],
        });
      }
    }

    result.push({ dateLabel, groups });
  }

  return result;
};

const activityLabel = (activity: TaskActivityTimelineItem): string => {
  const name = activity.userId?._id
    ? `${activity.userId.firstname} ${activity.userId.lastname}`
    : "Someone";

  switch (activity.action) {
    case "created":
      return activity.note || `${name} created this task`;
    case "status_change":
      if (activity.fromValue === null && activity.toValue === "new") {
        return `${name} created this task`;
      }

      return (
        activity.note ||
        `${name} changed status from ${getStatusLabel(activity.fromValue)} to ${getStatusLabel(
          activity.toValue,
        )}`
      );

    case "assignee_change":
      if (activity.fromValue === null && activity.toValue !== null) {
        return (
          activity.note || `${name} assigned this task to ${activity.toValue}`
        );
      } else {
        return (
          activity.note ||
          `${name} changed assignee from ${activity.fromValue ?? "—"} to ${activity.toValue ?? "—"}`
        );
      }

    case "due_date_change":
      return (
        activity.note ||
        `${name} changed due date from ${activity.fromValue ?? "—"} to ${activity.toValue ?? "—"}`
      );
    default:
      return activity.note || `${name} updated ${activity.field}`;
  }
};

const ActivityLogRow = ({
  activity,
}: {
  activity: TaskActivityTimelineItem;
}) => (
  <div className="text-center my-3">
    <span
      className="text-muted d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill bg-light"
      style={{ fontSize: 12 }}
    >
      <Icon icon="mdi:information-outline" width={14} />
      {activityLabel(activity)}
      <span className="text-muted opacity-75">
        · {dayjs(activity.createdAt).format("hh:mm A")}
      </span>
    </span>
  </div>
);

interface EntityChatProps {
  task: ITask;
  entityId: string; // ticketId or taskId
  socketRoomPrefix: "ticket" | "task"; // used to namespace socket rooms
  useLazyViewComments: UseLazyViewCommentsHook;
  useAddComment: UseAddCommentHook;
  /** Set to true once the parent has actually mounted/shown this chat,
   *  so we know it's safe to fetch + join the socket room. Defaults to true. */
  active?: boolean;
}

const EntityChat = ({
  task,
  entityId,
  socketRoomPrefix,
  useLazyViewComments,
  useAddComment,
  active = true,
}: EntityChatProps) => {
  const { socket } = useSocket();
  const { user } = useSelector(selectAuth);
  const { hasRole } = useHasPermission();
  const [cursor, setCursor] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TaskTimelineItem[]>([]);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFiles, setViewerFiles] = useState<FileItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);
  const [
    getComments,
    { data: commentData, isLoading, isFetching, isUninitialized },
  ] = useLazyViewComments();
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTaskStatusMutation();
  const hasMore = commentData?.data?.pagination.hasMore ?? false;

  const handleLoadMore = useCallback(() => {
    if (isFetching || !hasMore) return;
    const nextCursor = commentData?.data?.pagination.nextCursor ?? null;
    if (!nextCursor) return;
    setCursor(nextCursor);
    getComments({
      taskId: entityId,
      cursor: nextCursor,
      limit: COMMENTS_PER_PAGE,
    });
  }, [isFetching, hasMore, commentData, entityId, getComments]);

  const { restoreScrollPosition } = useInfiniteScroll(
    containerRef,
    hasMore,
    isFetching,
    handleLoadMore,
  );

  const [addComment, { isLoading: uploading }] = useAddComment();

  const groupedTimeline = useMemo(
    () => groupTimelineByDate(timeline),
    [timeline],
  );

  // Initial fetch once "active" (replaces the old Sheet onOpen trigger)
  useEffect(() => {
    if (!active || !isUninitialized) return;
    setCursor(null);
    setTimeline([]);
    getComments({ taskId: entityId, limit: COMMENTS_PER_PAGE });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isUninitialized]);

  useEffect(() => {
    if (!commentData?.data?.items) return;
    const newItems = [...commentData.data.items].reverse();
    setTimeline((prev) => {
      const merged = cursor === null ? newItems : [...newItems, ...prev];
      return Array.from(new Map(merged.map((c) => [c._id, c])).values());
    });
    if (cursor !== null) {
      restoreScrollPosition();
    }
    // cursor === null means this was the initial load —
    // scrolling to bottom is handled in the layout effect below
  }, [commentData, cursor, restoreScrollPosition]);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Only run this once, right after the *first* batch of items renders
    if (!initialScrollDoneRef.current && timeline.length > 0) {
      el.scrollTop = el.scrollHeight;
      initialScrollDoneRef.current = true;
    }
  }, [timeline]);
  useEffect(() => {
    if (!socket || !active) return;

    const room = `${socketRoomPrefix}:${entityId}`;
    socket.emit("joinRoom", { room, userId: user?._id });

    const handleNewComment = ({
      comment,
      clientId,
    }: {
      comment: TaskTimelineItem & { entityId?: string; entityType?: string };
      clientId: string;
    }) => {
      if (comment.entityId !== entityId) return;
      console.log("new comment received", comment, clientId);
      setTimeline((prev) => {
        if (clientId) {
          const index = prev.findIndex((c) => c._id === clientId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = comment;
            return updated;
          }
        }
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    };

    const handleNewActivity = (
      activity: TaskActivityTimelineItem & { entityId?: string },
    ) => {
      if (activity.entityId !== entityId) return;
      setTimeline((prev) => {
        if (prev.some((c) => c._id === activity._id)) return prev;
        return [...prev, activity];
      });
    };

    socket.on("newComment", handleNewComment);
    socket.on("newActivity", handleNewActivity);

    return () => {
      socket.emit("leaveRoom", { room, userId: user?._id });
      socket.off("newComment", handleNewComment);
      socket.off("newActivity", handleNewActivity);
    };
  }, [socket, entityId, socketRoomPrefix, user?._id, active]);

  const handleAddAttachments = useCallback((files: FileList) => {
    setAttachments((prev) => {
      const newFiles = Array.from(files).slice(
        0,
        MAX_ATTACHMENTS - prev.length,
      );
      return [...prev, ...newFiles];
    });
  }, []);
  const handleUpdateTaskStatus = async (newStatus: TaskStatus) => {
    try {
      const res = await updateTaskStatus({
        taskId: entityId,
        status: newStatus,
      }).unwrap();
      if (res.success) {
        showSuccess(`Task status updated to ${getStatusLabel(newStatus)}`);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };
  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleMessageSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      const formdata = new FormData();
      const clientId = crypto.randomUUID();
      formdata.append("clientId", clientId);
      if (message) formdata.append("message", message);
      attachments.forEach((file) => formdata.append("files", file));

      if (user) {
        const optimisticComment: TaskCommentTimelineItem = {
          _id: `${clientId}`,
          itemType: "comment",
          message,
          createdAt: new Date().toISOString(),
          userId: {
            _id: user._id,
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
          },
          attachments: attachments.map((file) => ({
            _id: `${clientId}-${file.name}`,
            fileName: file.name,
            size: file.size,
            fileUrl: URL.createObjectURL(file),
            type: file.type.startsWith("image")
              ? "image"
              : file.type.startsWith("video")
                ? "video"
                : "other",
          })),
        };
        setTimeline((prev) => [...prev, optimisticComment]);
      }
      setMessage("");
      setAttachments([]);

      const res = await addComment({ formdata }).unwrap();
      if (res.success) {
        setMessage("");
        setAttachments([]);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openFileViewer = useCallback(
    (attachmentList: Attachment[], index: number) => {
      setViewerFiles(
        attachmentList.map((a) => ({
          _id: a._id,
          fileUrl: a.fileUrl,
          fileType: a.type,
          fileName: a.fileName,
          size: a.size,
        })),
      );
      setViewerIndex(index);
      setViewerOpen(true);
    },
    [],
  );

  return (
    <>
      <div className="chat-main flex-grow-1 overflow-auto" ref={containerRef}>
        {/* Loading indicator at top */}
        {isFetching && cursor !== null && (
          <div className="text-center py-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {isLoading ? (
          [...Array(3)].map((_, idx) => (
            <div key={idx} className="chat-single-message left mb-2">
              <div className="chat-message-content p-2 bg-light rounded placeholder-glow">
                <span className="placeholder col-8" />
              </div>
            </div>
          ))
        ) : groupedTimeline.length > 0 ? (
          groupedTimeline.map((dateGroup) => (
            <div key={dateGroup.dateLabel} className="mb-3">
              <div className="text-center text-muted my-5 position-relative">
                <hr className="m-0 opacity-0" />
                <span className="chat-date-label" style={{ fontSize: "12px" }}>
                  {dateGroup.dateLabel}
                </span>
              </div>

              {dateGroup.groups.map((group) => {
                if (group.kind === "activity") {
                  return (
                    <ActivityLogRow key={group.key} activity={group.item} />
                  );
                }

                const isOwn = user?._id && group.user?._id === user._id;
                console.log(user?._id, group.user?._id, isOwn, group);
                return (
                  <div
                    key={group.key}
                    className={`chat-single-message p-0 d-flex flex-column gap-2 mb-0 ${
                      isOwn ? "right" : "left align-items-start"
                    }`}
                  >
                    {group.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className="chat-message-content align-items-start position-relative p-8"
                      >
                        {!isOwn && group.user && (
                          <div className="pb-2">
                            <span className="text-xs fw-semibold text-street-primary">
                              {group.user.firstname} {group.user.lastname}
                            </span>
                          </div>
                        )}

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 gap-2 d-flex flex-column">
                            {msg.attachments.map((attachment, attIdx) => (
                              <AttachmentPreview
                                key={attachment._id}
                                attachment={attachment}
                                onClick={() =>
                                  openFileViewer(msg.attachments!, attIdx)
                                }
                              />
                            ))}
                          </div>
                        )}

                        {msg.message && (
                          <div
                            className="prose Te py-2 chatpara"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(msg.message),
                            }}
                          />
                        )}

                        <div className="px-2 d-flex align-items-center justify-content-end gap-1">
                          <span className="chat-time text-xxs">
                            {dayjs(msg.createdAt).format("hh:mm A")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-4">
            <Icon icon="mdi:comment-outline" className="text-2xl mb-2" />
            <p className="mb-0">No comments yet</p>
          </div>
        )}
      </div>

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="p-2 border-top bg-light">
          <div
            className="d-flex gap-2 overflow-auto"
            style={{ scrollbarWidth: "thin" }}
          >
            {attachments.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="position-relative d-flex align-items-center gap-2 p-2 bg-secondary bg-opacity-10 rounded"
                style={{ minWidth: "160px" }}
              >
                <Icon
                  icon="mdi:file-outline"
                  className="text-muted flex-shrink-0"
                  width={18}
                />
                <span className="text-truncate small flex-grow-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-light p-1 d-flex align-items-center justify-content-center"
                  onClick={() => handleRemoveAttachment(idx)}
                >
                  <Icon icon="mdi:close" width={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        className="chat-message-box p-0 rounded-0"
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSend();
        }}
      >
        <div className="d-flex flex-column w-100 p-2">
          <div className="w-100 px-2 py-3">
            <QuillEditor
              content={message}
              onChange={setMessage}
              features={{
                align: false,
                backgroundColor: false,
                color: false,
                emoji: true,
                headings: true,
                link: true,
                lists: true,
              }}
            />
          </div>

          <div className="chat-message-box-action w-100 flex-row flex-nowrap gap-1 justify-content-between px-3 py-2">
            <div className="d-flex gap-2">
              {task.status !== "under_review" && hasRole("volunteer") && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  className="btn btn-street-outline-primary d-flex align-items-center gap-1 text-sm"
                  onClick={() => handleUpdateTaskStatus("under_review")}
                >
                  <Icon icon="mdi:check" className="text-xl" /> Send for Review
                </button>
              )}
              {hasRole(["admin", "super_admin"]) &&
                task.status === "under_review" && (
                  <>
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      className="btn btn-street-edit d-flex align-items-center gap-1 text-sm"
                      onClick={() => handleUpdateTaskStatus("completed")}
                    >
                      <Icon icon="mdi:check-all" className="text-xl" /> Approve
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      className="btn btn-street-delete d-flex align-items-center gap-1 text-sm"
                      onClick={() => handleUpdateTaskStatus("assigned")}
                    >
                      <Icon
                        icon="mdi:account-arrow-right-outline"
                        className="text-xl"
                      />{" "}
                      Reject
                    </button>
                  </>
                )}
            </div>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) =>
                e.target.files && handleAddAttachments(e.target.files)
              }
            />
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light d-flex align-items-center text-xl"
                onClick={handleFileSelect}
              >
                <Icon icon="ph:link" />
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-street-primary text-sm d-flex align-items-center gap-1"
              >
                Send
                <Icon icon="f7:paperplane" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {viewerOpen && (
        <FileViewer
          files={viewerFiles}
          initialIndex={viewerIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </>
  );
};

export default EntityChat;
