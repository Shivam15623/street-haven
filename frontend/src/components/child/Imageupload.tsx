import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useField, useFormikContext } from "formik";
import { Link } from "react-router-dom";

interface ImageUploadProps {
  name: string; // Formik field name
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ name, label }) => {
  const { setFieldValue, touched, errors } = useFormikContext<any>();
  const [field] = useField<File | null>(name);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setFieldValue(name, file);
    setImagePreview(URL.createObjectURL(file));
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

  const removeImage = () => {
    setImagePreview(null);
    setFieldValue(name, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Form.Group controlId={name}>
      {label && <Form.Label className="fw-medium mb-10 text-street-dark">{label}</Form.Label>}

      <div className="upload-image-wrapper d-flex align-items-center gap-3">
        {imagePreview ? (
          <div className="uploaded-img position-relative h-120-px w-120-px border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
            <button
              type="button"
              onClick={removeImage}
              className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
              aria-label="Remove uploaded image"
            >
              <Icon
                icon="radix-icons:cross-2"
                className="text-xl text-danger-600"
              />
            </button>
            <img
              id="uploaded-img__preview"
              className="w-100 h-100 object-fit-cover"
              src={imagePreview}
              alt="Preview"
            />
          </div>
        ) : (
          <label
            className={`upload-file h-80-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 d-flex align-items-center flex-column justify-content-center gap-1 ${
              isDragging
                ? "bg-neutral-200 border-primary"
                : "bg-hover-neutral-200"
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
            {isDragging ? (
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
        )}

        {/* Hidden file input */}
        <Form.Control
          id={name}
          type="file"
          name={name}
          onChange={handleFileChange}
          ref={fileInputRef}
          accept="image/*"
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

export default ImageUpload;
