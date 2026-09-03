export function normalizeSystemNotification(
  n,
  { isRead = false, readAt = null } = {},
) {
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
  if (n.type === "reply")
    return `${names[0] || "Someone"} replied to your comment`;

  let actorText;
  if (total <= 1) actorText = names[0] || "Someone";
  else if (total === 2) actorText = names.slice(0, 2).join(" and ");
  else actorText = `${names[0]} and ${total - 1} others`;

  return `${actorText} added ${n.commentCount} comment${n.commentCount === 1 ? "" : "s"}`;
}

// Builds the entity payload from an already-loaded Ticket/Task document.
// No DB access here — purely a shape transform.
export function normalizeCommentEntity(entityType, entity) {
  if (!entity) return null;

  const isTicket = entityType === "Ticket";

  return {
    type: entityType,
    id: entity._id.toString(),
    displayId: isTicket
      ? `TICKET-${String(entity.ticketNumber).padStart(5, "0")}`
      : `TASK-${String(entity.taskNumber).padStart(5, "0")}`,
    slug: entity.slug,
    title: isTicket ? entity.req_title : entity.title,
  };
}

export function normalizeCommentNotification(
  n,
  { entity = null } = {},
) {
  return {
    _id: n._id.toString(),
    source: "comment",

    title: null,
    message: n.formattedMessage,

    severity: (n.priority === "high" ? "warning" : "info"),

    link: entity
      ? `/${n.entityType.toLowerCase()}/${entity.slug}`
      : `/${n.entityType.toLowerCase()}/${n.entityId.toString()}`,

    isRead: n.isRead,
    readAt: n.readAt,

    createdAt: n.createdAt,
    sortDate: n.isRead && n.readAt ? n.readAt : n.createdAt,

    // comment-only fields
    entityType: n.entityType,
    entityId: n.entityId.toString(),

    entity,

    commentId: n.commentId ? n.commentId.toString() : null,
    notifType: n.type,
    priority: n.priority,
    commentCount: n.commentCount,
  };
}