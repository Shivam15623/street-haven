import { useState } from "react";
import TaskTable from "./components/TaskTable";
import type { ITask } from "../../../services/taskApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import ActionTaskModal from "./components/ActionTaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";
import "./task.css";
import TaskDetailDrawer from "./components/TaskDetails";
const Tasks = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const handleCreate = () => {
    setMode("create");
    setSelectedTask(null);
    setShowModal(true);
  };
  const handleView = (task: ITask) => {
    setSelectedTask(task);
    setShowDetails(true);
  };
  const handleEdit = (task: ITask) => {
    setMode("edit");
    setSelectedTask(task);
    setShowModal(true);
  };
  const handleDelete = (task: ITask) => {
    setSelectedTask(task);
    setShowDelete(true);
  };
  return (
    <div className="d-flex flex-column gap-4">
      {" "}
      <div className="d-flex flex-row justify-content-between align-items-center">
        <div className="d-flex flex-column gap-2">
          {" "}
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            {" "}
            Tasks{" "}
          </p>{" "}
          <p className="fw-normal text-sm xs:text-md">
            {" "}
            View and manage your assigned tasks and responsibilities{" "}
          </p>{" "}
        </div>
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-street-primary text-sm d-flex flex-row align-items-center gap-2 justify-content-center radius-12"
            style={{ minWidth: "43px", minHeight: "40px" }}
            onClick={handleCreate}
          >
            <Icon icon="mdi:plus" />
            Create Task
          </button>
        </div>
      </div>
      <TaskTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        OnView={handleView}
      />
      <ActionTaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={mode}
        task={selectedTask}
      />
      <DeleteTaskModal
        show={showDelete}
        task={selectedTask}
        onHide={() => setShowDelete(false)}
      />
      {selectedTask && (
        <TaskDetailDrawer
          onClose={() => setShowDetails(false)}
          open={showDetails}
          taskId={selectedTask._id}
        />
      )}
    </div>
  );
};

export default Tasks;
