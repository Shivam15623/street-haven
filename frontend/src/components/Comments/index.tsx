import { useEffect, useRef, useState, useMemo, useCallback, lazy } from "react";
import DOMPurify from "dompurify";
import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import {
  useLazyFetchTicketMentionableUsersQuery,
  type commentData,
  type commentResponse,
  type MentionableUser,
} from "../../services/ticketApi";
import type { FileItem, FileType } from "../../interfaces/fileinterface";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSocket } from "../../hooks/useSocket";
import { selectAuth } from "../../redux/AuthSlice";
import { useSelector } from "react-redux";
import FileViewer from "../FileViewer/FileViewer";
import { groupCommentsByDate } from "./utills";
import { useInfiniteScroll } from "./hooks";
import { showError } from "../../utills/toastutills";
import { getErrorMessage } from "../../utills/utills";
import Sheet from "../child/Sheet";
import { AttachmentPreview } from "./AttachmentPreview";
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
// const SCROLL_THRESHOLD = 40;
const MAX_ATTACHMENTS = 7;

// data-id is an HTML attribute, never rendered as visible text — it does
// NOT need to be stripped to "hide" it from the user. We keep it (so
// mentions can be styled/clicked later) and just sanitize everything else.
const SANITIZE_CONFIG = {
  ADD_TAGS: ["span"],
  ADD_ATTR: ["data-id", "data-denotation-char", "data-value", "class"],
};

