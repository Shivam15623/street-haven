import React from "react";
import { FileIconWithBackground } from "./FileIcon";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { FileItem } from "../../interfaces/fileinterface";
import { useEventdeleteDocumentMutation } from "../../services/EventApi";
import { showSuccess } from "../../utills/toastutills";

interface FileCardProps {
  file: FileItem;
  onClick: () => void;
  eventId: string;
}

const FileCard: React.FC<FileCardProps> = ({ file, onClick, eventId }) => {
  const isImage = file.fileType === "image";
  const extension = file.fileType;
  const [deleteDoc, { isLoading }] = useEventdeleteDocumentMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    try {
      const res = await deleteDoc({
        eventId,
        documentId: file._id,
      }).unwrap();

      if (res.success) {
        showSuccess(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      onClick={!isLoading ? onClick : undefined}
      className="
        card file-card
        position-relative
        shadow-sm 
        border 
        rounded 
        h-100 
        cursor-pointer
      "
      style={{
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.6 : 1,
        pointerEvents: isLoading ? "none" : "auto",
      }}
    >
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="delete-btn position-absolute rounded-circle p-8 btn btn-street-delete d-flex align-items-center justify-content-center"
        title="Delete file"
        style={{
          right: 5,
          top: 5,
          zIndex: 10,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? (
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          ></div>
        ) : (
          <Icon icon="lucide:trash-2" className="text-sm" />
        )}
      </button>

      {/* IMAGE PREVIEW */}
      {isImage ? (
        <div
          className="overflow-hidden rounded-top"
          style={{ aspectRatio: "4 / 3" }}
        >
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      ) : (
        <div
          className="
            d-flex flex-column 
            align-items-center 
            justify-content-center 
            p-3
          "
          style={{ aspectRatio: "4 / 3" }}
        >
          <FileIconWithBackground fileType={file.fileType} size={28} />
          <span className="badge bg-secondary bg-opacity-50 mt-2">
            {extension}
          </span>
        </div>
      )}

      {/* FILE NAME */}
      <div className="card-body py-2 border-top">
        <p className="card-text text-truncate mb-0">{file.fileName}</p>
      </div>
    </div>
  );
};

export default FileCard;
