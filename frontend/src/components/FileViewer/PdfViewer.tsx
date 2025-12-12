import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface PDFViewerProps {
  url: string;
  name: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, name }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div
      className="d-flex flex-column flex-grow-1 h-100 position-relative"
      style={{ minHeight: "400px" }}
    >
      {/* Loading Spinner */}
      {isLoading && !error && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-50"
          style={{ zIndex: 10 }}
        >
          <div className="d-flex flex-column align-items-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-muted small">Loading PDF...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error ? (
        <motion.div
          className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="bg-danger bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center mb-3"
            style={{ width: "80px", height: "80px" }}
          >
            <Icon
              icon="mdi:file-pdf-box"
              className="text-danger"
              width={32}
              height={32}
            />
          </div>
          <h5 className="fw-semibold mb-2">Unable to Preview PDF</h5>
          <p className="text-muted mb-3">
            The PDF cannot be displayed in the browser. You can download it to
            view locally.
          </p>
          <a
            href={url}
            download={name}
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <Icon icon="mdi:download" width={20} height={20} />
            Download PDF
          </a>
        </motion.div>
      ) : (
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="flex-grow-1 mx-auto rounded"
          style={{
            border: "none",
            minHeight: "400px",
            maxWidth: "90vw",
            minWidth: "90vw",
          }}
          title={name}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};

export default PDFViewer;
