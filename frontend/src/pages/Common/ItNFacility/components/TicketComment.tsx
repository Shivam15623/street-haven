import { useEffect, useRef, useState } from "react";
import Sheet from "../../../../components/child/Sheet";
import { useSocket } from "../../../../hooks/useSocket";
import type { TicketData } from "../../../../interfaces/Ticket";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  useAddCommentMutation,
  useViewCommentsQuery,
  type commentData,
} from "../../../../services/ticketApi";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import QuillEditor from "../../../../components/child/QuillEditor";

dayjs.extend(relativeTime);

// Interface for grouped comments
interface CommentGroup {
  user: commentData["userId"];
  messages: commentData[];
}

interface DateGroupedComments {
  dateLabel: string;
  groups: CommentGroup[];
}
interface Attachment {
  type: "image" | "video" | "audio" | "pdf" | "doc" | "excel" | "zip" | "other";
  fileName: string;
  size: number;
  fileUrl: string;
  thumbnail?: string;
}
// 🔢 Utility function to convert bytes to readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};

const AttachmentPreview = ({ attachment }: { attachment: Attachment }) => {
  // 📸 Image Preview
  const readableSize = formatFileSize(attachment.size);
  const getFileIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      pdf: "mdi:file-pdf-box",
      doc: "mdi:file-word-box",
      excel: "mdi:file-excel-box",
      zip: "mdi:folder-zip",
      image: "mdi:file-image-box",
      video: "mdi:file-video",
      audio: "mdi:file-music",
      other: "mdi:file-outline",
    };

    const colorMap: Record<string, string> = {
      pdf: "text-danger", // red
      doc: "text-primary", // blue
      excel: "text-success", // green
      zip: "text-warning", // yellow/orange
      image: "text-info", // cyan
      video: "text-purple", // or custom class
      audio: "text-secondary",
      other: "text-muted",
    };

    const icon = iconMap[type] || iconMap.other;
    const color = colorMap[type] || colorMap.other;

    return { icon, color };
  };
  const { icon, color } = getFileIcon(attachment.type);
  const handleDownload = async () => {
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

      URL.revokeObjectURL(blobUrl); // Free memory
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (attachment.type === "image") {
    return (
      <div className="position-relative overflow-hidden rounded-3 cursor-pointer">
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

  // 🎥 Video Preview
  if (attachment.type === "video") {
    return (
      <div className="position-relative overflow-hidden rounded-3 cursor-pointer">
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

  // 🎵 Audio Preview
  if (attachment.type === "audio") {
    return (
      <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light">
        <div
          className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle"
          style={{ width: "48px", height: "48px" }}
        >
          <Icon icon="mdi:music" className={`text-primary fs-5 ${color}`} />
        </div>
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

  // 📄 Document (PDF, DOC, etc.)
  return (
    <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-white hover-shadow-sm cursor-pointer">
      <div
        className="d-flex align-items-center justify-content-center bg-light rounded-3"
        style={{ width: "48px", height: "48px" }}
      >
        <Icon icon={icon} className={`fs-4 text-secondary ${color}`} />
      </div>
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
const TicketComment = ({ ticket }: { ticket: TicketData }) => {
  const { socket } = useSocket();
  const { user } = useSelector(selectAuth);

  const [page, setPage] = useState(1); // current page
  const limit = 10; // comments per page

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddAttachments = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 7 - attachments.length); // max 7
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  // Group consecutive messages by user
  const groupComments = (comments: commentData[]): CommentGroup[] => {
    const grouped: CommentGroup[] = [];
    comments.forEach((comment) => {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.user._id === comment.userId._id) {
        lastGroup.messages.push(comment);
      } else {
        grouped.push({ user: comment.userId, messages: [comment] });
      }
    });
    return grouped;
  };

  const [comments, setComments] = useState<commentData[]>([]);
  const [groupedComments, setGroupedComments] = useState<DateGroupedComments[]>(
    []
  );

  const {
    data: commentD,
    isLoading,
    isFetching,
  } = useViewCommentsQuery({
    ticketId: ticket._id,
    page: page,
    limit: limit,
  });
  const totalPages = commentD?.data?.paggination.totalPages || 1;
  const hasMore = page < totalPages;

  // ✅ Load more function
  const handleLoadMore = () => {
    if (hasMore && !isFetching) setPage((p) => p + 1);
  };
  // Group messages by date (e.g., Today, Yesterday, or date)
  const groupCommentsByDate = (comments: commentData[]) => {
    const groups: { dateLabel: string; comments: commentData[] }[] = [];

    const now = dayjs();

    comments.forEach((comment) => {
      const d = dayjs(comment.createdAt);
      let label = "";

      if (d.isSame(now, "day")) label = "Today";
      else if (d.add(1, "day").isSame(now, "day")) label = "Yesterday";
      else label = d.format("DD MMM YYYY");

      const existingGroup = groups.find((g) => g.dateLabel === label);
      if (existingGroup) existingGroup.comments.push(comment);
      else groups.push({ dateLabel: label, comments: [comment] });
    });

    return groups;
  };

  // Update comments when query data arrives
  useEffect(() => {
    if (commentD?.data?.comments) {
      const newComments = commentD.data.comments.slice().reverse(); // oldest first

      // Prepend older comments at the beginning
      const merged = [...newComments, ...comments];

      // Deduplicate
      const uniqueComments = Array.from(
        new Map(merged.map((c) => [c._id, c])).values()
      );
      setComments(uniqueComments);
      const dateGroups = groupCommentsByDate(uniqueComments);
      const groupedByDateAndUser = dateGroups.map((group) => ({
        dateLabel: group.dateLabel,
        groups: groupComments(group.comments),
      }));
      setGroupedComments(groupedByDateAndUser);
    }
  }, [commentD]);

  // Socket listener for new comments
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { ticketId: ticket._id, userId: user?._id });

    socket.on("newComment", (comment: commentData & { ticketId: string }) => {
      if (comment.ticketId !== ticket._id) return;

      setComments((prev) => {
        const merged = [...prev, comment];
        const uniqueComments = Array.from(
          new Map(merged.map((c) => [c._id, c])).values()
        );

        // ✅ Maintain the same structure: date -> user groups
        const dateGroups = groupCommentsByDate(uniqueComments);
        const groupedByDateAndUser = dateGroups.map((group) => ({
          dateLabel: group.dateLabel,
          groups: groupComments(group.comments),
        }));

        setGroupedComments(groupedByDateAndUser);

        return uniqueComments;
      });
    });

    return () => {
      socket.emit("leaveRoom", { ticketId: ticket._id, userId: user?._id });
      socket.off("newComment");
    };
  }, [socket, ticket._id, user?._id]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const [message, setMessage] = useState("");
  const [addComment] = useAddCommentMutation();

  const handleMessageSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      const formdata = new FormData();
      formdata.append("message", message);
      attachments.forEach((file) => {
        formdata.append("attachments", file);
      });

      const res = await addComment({ ticketId: ticket._id, formdata }).unwrap();
      if (res.success) {
        setMessage("");
        setAttachments([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sheet
      title="Ticket Comments"
      size={600}
      placement="end"
      bodyclassName="p-0"
      trigger={
        <button className="btn btn-street-primary d-flex align-items-center justify-content-center">
          <Icon icon="mdi:chat-outline" className="text-xl" />
        </button>
      }
    >
      <div className="d-flex h-100 flex-column">
        <div className="chat-main flex-grow-1 overflow-auto">
          {hasMore && (
            <div className="text-center my-3">
              <button
                disabled={isFetching}
                onClick={handleLoadMore}
                className="btn btn-outline-secondary btn-sm"
              >
                {isFetching ? "Loading..." : "Load older comments"}
              </button>
            </div>
          )}
          {isLoading ? (
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="chat-single-message left mb-2">
                <div className="chat-message-content p-2 bg-light rounded placeholder-glow">
                  <span className="placeholder col-8"></span>
                </div>
              </div>
            ))
          ) : groupedComments.length > 0 ? (
            groupedComments.map((dateGroup) => (
              <div key={dateGroup.dateLabel} className="mb-3 ">
                {/* Date Divider */}
                <div className="text-center text-muted my-5 position-relative">
                  <hr className="m-0 opacity-0" />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary small fw-medium"
                    style={{ fontSize: "12px" }}
                  >
                    {dateGroup.dateLabel}
                  </span>
                </div>

                {/* Messages under this date */}
                {dateGroup.groups.map((group, idx) => (
                  <div
                    key={group.user._id + idx}
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

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className=" space-y-2 gap-2 d-flex flex-column">
                            {msg.attachments.map((attachment, idx) => (
                              <AttachmentPreview
                                key={idx}
                                attachment={attachment}
                              />
                            ))}
                          </div>
                        )}
                        <div
                          className="prose Te py-2 chatpara"
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />

                        <div className="px-2  d-flex align-items-center  justify-content-end gap-1">
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
                  key={idx}
                  className="position-relative d-flex align-items-center gap-2 p-2 bg-secondary bg-opacity-10 rounded"
                  style={{ minWidth: "160px" }}
                >
                  <Icon
                    icon="mdi:file-outline"
                    className="text-muted flex-shrink-0"
                    width="18"
                    height="18"
                  />
                  <span className="text-truncate small flex-grow-1">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-light p-1 d-flex align-items-center justify-content-center"
                    onClick={() =>
                      setAttachments(attachments.filter((_, i) => i !== idx))
                    }
                  >
                    <Icon icon="mdi:close" width="14" height="14" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <form
          className="chat-message-box  p-0 rounded-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleMessageSend();
          }}
        >
          <div className="d-flex flex-column w-100  p-2 ">
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

            <div className="chat-message-box-action w-100 flex-row flex-nowrap gap-1  justify-content-end px-3 py-2 ">
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
                className=" btn btn-light  d-flex align-items-center text-xl"
                onClick={handleFileSelect}
              >
                <Icon icon="ph:link" />
              </button>
              <button
                type="submit"
                className="btn btn-street-primary  text-sm d-flex align-items-center gap-1 "
              >
                {" "}
                Send
                <Icon icon="f7:paperplane" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </Sheet>
  );
};

export default TicketComment;
