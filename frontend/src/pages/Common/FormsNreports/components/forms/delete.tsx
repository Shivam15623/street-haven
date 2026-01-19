import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import ModalWrapper from "../../../../../components/child/ModalWrapper";

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  isLoading: boolean;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  onClose,
  title,
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  isLoading,
  onConfirm,
}) => {
  return (
    <ModalWrapper
      show={show}
      onHide={onClose}
      size="lg"
      title={title}
      headerClassName="text-xl text-street-dark"
      isLoading={isLoading}
      footer={
        <div className="d-flex justify-content-end gap-12 ">
          <button
            className="btn btn-street-neutral btn-street-lg d-sm-flex d-none text-sm justify-content-center align-items-center radius-12"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className="btn btn-street-delete btn-street-lg d-flex  text-sm justify-content-center align-items-center radius-12 "
            onClick={onConfirm}
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      }
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading}
          variant="spinner"
          size="lg"
          message="Deleting..."
        />
      }
    >
      <p className="text-street-muted">{description}</p>
    </ModalWrapper>
  );
};

export default DeleteConfirmModal;
