import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface LoadingOverlayProps {
  isLoading: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  onSuccessComplete?: () => void;
  successDuration?: number;
}

const LoadingOverlay = ({
  isLoading,
  isSuccess = false,
  loadingText = "Processing your request...",
  successText = "Successfully submitted!",
  onSuccessComplete,
  successDuration = 2000000,
}: LoadingOverlayProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setShowSuccess(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess && visible) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setShowSuccess(false);
        onSuccessComplete?.();
      }, successDuration);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, visible, successDuration, onSuccessComplete]);
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1055 }}
    >
      {/* Backdrop */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ pointerEvents: "all" }}
      />

      {/* Content */}
      <div className="position-relative bg-white rounded shadow p-4 text-center">
        {!showSuccess ? (
          <>
            {/* Spinner */}
            <div className="mb-3">
              <div className="spinner-border text-primary" role="status" />
            </div>

            {/* Loading text */}
            <p className="fw-medium mb-2">{loadingText}</p>

            {/* Dots */}
            <div className="d-flex justify-content-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-primary" />
              <span className="spinner-grow spinner-grow-sm text-primary" />
              <span className="spinner-grow spinner-grow-sm text-primary" />
            </div>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <div className="mb-3">
              <Icon
                icon="mdi:check-circle"
                width={64}
                height={64}
                className="text-success"
              />
            </div>

            {/* Success Text */}
            <p className="fw-medium mb-0">{successText}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
