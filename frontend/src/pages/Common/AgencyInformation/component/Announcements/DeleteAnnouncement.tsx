import React from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { showSuccess } from "../../../../../utills/toastutills";
import { useDeleteAnnouncementMutation } from "../../../../../services/AnnouncementApi";

type DeleteAnnouncementProps = {
  id: string;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const DeleteAnnouncement: React.FC<DeleteAnnouncementProps> = ({
  id,
  show,
  onHide,
  onSuccess,
}) => {
  const [deleteAnnouncement, { isLoading }] = useDeleteAnnouncementMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteAnnouncement(id).unwrap();
      if (res.success) {
        showSuccess(res.message);
        onSuccess?.();
        onHide();
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  return (
    <ModalWrapper
      show={show}
      title="Delete Announcement"
      size="lg"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16"
      bodyClassName="p-0 d-flex flex-column gap-16"
      footerClassName="pt-16 px-0 pb-0"
      onHide={onHide}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-danger btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
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
        Are you sure you want to delete this announcement? This action cannot be
        undone.
      </p>
    </ModalWrapper>
  );
};

export default DeleteAnnouncement;
