import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "@iconify/react";
import { Button } from "react-bootstrap";

interface CustomDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  isInvalid?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  name?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  name,
  value = null,
  onChange,
  onBlur,
  placeholder = "Select date",
  isInvalid = false,
  className = "",
  minDate,
  maxDate,
  disabled = false,
}) => {
  const CustomInput = forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onBlur }, ref) => (
      <div className="position-relative w-100">
        <input
          ref={ref}
          value={value || ""}
          onClick={onClick}
          onBlur={onBlur}
          readOnly
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-control ${className} ${
            isInvalid ? "is-invalid " : ""
          }`}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: "var(--street-card)",
          }}
        />

        <Icon
          icon="akar-icons:calendar"
          className="position-absolute"
          style={{
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    )
  );

  CustomInput.displayName = "CustomInput";

  return (
    <div className="w-100">
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        shouldCloseOnSelect={true}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        autoComplete="off"
        customInput={<CustomInput />}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          changeMonth,
          changeYear,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="d-flex justify-content-between align-items-center px-2 py-2 border-bottom rounded-top">
            <Button
              variant="light"
              className="d-flex align-items-center p-1"
              size="sm"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
            >
              <Icon icon="akar-icons:chevron-left" />
            </Button>

            <div className="d-flex gap-2">
              <select
                className="px-2 py-1 text-sm font-medium border rounded"
                value={date.getMonth()}
                onChange={(e) => changeMonth(Number(e.target.value))}
              >
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((month, idx) => (
                  <option key={idx} value={idx}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                className="px-2 py-1 text-sm font-medium border rounded"
                value={date.getFullYear()}
                onChange={(e) => changeYear(Number(e.target.value))}
              >
                {Array.from(
                  { length: 50 },
                  (_, i) => new Date().getFullYear() - 25 + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="light"
              className="d-flex align-items-center p-1"
              size="sm"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
            >
              <Icon icon="akar-icons:chevron-right" />
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default CustomDatePicker;
