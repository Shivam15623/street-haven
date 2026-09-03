import React from "react";
import { Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify"; // remove if using a different toast lib
import { useDeleteTaskMutation, type ITask } from "../../../../services/taskApi";
import ModalWrapper from "../../../../components/child/ModalWrapper";



interface DeleteTaskModalProps {
  show: boolean;
  onHide: () => void;
  task: ITask | null;
  onSuccess?: (taskId: string) => void;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  show,
  onHide,
  task,
  onSuccess,
}) => {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    if (!task) return;

    try {
      const res = await deleteTask(task._id).unwrap();
      toast.success(res.message || "Task deleted successfully");
      onSuccess?.(task._id);
      onHide();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete task. Please try again.");
    }
  };

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title="Delete Task"
      size="md"
      isLoading={isLoading}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary  text-sm d-flex flex-row align-items-center gap-8 justify-content-center"
            onClick={onHide}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger text-sm d-flex flex-row align-items-center gap-8 justify-content-center"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && (
              <Spinner animation="border" size="sm" role="status" />
            )}
            Delete Task
          </button>
        </>
      }
    >
      <div className="d-flex flex-column align-items-center text-center gap-12 py-8">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10"
          style={{ width: 56, height: 56 }}
        >
          <Icon icon="mdi:alert-outline" className="text-danger" style={{ fontSize: 28 }} />
        </div>

        <h6 className="mb-0 fw-semibold">
          Are you sure you want to delete this task?
        </h6>

        {task && (
          <p className="mb-0 text-sm text-street-dark">
            "<strong>{task.title}</strong>" assigned to{" "}
            <strong>
              {task.assignedTo?.firstname} {task.assignedTo?.lastname}
            </strong>{" "}
            will be permanently removed. This action cannot be undone.
          </p>
        )}
      </div>
    </ModalWrapper>
  );
};

export default DeleteTaskModal;