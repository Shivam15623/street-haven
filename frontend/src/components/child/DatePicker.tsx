import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "@iconify/react";
import { Button } from "react-bootstrap";

interface CustomDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = null,
  onChange,
  placeholder = "Select date",
  isInvalid = false,
  className = "",
  minDate,
  maxDate,
  disabled = false,
}) => {
  // Custom input component
  const CustomInput = forwardRef(
    ({ value, onClick }: { value?: string; onClick?: () => void }, ref) => (
      <div
        ref={ref as any}
        className={`form-control d-flex justify-content-between align-items-center ${className} ${
          isInvalid ? "is-invalid" : ""
        }`}
        onClick={onClick}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <span>{value || placeholder}</span>
        <Icon icon="akar-icons:calendar" className="text-xl" />
      </div>
    )
  );

  return (
    <div className="w-100">
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
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
                  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
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
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
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
