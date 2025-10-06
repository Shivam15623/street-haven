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

    socket.emit("joinRoom", ticket._id);

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
      socket.emit("leaveRoom", ticket._id);
      socket.off("newComment");
    };
  }, [socket, ticket._id]);

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
      trigger={
        <button className="btn btn-street-primary d-flex align-items-center justify-content-center">
          <Icon icon="mdi:chat-outline" className="text-xl" />
        </button>
      }
    >
      <div className="d-flex h-100 flex-column">
        <div className="chat-main flex-grow-1 overflow-auto mb-2">
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
                  <hr className="m-0" />
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
                    className={`chat-single-message d-flex flex-column gap-2 mb-0 ${
                      user?._id === group.user._id
                        ? "right"
                        : "left align-items-start"
                    }`}
                  >
                    {group.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className="chat-message-content align-items-start position-relative p-10"
                      >
                        <p>{msg.message}</p>

                        {msg.attachments?.map((att, i) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            att
                          );
                          return (
                            <div key={i} className="d-inline-block me-1 mb-1">
                              {isImage ? (
                                <img
                                  src={att}
                                  alt={`attachment-${i}`}
                                  className="img-thumbnail"
                                  style={{
                                    maxWidth: "100px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => window.open(att, "_blank")}
                                />
                              ) : (
                                <a
                                  href={att}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="d-flex align-items-center gap-1"
                                >
                                  <Icon
                                    icon="mdi:file-outline"
                                    className="text-xl text-muted"
                                  />
                                  <span className="small text-primary">
                                    View file
                                  </span>
                                </a>
                              )}
                            </div>
                          );
                        })}

                        <span
                          className={`chat-time position-absolute w-fit d-flex gap-1  text-muted ${
                            user?._id === msg.userId._id
                              ? "end-100 me-8"
                              : "start-100 ms-8"
                          }`}
                          style={{ top: "20%", transform: "translateY(-50%)" }}
                        >
                          {dayjs(msg.createdAt).format("hh:mm")}{" "}
                          <span>{dayjs(msg.createdAt).format("A")}</span>
                        </span>
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

        <form
          className="chat-message-box px-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleMessageSend();
          }}
        >
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Write message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) =>
              e.target.files && handleAddAttachments(e.target.files)
            }
          />
          <div className="chat-message-box-action ">
            <button
              type="button"
              className="text-xl"
              onClick={handleFileSelect}
            >
              <Icon icon="ph:link" />
            </button>

            <button
              type="submit"
              className="btn btn-street-primary d-flex align-items-center gap-1 "
            >
              Send <Icon icon="f7:paperplane" />
            </button>
          </div>
        </form>
      </div>
    </Sheet>
  );
};

export default TicketComment;
