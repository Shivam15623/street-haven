import React, { useState } from "react";

import { Icon } from "@iconify/react/dist/iconify.js";

import dayjs from "dayjs";
import { useDeletemeetingMinutesMutation } from "../../../../../services/meetingminutesApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { getErrorMessage } from "../../../../../utills/utills";

type DeleteMeetingProps = {
  id: string;
  title: string;
  meetingDate: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // bytes
    fileType: string;
  };
};

const DeleteMeetingMinutes: React.FC<DeleteMeetingProps> = ({
  id,
  attachment,
  meetingDate,
  title,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteMeeting, { isLoading }] = useDeletemeetingMinutesMutation();
  const date = dayjs(meetingDate);
  const handleDelete = async () => {
    try {
      const res = await deleteMeeting({ id }).unwrap();
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
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline-danger d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
      >
        <Icon icon="lucide:trash-2" />
      </button>

      {/* Delete Confirmation Modal */}
      <ModalWrapper
        show={showModal}
        title="Delete Meeting Minutes"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
        onHide={() => setShowModal(false)}
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
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="text-street-dark text-sm d-flex flex-column gap-2">
          <p>
            Are you sure you want to delete the following meeting minutes? This
            action <strong>cannot</strong> be undone.
          </p>

          {/* Meeting Info Card */}
          <div
            className="border rounded p-3"
            style={{
              backgroundColor: "var(--street-bg-f4)",
            }}
          >
            <p className="fw-bold mb-1">{title}</p>
            <p className="mb-1">
              <span className="fw-semibold">Date:</span>{" "}
              {date.format("MMMM D, YYYY")}
            </p>
            {attachment && (
              <p className="mb-0">
                <span className="fw-semibold">File:</span> {attachment.fileName}{" "}
                ({(attachment.size / 1024 / 1024).toFixed(2)} MB,{" "}
                {attachment.fileType} )
              </p>
            )}
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default DeleteMeetingMinutes;
