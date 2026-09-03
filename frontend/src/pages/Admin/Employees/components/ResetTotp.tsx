import React, { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";

import { showError, showSuccess } from "../../../../utills/toastutills";
import { useResetTotpMutation } from "../../../../services/EmployeeApi";
import { getErrorMessage } from "../../../../utills/utills";

interface ResetTotpProps {
  employee: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

const ResetTotp: React.FC<ResetTotpProps> = ({ employee }) => {
  const [showModal, setShowModal] = useState(false);
  const [resetTotp, { isLoading }] = useResetTotpMutation();

  const handleReset = async () => {
    try {
      const res = await resetTotp({ id: employee._id }).unwrap();
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
        className="btn btn-sm btn-street-warning d-flex align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
        title="Reset 2FA / TOTP"
      >
        <Icon icon="tabler:shield-lock" className="text-xl" />
      </button>

      {/* Modal */}
      <ModalWrapper
        show={showModal}
        title="Reset Two-Factor Authentication"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              onClick={handleReset}
              className="btn btn-street-warning btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset TOTP"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div>
          <p>
            Are you sure you want to reset two-factor authentication for{" "}
            <span className="fw-bold">
              {employee.firstname} {employee.lastname}
            </span>
            ?
          </p>

          <p className="text-danger text-sm mt-2">
            This will invalidate the existing authenticator setup. The user will
            be required to reconfigure 2FA on next login.
          </p>

          <div className="text-street-dark text-sm d-flex flex-column gap-2 mt-3">
            <div className="border rounded p-10 bg-street-card">
              <p className="mb-1 fw-bold">Email: {employee.email}</p>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default ResetTotp;
