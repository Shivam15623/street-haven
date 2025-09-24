import { useState } from "react";
import { Popover } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import localeData from "dayjs/plugin/localeData";
import { Icon } from "@iconify/react/dist/iconify.js";

dayjs.extend(updateLocale);
dayjs.extend(localeData);

export const MonthYearPicker: React.FC<{
  year: number;
  month: number; // 0–11
  onSelect: (date: Date) => void;
}> = ({ year, month, onSelect }) => {
  const [view, setView] = useState<"month" | "year">("month");
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(year / 12) * 12
  );
  const [showPicker, setShowPicker] = useState(false);

  const years = Array.from({ length:12 }, (_, i) => yearRangeStart + i);
  const months: string[] = dayjs.localeData().monthsShort();

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = dayjs().year(year).month(monthIndex).startOf("month");
    onSelect(newDate.toDate());
    setShowPicker(false); // close after selection
  };

  const handleYearSelect = (y: number) => {
    const newDate = dayjs().year(y).month(month).startOf("month");
    onSelect(newDate.toDate());
    setView("month");
  };

  const popover = (
    <Popover
      id="month-year-popover"
      className="shadow-sm  rounded-3 month-popover"
      style={{ minWidth: "320px" }}
    >
      {/* Header */}
      <Popover.Header className="bg-transparent d-flex justify-content-center align-items-center border-0 px-2 py-1">
        {view === "month" ? (
          <button
            className="fw-semibold text-street-dark p-0 bg-transparent border-0"
            onClick={() => setView("year")}
          >
            {year}
          </button>
        ) : (
          <div className="d-flex align-items-center w-100 px-12 justify-content-between">
            <div
              className=" text-street-base text-xl rounded-circle cursor-pointer"
              onClick={() => setYearRangeStart(yearRangeStart - 12)}
            >
              ‹
            </div>
            <span className="fw-semibold text-street-dark ">
              {years[0]} – {years[years.length - 1]}
            </span>
            <div
              className=" text-street-base text-xl  rounded-circle cursor-pointer"
              onClick={() => setYearRangeStart(yearRangeStart + 12)}
            >
              ›
            </div>
          </div>
        )}
      </Popover.Header>

      {/* Body */}
      <Popover.Body className="px-3 ">
        <div className="month-pop-date">
          {view === "month" ? (
            <div className="row gx-2 gy-0">
              {months.map((m, i) => (
                <div key={i} className="col-3">
                  <button
                    className={`btn w-100 rounded-2 ${
                      i === month
                        ? "btn-street-primary text-white"
                        : "month-btn"
                    }`}
                    onClick={() => handleMonthSelect(i)}
                  >
                    {m}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="row gx-2 gy-0 mt-0">
              {years.map((y) => (
                <div key={y} className="col-3">
                  <button
                    className={`btn w-100 rounded-2 ${
                      y === year
                        ? "btn-street-primary text-white"
                        : "month-btn"
                    }`}
                    onClick={() => handleYearSelect(y)}
                  >
                    {y}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={popover}
      rootClose
      show={showPicker}
      onToggle={(nextShow) => setShowPicker(nextShow)}
    >
      <button className="text-sm sm:text-lg md:text-2xxl lg:text-3xxl lh-1 d-flex gap-10 text-street-dark align-items-center bg-transparent border-0">
        {dayjs().year(year).month(month).format("MMMM YYYY")}
        <Icon
          icon="fa6-solid:chevron-down"
          className="text-md text-street-dark"
        />
      </button>
    </OverlayTrigger>
  );
};
