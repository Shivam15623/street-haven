import React, { useCallback, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useEventuploadDocumentMutation } from "../../../../services/EventApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import { getAxiosErrorMessage } from "../../../../utills/utills";
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  rawFile: File;
}
interface EventDocsUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventId: string;
}
const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) {
    return "mdi:image";
  }
  if (type.startsWith("video/")) {
    return "mdi:video";
  }
  if (type.includes("pdf")) {
    return "mdi:file-pdf-box";
  }
  if (
    type.includes("word") ||
    type.includes("msword") ||
    type.includes("document")
  ) {
    return "mdi:file-word-box";
  }
  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("sheet")
  ) {
    return "mdi:file-excel-box";
  }
  if (type.includes("zip")) {
    return "mdi:file-zip-box";
  }

  return "mdi:file"; // default icon
};
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const EventDocsUploader: React.FC<EventDocsUploaderProps> = ({
  open,
  eventName,
  onOpenChange,
  eventId,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgrees] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDoc, { isLoading }] = useEventuploadDocumentMutation();
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      rawFile: file, // ⭐ ADD THIS
      progress: 0,
      status: "ready",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setFiles([]), 300);
  };

  const uploadAllFiles = async (files: UploadedFile[]) => {
    try {
      const form = new FormData();
      files.forEach((f) => form.append("documents", f.rawFile));
      const res = await uploadDoc({
        eventId: eventId,
        formData: form,
        onProgress: (p) => setProgrees(p),
      }).unwrap();
      if (res.success) {
        showSuccess("documents uploaded Successfully");
        setFiles([]);
        onOpenChange(false);
        setProgrees(0);
      }
    } catch (error) {
      showError(getAxiosErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={open}
      size="xl"
      onHide={() => onOpenChange(false)}
      title={eventName}
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading}
          variant="progress" // spinner | dots | pulse | progress
          message="uploading..."
          subMessage="Please wait"
          progress={progress} // only for progress variant
        />
      }
      isLoading={isLoading}
      footer={
        <>
          <div className="d-flex justify-content-between gap-3 ">
            <button
              type="button"
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex flex-row align-items-center justify-content-center text-sm"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex flex-row align-items-center  justify-content-center text-sm"
              onClick={() => uploadAllFiles(files)}
            >
              {isLoading
                ? "Uploading..."
                : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </>
      }
    >
      <div className="d-flex flex-column flex-grow-1 overflow-auto py-4">
        {/* Drop Zone */}
        <div
          className={`border border-2 border-dashed rounded p-5 text-center mb-4 ${
            isDragging ? "border-primary bg-light" : "border-secondary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer", transition: "0.3s" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="d-none"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <div className="d-flex flex-column align-items-center gap-2">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                isDragging ? "bg-primary text-white" : "bg-secondary text-white"
              }`}
              style={{ width: 56, height: 56, transition: "0.3s" }}
            >
              <Icon icon={"bi-upload"} className=" text-2xl" />
            </div>

            <p className="fw-semibold text-street-dark mb-0">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-street-base small mb-1">
              or click to browse from your device
            </p>
            <small className="text-street-base">
              Supports images, videos & documents up to 50MB (14 documents
              allowed)
            </small>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div>
            <p className="small fw-semibold text-muted mb-2">
              {files.length} file{files.length !== 1 && "s"} selected
            </p>

            <div className="d-flex flex-column gap-2">
              {files.map((file, index) => {
                const IconName = getFileIcon(file.type);

                return (
                  <div
                    key={file.id}
                    className=" p-3 rounded d-flex align-items-center gap-3 border"
                    style={{
                      animation: `slide-up 0.3s ease ${index * 0.05}s`,
                      background: "var(--street-card)",
                    }}
                  >
                    <div
                      className={`rounded d-flex align-items-center justify-content-center`}
                      style={{
                        width: 40,
                        height: 40,
                        background: "#dce3ff",
                        color: "#3b5bdb",
                      }}
                    >
                      <Icon icon={IconName} width={20} height={20} />
                    </div>

                    <div className="flex-grow-1">
                      <p className="fw-semibold text-street-dark mb-0 text-truncate">
                        {file.name}
                      </p>
                      <small className="text-street-base">
                        {formatFileSize(file.size)}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="btn p-2 d-flex flex-column align-items-center btn-outline-danger rounded-circle"
                      >
                        <Icon icon="bi-x" className="text-lg" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
      </div>
    </ModalWrapper>
  );
};

export default EventDocsUploader;
