import React, { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useDeleteEmployeeMutation } from "../../../../services/EmployeeApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

interface DeleteEmployeeProps {
  employee: {
    _id: string;
    role: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

const DeleteEmployee: React.FC<DeleteEmployeeProps> = ({ employee }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteEmployee({ id: employee._id }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        className="btn btn-sm btn-street-delete d-flex flex-row align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
        title="Delete Employee"
      >
        <Icon icon="tabler:trash" className="text-xl" />
      </button>

      {/* Modal */}
      <ModalWrapper
        show={showModal}
        title="Delete Employee"
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
        <div>
          <p>
            Are you sure you want to delete{" "}
            <span className="fw-bold">
              {employee.firstname} {employee.lastname}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="text-street-dark text-sm d-flex flex-column gap-2 mt-3">
            <div
              className="border rounded p-10 "
              style={{
                backgroundColor: "var(--street-bg-f4)",
              }}
            >
              <p className="fw-bold">Role: {employee.role}</p>
              <p className="mb-1">Email: {employee.email}</p>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default DeleteEmployee;
