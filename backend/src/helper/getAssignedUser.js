import TicketCategoryAssignment from "../model/TicketCategoryAssignment.js";

export const getAssignedAgentByCategory = async (category, session) => {
  const assignment = await TicketCategoryAssignment.findOne({
    category,
  }).session(session);
  console.log(assignment, !assignment || !assignment.agents?.length);

  if (!assignment || !assignment.agents?.length) return null;

  const activeAgents = assignment.agents
    .filter((a) => a.active)
    .sort((a, b) => a.priority - b.priority);
  console.log("active", activeAgents);

  return activeAgents[0]?.user || null;
};
