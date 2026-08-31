export function normalizeSystemNotification(n, { isRead = false, readAt = null } = {}) {
  return {
    _id: n._id.toString(),
    source: "system",
    title: n.title,
    message: n.message,
    severity: n.severity || "info",
    link: n.link || null,
    isRead,
    readAt,
    createdAt: n.createdAt,
    sortDate: isRead && readAt ? readAt : n.createdAt,
  };
}
export function formatActivityText(n) {
  const names = n.actorNames || [];
  const total = n.uniqueActorCount ?? names.length;

  if (n.type === "mention") return `${names[0] || "Someone"} mentioned you`;
  if (n.type === "reply") return `${names[0] || "Someone"} replied to your comment`;

  let actorText;
  if (total <= 1) actorText = names[0] || "Someone";
  else if (total === 2) actorText = names.slice(0, 2).join(" and ");
  else actorText = `${names[0]} and ${total - 1} others`;

  return `${actorText} added ${n.commentCount} comment${n.commentCount === 1 ? "" : "s"}`;
}
export function normalizeCommentNotification(n) {
  return {
    _id: n._id.toString(),
    source: "comment",
    title: null,
    message: n.formattedMessage, // caller must run formatActivityText first
    severity: n.priority === "high" ? "warning" : "info",
    link: `/${n.entityType.toLowerCase()}/${n.entityId}`,
    entityType: n.entityType,
    entityId: n.entityId.toString(),
    commentId: n.commentId ? n.commentId.toString() : null,
    notifType: n.type,
    priority: n.priority,
    commentCount: n.commentCount,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
    sortDate: n.isRead && n.readAt ? n.readAt : n.createdAt,
  };
}