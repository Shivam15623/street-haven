import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useFormikContext } from "formik";

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string; // custom accepted file types
}

interface FormValues {
  [key: string]: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  accept = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
}) => {
  const { values, setFieldValue, touched, errors } = useFormikContext<FormValues>();

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setFieldValue(name, file);
    setFileType(file.type);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
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

  const removeFile = () => {
    setFilePreview(null);
    setFileType(null);
    setFieldValue(name, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const renderPreview = () => {
    if (filePreview && fileType?.startsWith("image/")) {
      return (
        <img
          src={filePreview}
          alt="Preview"
          className="w-100 h-100 object-fit-cover"
        />
      );
    }

    if (fileType?.includes("pdf"))
      return <Icon icon="mdi:file-pdf" className="text-danger text-4xl" />;
    if (fileType?.includes("word"))
      return <Icon icon="mdi:file-word" className="text-primary text-4xl" />;
    if (fileType?.includes("text"))
      return <Icon icon="mdi:file-document-outline" className="text-gray-600 text-4xl" />;
    if (fileType?.includes("gif"))
      return <Icon icon="mdi:file-gif-box" className="text-purple-500 text-4xl" />;

    return <Icon icon="mdi:file-outline" className="text-gray-400 text-4xl" />;
  };

  return (
    <Form.Group controlId={name} className="d-flex flex-column gap-2">
      {label && <Form.Label className="fw-medium">{label}</Form.Label>}

      <div className="d-flex align-items-center gap-3">
        {values[name] ? (
          <div className="position-relative border radius-8 p-2 text-center bg-light">
            <button
              type="button"
              onClick={removeFile}
              className="position-absolute top-0 end-0 btn btn-sm btn-light"
            >
              <Icon icon="radix-icons:cross-2" />
            </button>
            <div className="file-preview w-120-px h-120-px d-flex justify-content-center align-items-center">
              {renderPreview()}
            </div>
            <div className="small mt-2 text-truncate" style={{ maxWidth: 100 }}>
              {(values[name] as File)?.name}
            </div>
          </div>
        ) : (
          <label
            className={`upload-file h-80-px w-100 border radius-8 border-dashed bg-neutral-50 d-flex align-items-center justify-content-center flex-column ${
              isDragging ? "bg-neutral-200 border-primary" : "bg-hover-neutral-200"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <p className="text-sm">
              {isDragging ? "Drop file here" : "Drag & drop or "}
              <span
                className="text-primary cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                browse
              </span>
            </p>
          </label>
        )}

        <Form.Control
          id={name}
          type="file"
          name={name}
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={accept}
          hidden
          isInvalid={!!touched[name] && !!errors[name]}
        />
      </div>

      <Form.Control.Feedback type="invalid">
        {errors[name] as string}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default FileUpload;
