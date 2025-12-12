import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

import ImageViewer from "./ImageViewer";
import VideoViewer from "./videoViewer";

import PDFViewer from "./PdfViewer";
import DocViewer from "./docViewer";
import { getFileIcon, type FileItem } from "../../interfaces/fileinterface";
import { FileIconWithBackground } from "../child/FileIcon";

interface FileViewerProps {
  files: FileItem[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  files,
  initialIndex = 0,
  open,
  onOpenChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const currentFile = files[currentIndex];

  const fileType = currentFile.fileType;

  const hasMultipleFiles = files.length > 1;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const goToNext = useCallback(() => {
    if (currentIndex < files.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, files.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "Escape":
          onOpenChange(false);
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
      }
    },
    [open, onOpenChange, goToNext, goToPrevious]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderViewer = () => {
    if (!currentFile) return null;

    switch (fileType) {
      case "image":
        return (
          <ImageViewer url={currentFile.fileUrl} name={currentFile.fileName} />
        );
      case "video":
        return (
          <VideoViewer url={currentFile.fileUrl} name={currentFile.fileName} />
        );

      case "pdf":
        return (
          <PDFViewer url={currentFile.fileUrl} name={currentFile.fileName} />
        );

      case "doc":
      case "ppt":
      case "excel":
        return (
          <DocViewer url={currentFile.fileUrl} name={currentFile.fileName} />
        );
      default:
        return "dff";
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Free memory
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column bg-dark bg-opacity-75"
        style={{ zIndex: 1050 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <motion.header
          className="d-flex justify-content-between align-items-center px-3 py-2 card flex-row radius-0 rounded-0 border-bottom"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="d-flex flex-row align-items-center flex-grow-1 gap-20 text-truncate">
            <FileIconWithBackground fileType={fileType} size={28} />
            <div className="text-truncate">
              <h5 className="mb-0 text-xl text-street-dark text-truncate">
                {currentFile?.fileName}
              </h5>
              <small className="text-street-base">
                {hasMultipleFiles && (
                  <>
                    {currentIndex + 1} of {files.length}
                  </>
                )}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() =>
                handleDownload(currentFile.fileUrl, currentFile.fileName)
              }
              className="btn radius-12 btn-street-lg  btn-street-outline-primary d-none d-sm-inline-flex align-items-center justify-content-center gap-1"
            >
              <Icon icon="mdi:download" width={18} height={18} />
              <span className="small">Download</span>
            </button>
            <button
              onClick={() =>
                handleDownload(currentFile.fileUrl, currentFile.fileName)
              }
              className="btn radius-12 btn-street-outline-primary d-inline-flex d-sm-none"
            >
              <Icon icon="mdi:download" width={18} height={18} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center radius-12"
            >
              <Icon icon="mdi:close" width={18} height={18} />
            </button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex justify-content-center align-items-center position-relative overflow-hidden">
          {/* Navigation Arrows */}
          {hasMultipleFiles && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`position-absolute top-50 start-0 d-flex align-items-center translate-middle-y btn btn-light p-12 rounded-circle`}
                style={{ zIndex: 10, opacity: currentIndex === 0 ? 0.3 : 1 }}
              >
                <Icon icon="mdi:chevron-left" width={24} height={24} />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === files.length - 1}
                className={`position-absolute top-50 end-0 d-flex align-items-center translate-middle-y btn btn-light p-12 rounded-circle`}
                style={{
                  zIndex: 10,
                  opacity: currentIndex === files.length - 1 ? 0.3 : 1,
                }}
              >
                <Icon icon="mdi:chevron-right" width={24} height={24} />
              </button>
            </>
          )}

          {/* File Viewer */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentFile?._id}
              className="flex-grow-1 w-100 h-100 p-3"
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ duration: 0.2 }}
            >
              {renderViewer()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail Strip */}
        {hasMultipleFiles && (
          <motion.div
            className="d-flex justify-content-center align-items-center gap-2 overflow-auto px-3 py-2 card rounded-0 flex-row border-top"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {files.map((file, index) => {
              const type = file.fileType;
              const isActive = index === currentIndex;

              return (
                <button
                  key={file._id}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 rounded overflow-hidden border radius-12 ${
                    isActive ? "border-primary-500" : "border-secondary-subtle"
                  } ${isActive ? "" : "opacity-75"}`}
                  style={{ width: "56px", height: "56px" }}
                >
                  {type === "image" ? (
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center w-100 h-100 bg-light">
                      <Icon
                        icon={getFileIcon(type)}
                        width={20}
                        height={20}
                        className="text-muted"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FileViewer;
