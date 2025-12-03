import "@assets/css/PageCss/events.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import EventListView from "./components/EventListView";
import EventCalendarView from "./components/EventCalendarView";
import ActionsEvent from "./components/ActionsEvent";
import useHasPermission from "../../../hooks/Auth";

const Events = () => {
  const [view, setView] = useState("list");
  const { hasPermission } = useHasPermission();
  return (
    <div className="d-flex flex-column gap-8 gap-sm-16 gap-md-24 ">
      {/* Top Info */}
      <div className="d-flex flex-row align-items-center justify-content-between  gap-2">
        <div className="d-flex flex-column gap-2">
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            Staff Events
          </p>
          <p className="fw-normal text-sm xs:text-md">
            View upcoming training sessions and organizational events
          </p>
        </div>
        <div className="d-flex sm:d-block justify-content-end">
          <div className="event-view-toggle align-items-center w-fit d-flex flex-row p-6  gap-1 radius-12">
            <div
              onClick={() => setView("calender")}
              className={`${
                view === "calender"
                  ? "btn-street-primary text-white"
                  : "btn-street-neutral switch text-street-base"
              } d-flex gap-8 align-items-center justify-content-center p-8  radius-8 cursor-pointer`}
              style={{ maxHeight: "35px" }}
            >
              <Icon
                icon={"material-symbols-light:event-outline-rounded"}
                className="text-lg"
              />{" "}
              <span className=" text-xs d-none d-md-inline-block fw-semibold">
                Calendar view
              </span>
            </div>
            <div
              onClick={() => setView("list")}
              className={`${
                view === "list"
                  ? "btn-street-primary text-white"
                  : "btn-street-neutral switch text-street-base"
              } d-flex gap-8 align-items-center justify-content-center p-8 radius-8 cursor-pointer`}
              style={{ maxHeight: "35px" }}
            >
              <Icon icon={"mynaui:list"} className="text-lg" />{" "}
              <span className="text-xs d-none d-md-inline-block fw-semibold">
                List view
              </span>
            </div>
          </div>
        </div>
      </div>
      {hasPermission({ action: "create_event" }) && <ActionsEvent />}

      {view === "list" ? <EventListView /> : <EventCalendarView />}
    </div>
  );
};

export default Events;
