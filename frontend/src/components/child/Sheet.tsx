import React, {
  useState,
  useEffect,
  useCallback,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from "react";
import { Offcanvas, type OffcanvasProps } from "react-bootstrap";

import Button from "react-bootstrap/Button";

interface SheetProps
  extends Omit<OffcanvasProps, "show" | "onHide" | "placement"> {
  id?: string;
  title?: ReactNode;
  show?: boolean; // controlled
  defaultShow?: boolean; // uncontrolled
  onClose?: () => void;
  onOpen?: () => void;
  placement?: "start" | "end" | "top" | "bottom";
  trigger?: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>; // custom trigger element (will receive onClick)
  footer?: ReactNode | ((helpers: { close: () => void }) => ReactNode);
  size?: number | string; // number -> px, string ending with % -> width %, else passed as-is
  className?: string;
  closeButton?: boolean;
  children: ReactNode;
}

export default function Sheet({
  id,
  title,
  children,
  show,
  defaultShow = false,
  onClose,
  onOpen,
  placement = "end",
  trigger,
  footer = null,
  size,
  className = "",
  closeButton = true,
  ...rest
}: SheetProps) {
  const autoId = `sheet-${Math.random().toString(36).slice(2, 9)}`;
  const sheetId = id || autoId;
  const isControlled = typeof show === "boolean";
  const [internalShow, setInternalShow] = useState(defaultShow);

  // warn once if consumer uses controlled mode but didn't give an onClose
  useEffect(() => {
    if (isControlled && typeof onClose !== "function") {
      console.warn(
        "[Sheet] You provided `show` prop but did not provide `onClose`. The component is controlled — pass onClose to toggle visibility."
      );
    }
  }, [isControlled, onClose]);

  const visible = isControlled ? show : internalShow;

  const handleClose = useCallback(() => {
    if (!isControlled) setInternalShow(false);
    onClose?.();
  }, [isControlled, onClose]);

  const handleOpen = useCallback(() => {
    if (!isControlled) setInternalShow(true);
    onOpen?.();
  }, [isControlled, onOpen]);

  // compute simple width override if size provided
  const dialogStyle =
    typeof size === "number"
      ? { width: `${size}px` }
      : typeof size === "string" && size.endsWith("%")
      ? { width: size }
      : undefined;

  // render custom trigger if provided, else default button only in uncontrolled mode
  const triggerNode = trigger ? (
    cloneElement(trigger, {
      onClick: (e: React.MouseEvent) => {
        trigger.props?.onClick?.(e);
        handleOpen();
      },
    })
  ) : !isControlled ? (
    <Button variant="primary" onClick={handleOpen}>
      Open
    </Button>
  ) : null;

  return (
    <>
      {triggerNode}

      <Offcanvas
        id={sheetId}
        show={visible}
        onHide={handleClose}
        placement={placement}
        aria-labelledby={`${sheetId}-label`}
        className={className}
        style={dialogStyle}
        {...rest}
      >
        <Offcanvas.Header closeButton={closeButton}>
          <Offcanvas.Title id={`${sheetId}-label`}>{title}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>{children}</Offcanvas.Body>

        {footer && (
          <div className="offcanvas-footer p-3 border-top">
            {typeof footer === "function"
              ? footer({ close: handleClose })
              : footer}
          </div>
        )}
      </Offcanvas>
    </>
  );
}
