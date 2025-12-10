import React from "react";

interface FormSubmissionLoaderProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  progress?: number;
  variant?: "spinner" | "dots" | "pulse" | "progress";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FormSubmissionLoader: React.FC<FormSubmissionLoaderProps> = ({
  isLoading,
  message = "Processing...",
  subMessage,
  progress,
  variant = "spinner",
  size = "md",
  className,
}) => {
  if (!isLoading) return null;

  const sizeMap = {
    sm: { spinner: "2rem", dots: "0.4rem", text: "0.8rem" },
    md: { spinner: "3rem", dots: "0.6rem", text: "1rem" },
    lg: { spinner: "4rem", dots: "0.8rem", text: "1.2rem" },
  };

  const sizes = sizeMap[size];

  return (
    <div
      className={`position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${className}`}
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4 d-flex flex-column align-items-center text-center border"
        style={{
          minWidth: "260px",
          animation: "fadeScale 0.25s ease-out",
        }}
      >
        {/* Spinner Variant */}
        {variant === "spinner" && (
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: sizes.spinner, height: sizes.spinner }}
          ></div>
        )}

        {/* Dots Variant */}
        {variant === "dots" && (
          <div className="d-flex gap-2 mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-circle bg-primary"
                style={{
                  width: sizes.dots,
                  height: sizes.dots,
                  animation: "dotPulse 0.8s infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Pulse Variant */}
        {variant === "pulse" && (
          <div
            className="rounded-circle bg-primary mb-3"
            style={{
              width: sizes.spinner,
              height: sizes.spinner,
              opacity: 0.6,
              animation: "pulseGrow 1.5s infinite",
            }}
          />
        )}

        {/* Progress Variant */}
        {variant === "progress" && (
          <div className="w-100 mb-3">
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                role="progressbar"
                style={{ width: `${progress ?? 0}%` }}
              ></div>
            </div>
            <div
              className="fw-semibold mt-2"
              style={{ fontSize: sizes.text }}
            >
              {Math.round(progress || 0)}%
            </div>
          </div>
        )}

        {/* Message */}
        <div
          className="fw-semibold"
          style={{ fontSize: sizes.text, color: "#333" }}
        >
          {message}
        </div>

        {/* Sub Message */}
        {subMessage && (
          <div className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
            {subMessage}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }

        @keyframes pulseGrow {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FormSubmissionLoader;
