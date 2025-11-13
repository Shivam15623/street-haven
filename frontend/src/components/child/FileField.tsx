import React, { useState } from "react";
import { Icon } from "@iconify/react";
import FileUploader from "./FileUploader";

interface FileFieldProps {
  isEdit: boolean;
  existingFile?: { fileName: string; fileUrl: string; fileType?: string };
  name: string;
  fieldLabel: string;
  accept?: string;
  multiple?: boolean;
  showPreview?: boolean;
}

const FileField: React.FC<FileFieldProps> = ({
  isEdit,
  existingFile,
  name,
  fieldLabel,
  accept,
  multiple,
  showPreview,
}) => {
  const [editMode, setEditMode] = useState(false);

  const renderFileIcon = (type?: string) => {
    if (!type) return "mdi:file-outline";
    if (type.startsWith("image/")) return "mdi:file-image";
    if (type === "application/pdf") return "mdi:file-pdf";
    if (type.includes("zip")) return "mdi:file-zip";
    if (type.startsWith("video/")) return "mdi:file-video";
    return "mdi:file-outline";
  };

  if (isEdit && existingFile && !editMode) {
    return (
      <div className="d-flex flex-column gap-1">
        <label className="fw-medium mb-2 text-street-dark form-label">
          {fieldLabel}
        </label>
        <div className="d-flex align-items-center gap-2">
          <Icon
            icon={renderFileIcon(existingFile.fileType)}
            className="text-primary fs-5"
          />
          <a
            href={existingFile.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-street-primary fw-medium"
          >
            {existingFile.fileName}
          </a>
          <Icon
            icon="mdi:pencil"
            className="cursor-pointer text-gray-600 fs-5"
            onClick={() => setEditMode(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <FileUploader
      name={name}
      label={fieldLabel}
      accept={accept}
      multiple={multiple}
      showPreview={showPreview}
    />
  );
};

export default FileField;
