import React from "react";
import { useDeleteLocationMutation } from "../../../../../services/locationApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";


type DeleteLocationProps = {
  locationId: string;
  locationName: string;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const DeleteLocation: React.FC<DeleteLocationProps> = ({
  locationId,
  locationName,
  show,
  onHide,
  onSuccess,
}) => {
  const [deleteLocation, { isLoading }] = useDeleteLocationMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteLocation(locationId).unwrap();
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
      title="Deactivate Location"
      size="md"
      show={show}
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={onHide}
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading}
          variant="spinner"
          message="Deactivating..."
          subMessage="Please wait"
        />
      }
      isLoading={isLoading}
      footer={
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-street-danger btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? "Deactivating..." : "Deactivate"}
          </button>
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      }
    >
      <p className="text-sm text-street-dark mb-0">
        Are you sure you want to deactivate <strong>{locationName}</strong>?
        This won't permanently delete the location — you can reactivate it
        later.
      </p>
    </ModalWrapper>
  );
};

export default DeleteLocation;