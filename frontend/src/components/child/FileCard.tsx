import React from "react";

import type { FileItem } from "../../pages/Common/Events/components/EventDocuments";
import { FileIconWithBackground } from "./FileIcon";

interface FileCardProps {
  file: FileItem;
  onClick: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onClick }) => {
  const isImage = file.fileType === "image";
  const extension = file.fileType;

  return (
    <div
      onClick={onClick}
      className="
        card 
        shadow-sm 
        border 
        rounded 
        h-100 
        cursor-pointer 
        file-card-hover 
      "
      style={{ cursor: "pointer" }}
    >
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
        /* ICON PREVIEW */
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
          <span className="badge bg-secondary bg-opacity-50 mt-2">{extension}</span>
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
