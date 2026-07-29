// TaskComment.tsx

import EntityComment from "../../../../components/Comments";
import {
  useAddTaskCommentMutation,
  useLazyViewTaskCommentsQuery,
  type ITask,
} from "../../../../services/taskApi";

const TaskComment = ({ task }: { task: ITask }) => {
  const useLazyViewComments = () => {
    const [trigger, result] = useLazyViewTaskCommentsQuery();
    return [
      (args: { page: number; limit: number }) =>
        trigger({ taskId: task._id, ...args }),
      result,
    ] as const;
  };

  const useAddComment = () => {
    const [trigger, result] = useAddTaskCommentMutation();
    return [
      (args: { formdata: FormData }) =>
        trigger({ taskId: task._id, ...args }),
      result,
    ] as const;
  };

  return (
    <EntityComment
      entityId={task._id}
      socketRoomPrefix="task"
      title="Task Comments"
      useLazyViewComments={useLazyViewComments}
      useAddComment={useAddComment}
    />
  );
};

export default TaskComment;