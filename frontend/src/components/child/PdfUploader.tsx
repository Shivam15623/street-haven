import React, { useRef, useState } from "react";
import { Form as BootstrapForm } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useField, useFormikContext } from "formik";

interface PDFUploadProps {
  name: string; // Formik field name
  label?: string;
}

const PdfUploader: React.FC<PDFUploadProps> = ({ name, label }) => {
  const { setFieldValue, touched, errors } = useFormikContext<any>();
  const [field] = useField<File | null>(name);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setFieldValue(name, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
      e.dataTransfer.clearData();
    }
  };

  return (
    <BootstrapForm.Group controlId={name} className="d-flex flex-column gap-8">
      {label && (
        <BootstrapForm.Label className="fw-medium mb-2 text-street-dark">
          {label}
        </BootstrapForm.Label>
      )}
      <label
        className={`upload-file h-80-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 d-flex align-items-center flex-column justify-content-center gap-1 ${
          isDragging ? "bg-neutral-200 border-primary" : "bg-hover-neutral-200"
        }`}
        htmlFor={name}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        {field.value ? (
          <p className="fw-normal text-sm img-upload-text">
            Selected file:
            <span className="text-street-primary"> {field.value.name}</span>
          </p>
        ) : isDragging ? (
          <p className="fw-normal text-sm img-upload-text">Drop file here</p>
        ) : (
          <p className="fw-normal text-sm img-upload-text">
            Drag & drop or{" "}
            <Link to="#" className="text-street-primary">
              browse
            </Link>
          </p>
        )}
      </label>

      <BootstrapForm.Control
        id={name}
        type="file"
        name={name}
        onChange={handleFileChange}
        ref={fileInputRef}
        accept="application/pdf"
        hidden
        isInvalid={!!touched[name] && !!errors[name]}
      />
      <BootstrapForm.Control.Feedback type="invalid">
        {errors[name] as string}
      </BootstrapForm.Control.Feedback>
    </BootstrapForm.Group>
  );
};

export default PdfUploader;
