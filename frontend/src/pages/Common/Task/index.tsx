import { useState } from "react";
import TaskTable from "./components/TaskTable";
import type { ITask } from "../../../services/taskApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import ActionTaskModal from "./components/ActionTaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";

const Tasks = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const handleCreate = () => {
    setMode("create");
    setSelectedTask(null);
    setShowModal(true);
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
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            Tasks
          </p>
          <p className="fw-normal text-sm xs:text-md">
            Submit requests for IT support and facility maintenance
          </p>
        </div>
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleCreate}
          >
            <Icon icon="mdi:plus" />
            Create Task
          </button>
        </div>
      </div>
      <TaskTable onEdit={handleEdit} onDelete={handleDelete} />
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
    </div>
  );
};

export default Tasks;
