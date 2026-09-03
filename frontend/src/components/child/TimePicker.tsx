import React, { useState, useRef, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { createPopper, type Instance } from "@popperjs/core";
import { Icon } from "@iconify/react/dist/iconify.js";
// optional

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void; // ⬅ Add this
  disabled?: boolean;
  className?: string;
}
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ["AM", "PM"] as const;

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled,
  className,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popperInstance = useRef<Instance | null>(null);

  // Parse time
  const parseTime = (t?: string) => {
    if (!t) return { hour: 12, minute: 0, period: "AM" as const };
    const [h, m] = t.split(":");
    let hourNum = parseInt(h);
    const minuteNum = parseInt(m);
    const period = hourNum >= 12 ? "PM" : "AM";

    if (hourNum > 12) hourNum -= 12;
    if (hourNum === 0) hourNum = 12;

    return { hour: hourNum, minute: minuteNum, period };
  };

  const { hour, minute, period } = parseTime(value);

  const formatTime = (h: number, m: number, p: string) => {
    let h24 = h;
    if (p === "PM" && h !== 12) h24 = h + 12;
    if (p === "AM" && h === 12) h24 = 0;
    return `${h24.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (h: number, m: number, p: string) => {
    const formatted = formatTime(h, m, p);
    onChange?.(formatted);
  };

  // Popover positioning using Popper.js
  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      popperInstance.current = createPopper(
        triggerRef.current,
        popoverRef.current,
        {
          placement: "bottom-start",
        }
      );
    }
    return () => {
      popperInstance.current?.destroy();
      popperInstance.current = null;
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onBlur?.();
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const displayTime = value
    ? `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")} ${period}`
    : "Select time";

  return (
    <div>
      <button
        ref={triggerRef}
        className={`w-100 form-control d-flex align-items-center gap-2 justify-content-start ${className}`}
       
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((p) => !p);
        }}
        disabled={disabled}
      >
        <Icon icon="mdi:clock-outline" width="18" height="18" />
        {displayTime}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className=" border rounded shadow mt-12 w-auto p-3"
          style={{ zIndex: 2000, background: "var(--street-card)" }}
        >
          <div className="d-flex justify-content-center align-items-center gap-2">
            {/* Hour */}
            <div className="text-center">
              <div className="small text-street-dark mb-1">Hour</div>
              <Form.Select
                value={hour}
                onChange={(e) =>
                  handleChange(parseInt(e.target.value), minute, period)
                }
                className="text-center timePickerselect  fs-4 fw-semibold"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="text-xxl fw-bold mt-6">:</div>

            {/* Minute */}
            <div className="text-center">
              <div className="small text-street-dark mb-1">Minute</div>
              <Form.Select
                value={minute}
                onChange={(e) =>
                  handleChange(hour, parseInt(e.target.value), period)
                }
                className="text-center timePickerselect fs-4 fw-semibold"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* AM/PM */}
            <div className="text-center">
              <div className="small text-street-dark mb-1">Period</div>
              <div className="d-flex flex-column gap-1">
                {periods.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    className="px-4 rounded-3"
                    variant={p === period ? "primary" : "outline-secondary"}
                    onClick={() => handleChange(hour, minute, p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-top pt-3 mt-3 text-end">
            <Button
              size="sm"
              variant="light"
              className="rounded-3 py-1 px-2"
              onClick={() => {
                onBlur?.(); // ⬅ Mark field as touched
                setIsOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TimePicker;
