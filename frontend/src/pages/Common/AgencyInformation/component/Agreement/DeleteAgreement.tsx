import React from "react";
import { useDeleteAgreementMutation } from "../../../../../services/AgreementApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { getErrorMessage } from "../../../../../utills/utills";

type DeleteAgreementProps = {
  id: string;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const DeleteAgreement: React.FC<DeleteAgreementProps> = ({
  id,
  show,
  onHide,
  onSuccess,
}) => {
  const [deleteAgreement, { isLoading }] = useDeleteAgreementMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteAgreement({ id }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        onSuccess?.();
        onHide();
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={show}
      title="Delete Agreement"
      size="lg"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16"
      bodyClassName="p-0 d-flex flex-column gap-16"
      footerClassName="pt-16 px-0 pb-0"
      onHide={onHide}
      footer={
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-street-delete btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      }
    >
      <p className="text-street-dark text-sm">
        Are you sure you want to delete this agreement? This action cannot be
        undone.
      </p>
    </ModalWrapper>
  );
};

export default DeleteAgreement;
