import React, { useState } from "react";
import { useDeleteManualsMutation } from "../../../../services/ProgramManualApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { FileType } from "../../../../interfaces/fileinterface";
import { getErrorMessage } from "../../../../utills/utills";
import DOMPurify from "dompurify";
type DeleteMannualsProps = {
  id: string;
  title: string;
  description: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // bytes
    fileType: FileType;
  };
};

const DeleteMannuals: React.FC<DeleteMannualsProps> = ({
  id,
  title,
  description,
  attachment,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteMannual, { isLoading }] = useDeleteManualsMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteMannual(id).unwrap();
      if (res.success) {
        showSuccess(res.message);

        setShowModal(false);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline-danger d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
      >
        <Icon icon="lucide:trash-2" />
      </button>
      <ModalWrapper
        show={showModal}
        title="Delete Training Material"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
        onHide={() => setShowModal(false)}
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
              className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="text-street-dark text-sm d-flex flex-column gap-2">
          <p>
            Are you sure you want to delete this training material? This action
            cannot be undone.
          </p>
          <div
            className="border rounded p-3 "
            style={{
              backgroundColor: "var(--street-bg-f4)",
            }}
          >
            <p className="fw-bold">{title}</p>
            <div
              className="parse Te"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description),
              }}
            />
            <p className="mb-0">
              <span className="fw-semibold">File:</span> {attachment?.fileName}{" "}
              ({(attachment?.size / 1024 / 1024).toFixed(2)} MB,{" "}
              {attachment?.fileType} type)
            </p>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default DeleteMannuals;
