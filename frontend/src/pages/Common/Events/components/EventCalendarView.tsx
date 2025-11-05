import FullCalendar from "@fullcalendar/react";
import { useRef, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button, Spinner } from "react-bootstrap"; // ✅ Import Spinner
import { MonthYearPicker } from "../../../../components/MonthYearPicker";
import { useFetchEventsCalendarQuery } from "../../../../services/EventApi";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import EventDetailsModal from "./EventDetailsModal";
import type { EventClickArg } from "@fullcalendar/core";
const EventCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventUpcomingData | null>(
    null
  );
  const [openModal, setOpenModal] = useState(false);
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  const { startDate, endDate } = getMonthRange(currentDate);
  const { data, isLoading } = useFetchEventsCalendarQuery({
    startDate,
    endDate,
  });

  const calendarRef = useRef<FullCalendar | null>(null);

  const handleMonthYearSelect = (date: Date) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
      setCurrentDate(date);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const slug = clickInfo.event.extendedProps.slug;

    const clickedEvent = data?.data.find((e) => e.slug === slug);
    console.log("poptriop", slug);
    if (clickedEvent) {
      console.log("pop");
      setSelectedEvent(clickedEvent);
      setOpenModal(true);
    }
  };

  return (
    <div className="card position-relative">
      <div className="p-24">
        <div className="d-flex flex-row justify-content-between justify-content-sm-start align-items-center py-sm-16 py-10 gap-16">
          <Button
            className="btn btn-street-outline-primary text-xs sm:text-sm"
            onClick={() => {
              const today = new Date();
              const api = calendarRef.current?.getApi();
              api?.gotoDate(today);
              setCurrentDate(today);
            }}
          >
            This Month
          </Button>
          <MonthYearPicker
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            onSelect={handleMonthYearSelect}
          />
        </div>

        {/* Loader Overlay */}
        {isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
            style={{ zIndex: 10 }}
          >
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {/* Calendar Body */}
        <FullCalendar
          direction="ltr"
          ref={calendarRef}
          eventMinWidth={140}
          headerToolbar={false}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayHeaderClassNames={"py-20 sm:text-xs text-xxs"}
          eventClassNames={"bg-transparent p-0"}
          eventDidMount={(info) => {
            const eventEnd = info.event.end && new Date(info.event.end);
            if (eventEnd && eventEnd < new Date())
              info.el.style.opacity = "0.5";
          }}
          eventContent={(arg) => {
            const start = arg.event.start?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const end = arg.event.end?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                className="p-0 rounded-md text-break text-wrap"
                style={{ maxWidth: "100%" }}
              >
                <p className="fw-normal text-xxs text-street-base mb-0 ">
                  {start} - {end}
                </p>
                <p className="fw-medium text-xxs sm:text-xs text-street-dark mb-0 ">
                  {arg.event.title}
                </p>
              </div>
            );
          }}
          dayCellClassNames={"p-1 p-sm-8"}
          firstDay={1}
          fixedWeekCount={false}
          events={data?.data.map((event) => ({
            extendedProps: {
              slug: event.slug, // ✅ store custom property here
            },
            title: event.title,
            start: event.startTime,
            end: event.endTime,
          }))}
          eventClick={handleEventClick}
          dayCellDidMount={(info) => {
            const startOfMonth = new Date(
              info.view.currentStart.getFullYear(),
              info.view.currentStart.getMonth(),
              1
            );
            const endOfMonth = new Date(
              info.view.currentStart.getFullYear(),
              info.view.currentStart.getMonth() + 1,
              0
            );

            const inMonth =
              info.date >= startOfMonth && info.date <= endOfMonth;

            if (inMonth) {
              const row = info.el.closest("tr");
              if (row && row.parentNode) {
                const rowIndex = Array.from(row.parentNode.children).indexOf(
                  row
                );
                info.el.classList.add(
                  rowIndex % 2 === 0 ? "week-even" : "week-odd"
                );
              }
            }
          }}
        />
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            open={openModal}
            handleClose={() => setOpenModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EventCalendarView;
