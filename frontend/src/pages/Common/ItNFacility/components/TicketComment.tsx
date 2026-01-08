import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Sheet from "../../../../components/child/Sheet";
import { useSocket } from "../../../../hooks/useSocket";
import type { TicketData } from "../../../../interfaces/Ticket";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  useAddCommentMutation,
  useLazyViewCommentsQuery,
  type commentData,
} from "../../../../services/ticketApi";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import QuillEditor from "../../../../components/child/QuillEditor";
import FileViewer from "../../../../components/FileViewer/FileViewer";
import type { FileItem, FileType } from "../../../../interfaces/fileinterface";
import { FileIconWithBackground } from "../../../../components/child/FileIcon";
import { getErrorMessage } from "../../../../utills/utills";
import { showError } from "../../../../utills/toastutills";

dayjs.extend(relativeTime);

// Types
interface CommentGroup {
  user: commentData["userId"];
  messages: commentData[];
}

interface DateGroupedComments {
  dateLabel: string;
  groups: CommentGroup[];
}

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
const SCROLL_THRESHOLD = 40;
const MAX_ATTACHMENTS = 7;

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getDateLabel = (date: dayjs.Dayjs, now: dayjs.Dayjs): string => {
  if (date.isSame(now, "day")) return "Today";
  if (date.add(1, "day").isSame(now, "day")) return "Yesterday";
  return date.format("DD MMM YYYY");
};

const groupCommentsByUser = (comments: commentData[]): CommentGroup[] => {
  return comments.reduce<CommentGroup[]>((groups, comment) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.user._id === comment.userId._id) {
      lastGroup.messages.push(comment);
    } else {
      groups.push({ user: comment.userId, messages: [comment] });
    }
    return groups;
  }, []);
};

const groupCommentsByDate = (
  comments: commentData[]
): DateGroupedComments[] => {
  const now = dayjs();
  const dateMap = new Map<string, commentData[]>();

  comments.forEach((comment) => {
    const label = getDateLabel(dayjs(comment.createdAt), now);
    const existing = dateMap.get(label) || [];
    dateMap.set(label, [...existing, comment]);
  });

  return Array.from(dateMap.entries()).map(([dateLabel, dateComments]) => ({
    dateLabel,
    groups: groupCommentsByUser(dateComments),
  }));
};

// AttachmentPreview Component
const AttachmentPreview = ({
  attachment,
  onClick,
}: {
  attachment: Attachment;
  onClick: () => void;
}) => {
  const readableSize = formatFileSize(attachment.size);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(attachment.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (attachment.type === "image") {
    return (
      <div
        className="position-relative overflow-hidden rounded-3 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className="w-100"
          style={{
            height: "12rem",
            objectFit: "cover",
            transition: "transform 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white small px-2 py-1 rounded-2 m-2">
          {readableSize}
        </div>
      </div>
    );
  }

  if (attachment.type === "video") {
    return (
      <div
        className="position-relative overflow-hidden rounded-3 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={attachment.thumbnail || "/placeholder-video.jpg"}
          alt={attachment.fileName}
          className="w-100"
          style={{ height: "12rem", objectFit: "cover" }}
        />
        <div className="position-absolute top-50 start-50 translate-middle bg-white bg-opacity-75 rounded-circle p-3">
          <Icon icon="mdi:play" className="text-primary fs-3" />
        </div>
        <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white small px-2 py-1 rounded-2 m-2">
          {readableSize}
        </div>
      </div>
    );
  }

  if (attachment.type === "audio") {
    return (
      <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light">
        <FileIconWithBackground fileType={attachment.type} size={26} />
        <div className="flex-grow-1 text-truncate">
          <div className="fw-medium text-truncate">{attachment.fileName}</div>
          <div className="text-muted small">{readableSize}</div>
        </div>
        <button
          onClick={handleDownload}
          className="btn btn-sm btn-light rounded-circle"
        >
          <Icon icon="mdi:download" className="fs-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-white hover-shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <FileIconWithBackground fileType={attachment.type} size={26} />
      <div className="flex-grow-1 text-truncate">
        <div className="fw-medium text-sm text-truncate">
          {attachment.fileName}
        </div>
        <div className="text-muted text-xs small">{readableSize}</div>
      </div>
      <button
        onClick={handleDownload}
        className="btn h-100 btn-light rounded-circle"
      >
        <Icon icon="mdi:download" className="fs-5" />
      </button>
    </div>
  );
};

// Custom hook for infinite scroll
const useInfiniteScroll = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  hasMore: boolean,
  isFetching: boolean,
  onLoadMore: () => void
) => {
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop <= SCROLL_THRESHOLD && hasMore && !isFetching) {
        prevScrollHeightRef.current = el.scrollHeight;
        onLoadMore();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetching, onLoadMore, containerRef]);

  const restoreScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el || !prevScrollHeightRef.current) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    });
  }, [containerRef]);

  return { restoreScrollPosition };
};

