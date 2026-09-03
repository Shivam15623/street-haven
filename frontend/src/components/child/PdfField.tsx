import { useState } from "react";
import PdfUploader from "./PdfUploader"; // your PDF upload component
import { Icon } from "@iconify/react"; // example for edit icon

const PdfField = ({
  isEdit,
  isRequired = false,
  existingPdf,
  name,
  fieldLabel,
}: {
  isEdit: boolean;
  existingPdf?: { fileName: string; fileUrl: string };
  name: string;
  isRequired?: boolean;
  fieldLabel: string;
}) => {
  const [editMode, setEditMode] = useState(false);

  if (isEdit && existingPdf && !editMode) {
    return (
      <div className="flex items-center gap-2">
        {editMode ? (
          <PdfUploader name={name} label={fieldLabel} />
        ) : (
          <p>
            <span className="fw-medium mb-2 text-street-dark form-label">
              {fieldLabel}{" "}
              {isRequired && <span className="text-danger">*</span>}
            </span>
            :
            <a
              href={existingPdf.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-street-primary cursor-pointer"
            >
              {existingPdf.fileName}
            </a>
            <Icon
              icon="mdi:pencil"
              className="cursor-pointer ms-2 text-gray-600"
              onClick={() => setEditMode(true)}
            />
          </p>
        )}
      </div>
    );
  }

  return <PdfUploader name={name} label={fieldLabel} />;
};

export default PdfField;
