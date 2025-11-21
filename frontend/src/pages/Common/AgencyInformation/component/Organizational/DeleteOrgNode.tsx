import React from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import {
  useDeleteNodeMutation,
  type OrgNodeData,
} from "../../../../../services/orgApi";
import { showSuccess } from "../../../../../utills/toastutills";

interface DeleteOrgNodeProps {
  nodedata: OrgNodeData;
}

const DeleteOrgNode: React.FC<DeleteOrgNodeProps> = ({ nodedata }) => {
  const [showModal, setShowModal] = React.useState(false);
  const [deleteNode, { isLoading }] = useDeleteNodeMutation();

  const { _id: nodeId, department, label, reportsTo, supervises } = nodedata;

  const handleDelete = async () => {
    try {
      const res = await deleteNode({ id: nodeId }).unwrap();
      if (res.success) {
        showSuccess("Role deleted successfully");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        className="btn btn-sm btn-street-delete w-100 d-flex text-sm flex-row align-items-center justify-content-center radius-12"
        onClick={() => setShowModal(true)}
      >
        Delete
      </button>

      {/* Confirmation Modal */}
      <ModalWrapper
        show={showModal}
        title="Delete Role"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <button
              onClick={handleDelete}
              className="btn btn-street-delete btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="d-flex flex-column gap-2 text-street-dark">
          <p className="mb-1">
            Are you sure you want to delete the role <strong>{label}</strong>?
          </p>
          {department && (
            <p className="text-sm text-muted">
              Department: <strong>{department}</strong>
            </p>
          )}
          {supervises.length > 0 && (
            <p className="text-sm text-danger">
              This role supervises {supervises.length}{" "}
              {supervises.length === 1 ? "position" : "positions"}. Deleting it
              will remove these relationships.
            </p>
          )}
          {reportsTo && (
            <p className="text-sm text-muted">
              Reports to: <strong>{reportsTo.label}</strong>
            </p>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default DeleteOrgNode;
