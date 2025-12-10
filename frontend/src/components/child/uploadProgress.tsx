import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  isComplete?: boolean;
}

const UploadProgress = ({
  progress,
  fileName = "PDF",
  isComplete = false,
}: UploadProgressProps) => {
  const displayProgress = Math.min(Math.max(progress, 0), 100);
  const isUploading = displayProgress > 0 && displayProgress < 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="position-relative overflow-hidden rounded-3 border bg-white p-4 shadow-sm"
      style={{ borderColor: "#e5e5e5" }}
    >
      {/* Glow Background */}
      <div
        className="position-absolute top-0 bottom-0 start-0 end-0"
        style={{
          opacity: 0.2,
          transition: "0.5s",
          background: `linear-gradient(90deg, #4c8aff ${displayProgress}%, transparent ${displayProgress}%)`,
        }}
      />

      <div className="position-relative d-flex align-items-center gap-3">
        {/* Icon */}
        <div
          className="d-flex justify-content-center align-items-center rounded-3"
          style={{
            width: 50,
            height: 50,
            backgroundColor: isComplete
              ? "rgba(0, 180, 90, 0.15)"
              : "rgba(70, 100, 255, 0.15)",
            color: isComplete ? "rgb(0, 180, 90)" : "rgb(70, 100, 255)",
            transition: "0.3s",
          }}
        >
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Icon icon="mdi:check-circle" width={28} height={28} />
            </motion.div>
          ) : isUploading ? (
            <Icon icon="line-md:loading-loop" width={28} height={28} />
          ) : (
            <Icon icon="mdi:upload" width={28} height={28} />
          )}
        </div>

        {/* Content */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium text-truncate">
              {isComplete ? "Upload Complete!" : `Uploading ${fileName}...`}
            </span>

            <span
              className="fw-bold"
              style={{
                color: isComplete ? "rgb(0, 180, 90)" : "rgb(70, 100, 255)",
              }}
            >
              {displayProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="progress" style={{ height: "8px" }}>
            <motion.div
              className="progress-bar"
              role="progressbar"
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                background: isComplete
                  ? "rgb(0, 180, 90)"
                  : "linear-gradient(90deg, #4c8aff, #6aa8ff, #4c8aff)",
                boxShadow: isUploading ? "0 0 10px #4c8aff80" : "none",
              }}
            />
          </div>

          {/* Optional shimmer */}
          {isUploading && (
            <div
              className="position-absolute top-0 start-0 end-0 bottom-0"
              style={{
                pointerEvents: "none",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                transform: "translateX(-100%)",
                animation: "shimmer 1.4s infinite",
              }}
            />
          )}
        </div>
      </div>

      {/* SHIMMER ANIMATION */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </motion.div>
  );
};

export default UploadProgress;
