import type { User } from "../../../../interfaces/AuthInterfaces";
import type { TicketData } from "../../../../interfaces/Ticket";

export type TicketRelationship = "creator" | "manager" | "assignee" | "admin";
interface TicketContext {
  ticket: TicketData;
  currentUser?: User | null;
}
export const getUserRelationships = (
  ticket: TicketData,
  currentUser?: User | null,
): Set<TicketRelationship> => {
  const relationships = new Set<TicketRelationship>();
  if (!currentUser) return relationships;

  if (ticket.createdBy?._id === currentUser._id) relationships.add("creator");
  if (ticket.assignedTo?._id === currentUser._id) relationships.add("assignee");
  if (ticket.location?.managers?.includes(currentUser._id))
    relationships.add("manager");
  if (currentUser.role === "admin") relationships.add("admin");

  return relationships;
};

type TicketStatus = TicketData["status"];
type TicketAction =
  | "chat"
  | "approve"
  | "reject"
  | "cancel"
  | "edit"
  | "start"
  | "complete";
interface TicketActionRule {
  action: TicketAction;
  allowedStatuses: TicketStatus[];
  requiredRelationships: TicketRelationship[]; // OR — any one qualifies
  exclude?: (ctx: RuleContext) => boolean; // veto even if otherwise allowed
}

interface RuleContext {
  ticket: TicketData;
  currentUser?: User | null;
  relationships: Set<TicketRelationship>;
}

const ALL_STATUSES: TicketStatus[] = [
  "Open",
  "Approved",
  "In Progress",
  "Completed",
  "Rejected",
  "Closed",
];

const TICKET_ACTION_RULES: TicketActionRule[] = [
  {
    action: "chat",
    allowedStatuses: ALL_STATUSES,
    requiredRelationships: ["creator", "manager", "assignee", "admin"],
  },
  {
    action: "edit",
    allowedStatuses: ["Open"],
    requiredRelationships: ["creator", "manager", "assignee", "admin"],
  },
  {
    action: "cancel",
    allowedStatuses: ["Open"],
    requiredRelationships: ["creator"],
  },
  {
    action: "approve",
    allowedStatuses: ["Open"],
    requiredRelationships: ["manager"],
    // prevent self-approval even if the manager also created it
    exclude: (ctx) => ctx.relationships.has("creator"),
  },
  {
    action: "reject",
    allowedStatuses: ["Open"],
    requiredRelationships: ["manager"],
    exclude: (ctx) => ctx.relationships.has("creator"),
  },
  {
    action: "start",
    allowedStatuses: ["Approved"],
    requiredRelationships: ["assignee"],
  },
  {
    action: "complete",
    allowedStatuses: ["In Progress"],
    requiredRelationships: ["assignee"],
  },
];

export const getTicketActions = ({
  ticket,
  currentUser,
}: TicketContext): TicketAction[] => {
  const relationships = getUserRelationships(ticket, currentUser);
  const ctx: RuleContext = { ticket, currentUser, relationships };

  return TICKET_ACTION_RULES.filter((rule) =>
    rule.allowedStatuses.includes(ticket.status),
  )
    .filter((rule) =>
      rule.requiredRelationships.some((r) => relationships.has(r)),
    )
    .filter((rule) => !rule.exclude?.(ctx))
    .map((rule) => rule.action);
};