// Main Component
const TicketComment = ({ ticket }: { ticket: TicketData }) => {
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [
    getComments,
    { data: commentData, isLoading, isFetching, isUninitialized },
  ] = useLazyViewCommentsQuery();

  const totalPages = commentData?.data?.paggination.totalPages || 1;
  const hasMore = page < totalPages;

  const handleLoadMore = useCallback(() => {
    if (isFetching || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);

    getComments({
      ticketId: ticket._id,
      page: nextPage,
      limit: COMMENTS_PER_PAGE,
    });
  }, [page, hasMore, isFetching, ticket._id, getComments]);

  const { restoreScrollPosition } = useInfiniteScroll(
    containerRef,
    hasMore,
    isFetching,
    handleLoadMore
  );

  const [addComment, { isLoading: uploading }] = useAddCommentMutation();

  // Memoized grouped comments
  const groupedComments = useMemo(
    () => groupCommentsByDate(comments),
    [comments]
  );

  // Process new comments from API
  useEffect(() => {
    if (!commentData?.data?.comments) return;

    const newComments = [...commentData.data.comments].reverse();

    setComments((prev) => {
      const merged = [...newComments, ...prev];
      return Array.from(new Map(merged.map((c) => [c._id, c])).values());
    });

    if (page > 1) {
      restoreScrollPosition();
    }
  }, [commentData, page, restoreScrollPosition]);

  // Socket listener
  useEffect(() => {
    if (!socket || !open) return;

    socket.emit("joinRoom", { ticketId: ticket._id, userId: user?._id });

    const handleNewComment = ({
      comment,
      clientId,
    }: {
      comment: commentData & { ticketId: string };
      clientId: string;
    }) => {
      console.log("comment", { comment, clientId });
      if (comment.ticketId !== ticket._id) return;

      setComments((prev) => {
        // 🔁 Replace optimistic comment
        if (clientId) {
          const index = prev.findIndex((c) => c._id === clientId);

          if (index !== -1) {
            const updated = [...prev];
            updated[index] = comment;
            return updated;
          }
        }

        // ➕ Otherwise append normally
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    };

    socket.on("newComment", handleNewComment);

    return () => {
      socket.emit("leaveRoom", { ticketId: ticket._id, userId: user?._id });
      socket.off("newComment", handleNewComment);
    };
  }, [socket, ticket._id, user?._id]);

  const handleAddAttachments = useCallback((files: FileList) => {
    setAttachments((prev) => {
      const newFiles = Array.from(files).slice(
        0,
        MAX_ATTACHMENTS - prev.length
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
      attachments.forEach((file) => formdata.append("attachments", file));

      // Optimistic update
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
        };
        setComments((prev) => [...prev, optimisticComment]);
      }
      setMessage("");
      setAttachments([]);
      const res = await addComment({
        ticketId: ticket._id,
        formdata,
      }).unwrap();
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
        }))
      );
      setViewerIndex(index);
      setViewerOpen(true);
    },
    []
  );

  return (
    <Sheet
      title="Ticket Comments"
      size={600}
      placement="end"
      show={open}
      onClose={() => setOpen(false)}
      onOpen={() => {
        setOpen(true);

        // 🔥 load only once
        if (isUninitialized) {
          setPage(1);
          setComments([]);

          getComments({
            ticketId: ticket._id,
            page: 1,
            limit: COMMENTS_PER_PAGE,
          });
        }
      }}
      bodyclassName="p-0"
      trigger={
        <button
          className="btn btn-street-primary d-flex align-items-center justify-content-center radius-12 p-0"
          style={{ width: "43px", height: "40px" }}
        >
          <Icon icon="mdi:chat-outline" className="text-xl" />
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
                    {group.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className="chat-message-content align-items-start position-relative p-8"
                      >
                        {user?._id !== group.user._id && (
                          <div className="pb-2">
                            <span className="text-xs fw-semibold text-street-primary">
                              {group.user.firstname} {group.user.lastname}
                            </span>
                          </div>
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
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />

                        <div className="px-2 d-flex align-items-center justify-content-end gap-1">
                          <span className="chat-time text-xxs">
                            {dayjs(msg.createdAt).format("hh:mm A")}
                          </span>
                        </div>
                      </div>
                    ))}
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

export default TicketComment;
