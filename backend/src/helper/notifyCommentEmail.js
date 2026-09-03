// helper/notifyCommentEmail.js
import User from "../model/user.js";
import Ticket from "../model/ticket.js";
import Task from "../model/task.js";
import { generateEmailTemplate } from "./EmailsMailer/emailTemplates.js";
import { sendEmail } from "./EmailsMailer/emailSender.js";
import { htmlToText } from "html-to-text";

const ENTITY_MODELS = { Ticket, Task };
const ENTITY_LABELS = { Ticket: "ticket", Task: "task" };

function buildEntityLink(entityType, entitySlug) {
  const base = process.env.DOMAIN;
  return entityType === "Ticket"
    ? `${base}/it_facility?tab=track_tickets&item=${entitySlug}`
    : `${base}/tasks?item=${entitySlug}`; // adjust to your actual task route
}

function snippet(message, maxLen = 140) {
  const text = htmlToText(message || "", { wordwrap: false }).trim();
  return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text;
}

/**
 * Fires mention/reply comment emails. Looks up the entity (Ticket/Task) once
 * to get title + location context for the email, then emails each recipient
 * their own personalized copy.
 *
 * type: "mention" | "reply"
 */
export async function notifyCommentEmail({
  type, // "mention" | "reply"
  recipientIds,
  entityType,
  entityId,
  actorName,
  commentMessage,
}) {
  if (!recipientIds?.length) return;

  const EntityModel = ENTITY_MODELS[entityType];
  if (!EntityModel) return;

  const entity = await EntityModel.findById(entityId)
    .select(entityType === "Ticket" ? "req_title slug location" : "title slug")
    .populate(entityType === "Ticket" ? { path: "location", select: "name" } : "")
    .lean();

  if (!entity) return; // entity deleted/unavailable — skip silently, don't block the comment write path

  const entityTitle = entityType === "Ticket" ? entity.req_title : entity.title;
  const entityLabel = ENTITY_LABELS[entityType];
  const link = buildEntityLink(entityType, entity.slug);
  const locationName = entityType === "Ticket" ? entity.location?.name : null;
  const commentSnippet = snippet(commentMessage);

  const users = await User.find({ _id: { $in: recipientIds } })
    .select("firstname lastname email")
    .lean();

  const templateType = type === "mention" ? "comment_mention" : "comment_reply";

  await Promise.all(
    users.map((user) => {
      const emailContent = generateEmailTemplate({
        type: templateType,
        data: {
          recipientName: `${user.firstname} ${user.lastname}`,
          mentionedByName: actorName, // used by comment_mention
          repliedByName: actorName, // used by comment_reply
          entityLabel,
          entityTitle,
          location: locationName,
          commentSnippet,
          link,
        },
      });
      return sendEmail({ to: user.email, ...emailContent }).catch((err) =>
        console.error(`comment email failed for ${user.email}:`, err)
      );
    })
  );
}