// Main Component
type UseLazyViewCommentsHook = () => readonly [
  (args: { page: number; limit: number }) => any,
  {
    data?: commentResponse;
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
const getPlainTextPreview = (html: string, maxLen = 80) => {
  const text =
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
};

interface EntityCommentProps {
  entityId: string; // ticketId or taskId
  socketRoomPrefix: "ticket" | "task"; // used to namespace socket rooms
  title: string;
  entitySlug: string;
  useLazyViewComments: UseLazyViewCommentsHook;
  useAddComment: UseAddCommentHook;
  triggerIcon?: string;
}

const EntityComment = ({
  entityId,
  socketRoomPrefix,
  entitySlug,
  title,
  useLazyViewComments,
  useAddComment,
  triggerIcon = "mdi:chat-outline",
}: EntityCommentProps) => {
  const { socket } = useSocket();
  const { user } = useSelector(selectAuth);

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<commentData[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFiles, setViewerFiles] = useState<FileItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState<commentData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [
    getComments,
    { data: commentData, isLoading, isFetching, isUninitialized },
  ] = useLazyViewComments();
  const [mentionableUsers, setMentionableUsers] = useState<MentionableUser[]>(
    [],
  );
  const commentsById = useMemo(() => {
    const map = new Map<string, commentData>();
    comments.forEach((c) => map.set(c._id, c));
    return map;
  }, [comments]);
  const [fetchMentionableUsers] = useLazyFetchTicketMentionableUsersQuery();

  // Fetch once when the sheet opens (not per-keystroke)
  const loadMentionableUsers = useCallback(async () => {
    try {
      const result = await fetchMentionableUsers({
        ticketId: entitySlug,
        q: "",
      }).unwrap();
      setMentionableUsers(result.data ?? result);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  }, [fetchMentionableUsers, entityId]);
  const totalPages = commentData?.data?.paggination.totalPages || 1;
  const hasMore = page < totalPages;
  // Called from the "Reply" affordance on a message bubble.
  const handleStartReply = useCallback((comment: commentData) => {
    setReplyingTo(comment);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);
  const handleLoadMore = useCallback(() => {
    if (isFetching || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    getComments({ page: nextPage, limit: COMMENTS_PER_PAGE });
  }, [page, hasMore, isFetching, getComments]);

  const { restoreScrollPosition } = useInfiniteScroll(
    containerRef,
    hasMore,
    isFetching,
    handleLoadMore,
  );

  const [addComment, { isLoading: uploading }] = useAddComment();

  const groupedComments = useMemo(
    () => groupCommentsByDate(comments),
    [comments],
  );

  useEffect(() => {
    if (!commentData?.data?.comments) return;
    const newComments = [...commentData.data.comments].reverse();
    setComments((prev) => {
      const merged = [...newComments, ...prev];
      return Array.from(new Map(merged.map((c) => [c._id, c])).values());
    });
    if (page > 1) restoreScrollPosition();
  }, [commentData, page, restoreScrollPosition]);

  useEffect(() => {
    if (!socket || !open) return;

    const room = `${socketRoomPrefix}:${entityId}`;
    socket.emit("joinRoom", { room, userId: user?._id });

    const handleNewComment = ({
      comment,
      clientId,
    }: {
      comment: commentData & { entityId?: string; entityType?: string };
      clientId: string;
    }) => {
      if (comment.entityId !== entityId) return;

      setComments((prev) => {
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

    socket.on("newComment", handleNewComment);

    return () => {
      socket.emit("leaveRoom", { room, userId: user?._id });
      socket.off("newComment", handleNewComment);
    };
  }, [socket, entityId, socketRoomPrefix, user?._id, open]);

  const handleAddAttachments = useCallback((files: FileList) => {
    setAttachments((prev) => {
      const newFiles = Array.from(files).slice(
        0,
        MAX_ATTACHMENTS - prev.length,
      );
      return [...prev, ...newFiles];
    });
  }, []);

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

      // Pull out every @mentioned user's id from the rendered HTML.
      const mentionedUserIds = Array.from(
        new DOMParser()
          .parseFromString(message, "text/html")
          .querySelectorAll(".mention[data-id]"),
      ).map((el) => el.getAttribute("data-id")!);

      if (mentionedUserIds.length) {
        formdata.append("mentions", JSON.stringify(mentionedUserIds));
      }

      // Reply: send the parent id if the user picked one. Snapshot it
      // locally first since we clear `replyingTo` right after.
      const parentComment = replyingTo;
      if (parentComment) {
        formdata.append("parentCommentId", parentComment._id);
      }

      if (user) {
        const optimisticComment: commentData = {
          _id: `${clientId}`,
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
          // Optimistic reply preview — backend will send back the same
          // shape ({_id, message, userId}) once the real comment returns,
          // reconciled via clientId like everything else.
          ...(parentComment
            ? {
                parentCommentId: {
                  _id: parentComment._id,
                  message: parentComment.message,
                  userId: parentComment.userId,
                },
              }
            : {}),
        };
        setComments((prev) => [...prev, optimisticComment]);
      }
      setMessage("");
      setAttachments([]);
      setReplyingTo(null);

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
  const scrollToComment = useCallback((commentId: string) => {
    const el = containerRef.current?.querySelector(
      `[data-comment-id="${commentId}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("chat-highlight-flash");
    setTimeout(() => el.classList.remove("chat-highlight-flash"), 1200);
  }, []);
  return (
    <Sheet
      title={title}
      size={600}
      placement="end"
      show={open}
      onClose={() => setOpen(false)}
      onOpen={() => {
        setOpen(true);
        if (isUninitialized) {
          setPage(1);
          setComments([]);
          getComments({ page: 1, limit: COMMENTS_PER_PAGE });
        }
        loadMentionableUsers();
      }}
      bodyclassName="p-0"
      trigger={
        <button
          className="btn btn-street-primary d-flex align-items-center justify-content-center radius-12 p-0"
          style={{ width: "43px", height: "40px" }}
        >
          <Icon icon={triggerIcon} className="text-xl" />
        </button>
      }
    >
      <div className="d-flex h-100 flex-column">
        <div className="chat-main flex-grow-1 overflow-auto" ref={containerRef}>
          {/* Loading indicator at top */}
          {isFetching && page > 1 && (
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
          ) : groupedComments.length > 0 ? (
            groupedComments.map((dateGroup) => (
              <div key={dateGroup.dateLabel} className="mb-3">
                <div className="text-center text-muted my-5 position-relative">
                  <hr className="m-0 opacity-0" />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary small fw-medium"
                    style={{ fontSize: "12px" }}
                  >
                    {dateGroup.dateLabel}
                  </span>
                </div>

                {dateGroup.groups.map((group, idx) => (
                  <div
                    key={`${group.user._id}-${idx}`}
                    className={`chat-single-message p-0 d-flex flex-column gap-2 mb-0 ${
                      user?._id === group.user._id
                        ? "right"
                        : "left align-items-start"
                    }`}
                  >
                    {group.messages.map((msg) => {
                      // parentCommentId may come back either populated
                      // (from the API) or as our optimistic shape above —
                      // both have {_id, message, userId}.
                      const parent = msg.parentCommentId
                        ? (commentsById.get(msg.parentCommentId._id) ??
                          msg.parentCommentId)
                        : null;

                      return (
                        <div
                          key={msg._id}
                          data-comment-id={msg._id}
                          className="chat-message-content align-items-start position-relative p-8 chat-message-group"
                        >
                          {user?._id !== group.user._id && (
                            <div className="pb-2">
                              <span className="text-xs fw-semibold text-street-primary">
                                {group.user.firstname} {group.user.lastname}
                              </span>
                            </div>
                          )}

                          {/* Quoted reply header — click to jump to the
                              original comment. */}
                          {parent && (
                            <button
                              type="button"
                              onClick={() => scrollToComment(parent._id)}
                              className="reply-quote btn p-0 text-start d-block mb-2 text-decoration-none"
                            >
                              <div className="reply-quote-inner">
                                <div className="reply-quote-user">
                                  <Icon icon="mdi:reply" width={13} />
                                  <span>
                                    {parent.userId.firstname}{" "}
                                    {parent.userId.lastname}
                                  </span>
                                </div>
                                <div className="reply-quote-message">
                                  {parent.message
                                    ? getPlainTextPreview(
                                        parent.message,
                                        80,
                                      ) /* Increased preview length slightly */
                                    : "Attachment"}
                                </div>
                              </div>
                            </button>
                          )}
                          {msg.attachments && msg.attachments?.length > 0 && (
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

                          <div
                            className="prose Te py-2 chatpara"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                msg.message,
                                SANITIZE_CONFIG,
                              ),
                            }}
                          />

                          <div className="px-2 d-flex align-items-center justify-content-between gap-1">
                            {/* Reply trigger — shown for every message,
                                including your own (replying to yourself
                                is a normal chat pattern, e.g. adding
                                context to your own earlier message). */}
                            <button
                              type="button"
                              onClick={() => handleStartReply(msg)}
                              className="btn p-0 reply-trigger"
                            >
                              <Icon icon="mdi:reply" width={13} />
                              <span>Reply</span>
                            </button>
                            <span className="chat-time text-xxs">
                              {dayjs(msg.createdAt).format("hh:mm A")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
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
        {/* Reply preview bar — shown above the composer while replyingTo
            is set. Dismissible without sending. */}
        {replyingTo && (
          <div className="reply-preview-bar d-flex align-items-center justify-content-between gap-3">
            <div className="flex-grow-1 min-w-0">
              <div className="reply-preview-title">
                <Icon icon="mdi:reply" width={14} />
                <span>
                  Replying to {replyingTo.userId.firstname}{" "}
                  {replyingTo.userId.lastname}
                </span>
              </div>
              <div className="reply-preview-text text-truncate">
                {replyingTo.message
                  ? getPlainTextPreview(replyingTo.message, 100)
                  : "Attachment"}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link reply-cancel-btn border-0 p-1"
              onClick={handleCancelReply}
              aria-label="Cancel reply"
            >
              <Icon icon="mdi:close" width={16} />
            </button>
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
                mentionableUsers={mentionableUsers}
                features={{
                  align: false,
                  backgroundColor: false,
                  color: false,
                  emoji: true,
                  headings: true,
                  link: true,
                  lists: true,
                  mentions: true,
                }}
              />
            </div>

            <div className="chat-message-box-action w-100 flex-row flex-nowrap gap-1 justify-content-end px-3 py-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) =>
                  e.target.files && handleAddAttachments(e.target.files)
                }
              />
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
        </form>
      </div>

      {viewerOpen && (
        <FileViewer
          files={viewerFiles}
          initialIndex={viewerIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </Sheet>
  );
};

export default EntityComment;
