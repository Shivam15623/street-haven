import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Icon } from "@iconify/react";

export interface ModalWrapperProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm"| "lg" | "xl";
  footer?: React.ReactNode;
  backdrop?: boolean | "static";
  keyboard?: boolean;
  centered?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
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
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      aria-labelledby="modal-wrapper-title"
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      contentClassName={className}
    >
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
          
         
            <Icon icon="mdi:close" className="text-lg sm:text-xxl" onClick={onHide} />
         
        </Modal.Header>
      )}

      <Modal.Body className={bodyClassName}>{children}</Modal.Body>

      {footer !== undefined ? (
        <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
      ) : (
        <Modal.Footer className={footerClassName}>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ModalWrapper;
