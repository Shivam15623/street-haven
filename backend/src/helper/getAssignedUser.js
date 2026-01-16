import TicketCategoryAssignment from "../model/TicketCategoryAssignment.js";

export const getAssignedAgentByCategory = async (category, session) => {
  const assignment = await TicketCategoryAssignment.findOne({
    category,
  }).session(session);


  if (!assignment || !assignment.agents?.length) return null;

  const activeAgents = assignment.agents
    .filter((a) => a.active)
    .sort((a, b) => a.priority - b.priority);


  return activeAgents[0]?.user || null;
};
