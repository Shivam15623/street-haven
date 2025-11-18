import React, { useState, useRef, useEffect } from "react";

interface TimePickerProps {
  name: string;
  value?: string; // 24-hour format HH:MM
  onChange: (value: string) => void; // will send 24-hour string
  placeholder?: string;
  className?: string;
  onBlur?: () => void; // Formik onBlur
  setFieldTouched?: (field: string, touched?: boolean) => void; // Formik setFieldTouched
}

export const TimePicker: React.FC<TimePickerProps> = ({
  name,
  value,
  onChange,
  placeholder = "Select time",
  className,
  onBlur,
  setFieldTouched,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Update state from 24-hour value if provided
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      let hrNum = Number(h);
      const p = hrNum >= 12 ? "PM" : "AM";
      if (hrNum > 12) hrNum -= 12;
      if (hrNum === 0) hrNum = 12;

      setHour(hrNum.toString().padStart(2, "0"));
      setMinute(m);
      setPeriod(p);
    }
  }, [value]);

  const handleTimeChange = (h: string, m: string, p: string) => {
    setHour(h);
    setMinute(m);
    setPeriod(p);

    // Convert to 24-hour format
    let hr = Number(h);
    if (p === "PM" && hr !== 12) hr += 12;
    if (p === "AM" && hr === 12) hr = 0;

    const formatted24 = `${hr.toString().padStart(2, "0")}:${m}`;
    onChange(formatted24); // send 24-hour string
  };

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (showPopover) {
          setShowPopover(false);
          onBlur?.(); // call Formik onBlur
          setFieldTouched?.(name, true); // mark field as touched
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover, onBlur, setFieldTouched, name]);

  const displayTime = value ? `${hour}:${minute} ${period}` : placeholder;

  return (
    <div ref={containerRef} className={`position-relative ${className || ""}`}>
      {/* Fake input */}
      <div
        className={`form-control rounded px-3 py-2 cursor-pointer select-none ${
          !value ? "text-muted" : ""
        }`}
        onClick={() => setShowPopover(!showPopover)}
      >
        {displayTime}
      </div>

      {/* Popover */}
      {showPopover && (
        <div
          className="position-absolute w-75 top-100 start-0 mt-1 border rounded shadow p-3"
          style={{ zIndex: 50, background: "var(--street-card)" }}
        >
          <div className="text-center fw-medium mb-2">Select Time</div>

          <div className="d-flex justify-content-center align-items-center gap-2">
            {/* Hour */}
            <select
              className="form-select form-select-sm text-center"
              value={hour}
              onChange={(e) => handleTimeChange(e.target.value, minute, period)}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <span>:</span>

            {/* Minute */}
            <select
              className="form-select form-select-sm text-center"
              value={minute}
              onChange={(e) => handleTimeChange(hour, e.target.value, period)}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* AM/PM */}
            <select
              className="form-select form-select-sm text-center"
              value={period}
              onChange={(e) => handleTimeChange(hour, minute, e.target.value)}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      )}

      {/* Hidden input for Formik */}
      <input
        type="hidden"
        name={name}
        value={value || ""}
        onBlur={() => {
          onBlur?.();
          setFieldTouched?.(name, true);
        }}
      />
    </div>
  );
};
