import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Icon } from "@iconify/react";

export interface ModalWrapperProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
  backdrop?: boolean | "static";
  keyboard?: boolean;
  centered?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  isLoading?: boolean;
  ModalLoader?: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  show,
  onHide,
  title,
  subtitle,
  children,
  size = "lg",
  footer,
  backdrop = true,
  keyboard = true,
  centered = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  isLoading,
  ModalLoader,
}) => {
  // react-bootstrap's Modal has no "md" size — its default (no size prop) IS medium.
  // So we only forward the size prop when it's not "md".
  const bsSize = size === "md" ? undefined : size;

  // don't let the modal be dismissed mid-submit (backdrop click / Esc)
  const effectiveBackdrop = isLoading ? "static" : backdrop;
  const effectiveKeyboard = isLoading ? false : keyboard;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={bsSize}
      aria-labelledby="modal-wrapper-title"
      className="overflow-hidden"
      centered={centered}
      backdrop={effectiveBackdrop}
      keyboard={effectiveKeyboard}
      contentClassName="overflow"
    >
      <div
        className={`position-relative d-flex flex-column ${className ?? ""}`}
      >
        {isLoading && ModalLoader}
        {title && (
          <Modal.Header closeButton={false} className={headerClassName}>
            <div className="d-flex flex-column gap-1 gap-sm-8 gap-md-10 flex-grow-1">
              <Modal.Title
                id="modal-wrapper-title"
                className="text-md sm:text-xl mb-0 text-street-dark fw-semibold"
              >
                {title}
              </Modal.Title>
              {subtitle && (
                <p className="text-xxs sm:text-xs fw-normal text-street-dark m-0">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Custom Close Button */}
            <Icon
              icon="mdi:close"
              className={`text-lg sm:text-xxl ${
                isLoading ? "opacity-50 pe-none" : "cursor-pointer"
              }`}
              onClick={isLoading ? undefined : onHide}
              role="button"
              aria-label="Close"
            />
          </Modal.Header>
        )}

        <Modal.Body className={bodyClassName}>
          {" "}
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
            }}
          >
            <div className="py-16">{children}</div>
          </div>
        </Modal.Body>

        {footer !== undefined ? (
          <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
        ) : (
          <Modal.Footer className={footerClassName}>
            <Button variant="secondary" onClick={onHide} disabled={isLoading}>
              Close
            </Button>
          </Modal.Footer>
        )}
      </div>
    </Modal>
  );
};

export default ModalWrapper;
