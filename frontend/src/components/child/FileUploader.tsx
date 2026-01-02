import React, { useRef, useState } from "react";
import { Form as BootstrapForm } from "react-bootstrap";
import { useField, useFormikContext } from "formik";

interface FileUploaderProps {
  name: string;
  label?: string;
  accept?: string; // e.g. "image/*,application/pdf"
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  showPreview?: boolean;
}

interface FileUploaderFormValues {
  [key: string]: File | File[] | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  name,
  label,
  accept = "*/*",
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 10,
  showPreview = true,
}) => {
  const { setFieldValue, touched, errors } =
    useFormikContext<FileUploaderFormValues>();
  const [field] = useField<File | File[] | null>(name);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);

    // Validate file count
    if (fileArray.length > maxFiles) {
      alert(`You can upload only up to ${maxFiles} files.`);
      return;
    }

    // Validate file size
    const validFiles = fileArray.filter(
      (f) => f.size / 1024 / 1024 <= maxSizeMB
    );

    if (validFiles.length !== fileArray.length) {
      alert(`Each file must be under ${maxSizeMB} MB.`);
    }

    setFieldValue(name, multiple ? validFiles : validFiles[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const renderPreview = () => {
    if (!showPreview || !field.value) return null;

    const files = multiple ? (field.value as File[]) : [field.value as File];

    return (
      <div className="d-flex flex-wrap gap-2 mt-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="d-flex flex-row align-items-center gap-2 border rounded p-2 bg-neutral-100 position-relative"
          >
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="rounded"
                width={40}
                height={40}
              />
            ) : (
              <i className="bi bi-file-earmark fs-5 text-primary"></i>
            )}

            <span className="text-sm text-truncate" style={{ maxWidth: 120 }}>
              {file.name}
            </span>

            {/* Remove button */}
            <button
              type="button"
              className="btn  icon-street-delete  d-flex align-items-center justify-content-center  "
              style={{ width: 20, height: 20, padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                if (multiple) {
                  const newFiles = (field.value as File[]).filter(
                    (_, i) => i !== index
                  );
                  setFieldValue(name, newFiles);
                } else {
                  setFieldValue(name, null);
                }
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BootstrapForm.Group controlId={name} className="d-flex flex-column gap-8">
      {label && (
        <BootstrapForm.Label className="fw-medium mb-2 text-street-dark">
          {label}
        </BootstrapForm.Label>
      )}

      <label
        className={`upload-file h-80-px w-100 border input-form-light radius-8 overflow-hidden border-dashed d-flex align-items-center flex-column justify-content-center gap-1 cursor-pointer ${
          isDragging ? "bg-neutral-200 border-primary" : "bg-hover-neutral-200"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {multiple && Array.isArray(field.value) && field.value.length > 0 ? (
          <p className="fw-normal text-sm img-upload-text">
            {field.value.length} files selected
          </p>
        ) : field.value && (field.value as File).name ? (
          <p className="fw-normal text-sm img-upload-text">
            Selected file:{" "}
            <span className="text-street-primary">
              {(field.value as File).name}
            </span>
          </p>
        ) : isDragging ? (
          <p className="fw-normal text-sm img-upload-text">Drop file here</p>
        ) : (
          <p className="fw-normal text-sm img-upload-text">
            Drag & drop or <span className="text-street-primary">browse</span>
          </p>
        )}
      </label>

      <BootstrapForm.Control
        id={name}
        type="file"
        name={name}
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        ref={fileInputRef}
        hidden
        isInvalid={!!touched[name] && !!errors[name]}
      />

      {renderPreview()}

      <BootstrapForm.Control.Feedback type="invalid">
        {errors[name] as string}
      </BootstrapForm.Control.Feedback>
    </BootstrapForm.Group>
  );
};

export default FileUploader;
