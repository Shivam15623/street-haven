import dayjs from "dayjs";
import type { commentData } from "../../services/ticketApi";
interface CommentGroup {
  user: commentData["userId"];
  messages: commentData[];
}

interface DateGroupedComments {
  dateLabel: string;
  groups: CommentGroup[];
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const getDateLabel = (date: dayjs.Dayjs, now: dayjs.Dayjs): string => {
  if (date.isSame(now, "day")) return "Today";
  if (date.add(1, "day").isSame(now, "day")) return "Yesterday";
  return date.format("DD MMM YYYY");
};

export const groupCommentsByUser = (
  comments: commentData[],
): CommentGroup[] => {
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

export const groupCommentsByDate = (
  comments: commentData[],
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
