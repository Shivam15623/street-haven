

import ModalWrapper from "../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

import { useChangeEmployeePasswordMutation } from "../../../../services/EmployeeApi";

interface ChangeEmployeePasswordProps {
  employeeId: string;
  employeeName?: string;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ChangeEmployeePassword = ({
  employeeId,
  employeeName,
  showModal,
  setShowModal,
}: ChangeEmployeePasswordProps) => {
  const [changeEmployeePassword, { isLoading }] =
    useChangeEmployeePasswordMutation();

  const handleResetPassword = async () => {
    try {
      const res = await changeEmployeePassword({
        id: employeeId,
      }).unwrap();

      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={showModal}
      title="Reset Password"
      size="md"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={() => setShowModal(false)}
      isLoading={isLoading}
      ModalLoader={
        <FormSubmissionLoader isLoading={isLoading} variant="spinner" />
      }
      footer={
        <div className="d-flex justify-content-end gap-3">
          <button
            type="button"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      }
    >
      <p className="m-0">
        This will generate a new temporary password for
        {employeeName ? ` ${employeeName}` : " this employee"} and email it to
        them. Their current password will stop working immediately.
      </p>
      <p className="m-0 text-street-neutral text-sm">
        You won't see the new password — it's sent directly to their inbox.
      </p>
    </ModalWrapper>
  );
};

export default ChangeEmployeePassword;
