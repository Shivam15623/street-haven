// TicketComment.tsx

import {
  useAddTicketCommentMutation,
  useLazyViewTicketCommentsQuery,
} from "../../../../services/ticketApi";
import type { TicketData } from "../../../../interfaces/Ticket";
import EntityComment from "../../../../components/Comments";

const TicketComment = ({ ticket }: { ticket: TicketData }) => {
  const useLazyViewComments = () => {
    const [trigger, result] = useLazyViewTicketCommentsQuery();
    return [
      (args: { page: number; limit: number }) =>
        trigger({ ticketId: ticket._id, ...args }),
      result,
    ] as const;
  };

  const useAddComment = () => {
    const [trigger, result] = useAddTicketCommentMutation();
    return [
      (args: { formdata: FormData }) =>
        trigger({ ticketId: ticket._id, ...args }),
      result,
    ] as const;
  };

  return (
    <EntityComment
      entityId={ticket._id}
      entitySlug={ticket.slug}
      socketRoomPrefix="ticket"
      title="Ticket Comments"
      useLazyViewComments={useLazyViewComments}
      useAddComment={useAddComment}
    />
  );
};

export default TicketComment;