import React, { useState, useEffect, useCallback, cloneElement } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";

/**
 * Props (common):
 * - id?: string
 * - title?: node
 * - show?: boolean            // controlled
 * - defaultShow?: boolean     // uncontrolled
 * - onClose?: () => void
 * - onOpen?: () => void
 * - placement?: 'start'|'end'|'top'|'bottom'
 * - trigger?: ReactElement    // custom trigger element (will receive onClick)
 * - footer?: ReactNode | (helpers) => ReactNode
 * - size?: number | string    // number -> px, string ending with % -> width %, else passed as-is
 * - className?: string
 * - children: ReactNode
 * - ...rest forwarded to Offcanvas
 */
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
}) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once

  const visible = isControlled ? show : internalShow;

  const handleClose = useCallback(() => {
    if (!isControlled) setInternalShow(false);
    if (typeof onClose === "function") onClose();
  }, [isControlled, onClose]);

  const handleOpen = useCallback(() => {
    if (!isControlled) setInternalShow(true);
    if (typeof onOpen === "function") onOpen();
  }, [isControlled, onOpen]);

  // compute simple width override if size provided (keeps component compact)
  const dialogStyle =
    typeof size === "number"
      ? { width: `${size}px` }
      : typeof size === "string" && size.endsWith("%")
      ? { width: size }
      : undefined;

  // render custom trigger if provided, else default small button only in uncontrolled mode
  const triggerNode = trigger ? (
    cloneElement(trigger, {
      onClick: (e) => {
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
       
        // backdrop={false}
        id={sheetId}
        show={visible}
        onHide={handleClose}
        placement={placement}
        aria-labelledby={`${sheetId}-label`}
        className={className}
        style={dialogStyle}
        {...rest} // pass-through for responsive, scroll, backdrop, etc.
      >
        <Offcanvas.Header closeButton={closeButton}>
          <Offcanvas.Title id={`${sheetId}-label`}>{title}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>{children}</Offcanvas.Body>

        {footer && (
          // footer can be node or function receiving helpers (close)
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
