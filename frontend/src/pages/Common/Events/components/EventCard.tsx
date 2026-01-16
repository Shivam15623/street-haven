import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import AnnouncementCardWrapper from "./AnnouncementCardWrapper";
import dayjs from "dayjs";
import {
  useSignOutFromEventMutation,
  useSignUpForEventMutation,
} from "../../../../services/EventApi";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import { showError, showSuccess } from "../../../../utills/toastutills";
import ViewRegistrations from "./ViewRegisterations";
import ActionsEvent from "./ActionsEvent";

import { Icon } from "@iconify/react/dist/iconify.js";
import useHasPermission from "../../../../hooks/Auth";
import EventDocsUploader from "./EventDocsUploader";
import EventDocuments from "./EventDocuments";
import { getErrorMessage } from "../../../../utills/utills";

interface EventCardProps {
  event: EventUpcomingData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const {
    _id: eventId,
    capacity,
    createdBy,
    isRegistered,
    eventDate,
    endTime,
    startTime,
    location,
    description,
    title,
    totalRegistered,
    createdAt,
  } = event;

  // ✅ Check if event is in the past
  const isPastEvent = dayjs(eventDate).isBefore(dayjs(), "day");
  const [registrationsOpen, setRegistrationsOpen] = useState(false);

  const progress = Math.min((totalRegistered / capacity) * 100, 100);
  const formattedDate = dayjs(eventDate).format("MM/DD/YYYY");
  const formattedTimeRange =
    startTime && endTime
      ? `${dayjs(startTime).format("hh:mm A")} - ${dayjs(endTime).format(
          "hh:mm A"
        )}`
      : "";
  const isFull = totalRegistered >= capacity;
  const { hasPermission } = useHasPermission();
  // Mutations
  const [registerEvent, { isLoading: isRegistering }] =
    useSignUpForEventMutation();
  const [signOutEvent, { isLoading: isUnregistering }] =
    useSignOutFromEventMutation();
  const [docopen, setDocOpen] = useState(false);
  const [open, setOpen] = useState(false);
  // Handle Register
  const handleSignup = async () => {
    try {
      const res = await registerEvent(eventId).unwrap();
      if (res.success) showSuccess(res.message);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  // Handle Unregister
  const handleSignout = async () => {
    try {
      const res = await signOutEvent(eventId).unwrap();
      if (res.success) showSuccess(res.message);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  // ✅ Decide what button to show
  let actionButton;
  if (isPastEvent) {
    // For past events — only show registration status
    actionButton = (
      <div className="d-flex flex-row gap-2">
        {hasPermission({
          action: "view_registerations",
        }) && (
          <button
            className="btn btn-info-600 radius-12 text-xs d-none d-sm-flex align-items-center justify-content-center gap-2"
            title="View Registrations"
            onClick={() => setRegistrationsOpen(true)}
          >
            {" "}
            <Icon icon="mdi:account-group-outline" className="text-xl" />{" "}
            <span className="d-none d-md-inline-block">View</span>{" "}
          </button>
        )}
        {hasPermission({
          action: "view_registerations",
        }) && (
          <button
            className="btn  btn-street-edit d-none d-sm-flex flex-column align-items-center justify-content-center radius-12"
            onClick={() => setDocOpen(true)}
          >
            <Icon icon="lucide:upload" className="text-xl" />
          </button>
        )}

        <button
          disabled
          className={`btn btn-street-lg d-flex align-items-center justify-content-center radius-12  gap-2 text-xs ${
            isRegistered ? "btn-success" : "btn-secondary"
          }`}
        >
          {isRegistered ? (
            <span className="d-none d-md-inline-block">
              You registered for this
            </span>
          ) : (
            <span className="d-none d-md-inline-block">
              You didn’t register
            </span>
          )}
          {isRegistered ? (
            <Icon
              icon="mdi:calendar-remove"
              className="d-inline-block d-md-none text-xl"
            />
          ) : (
            <Icon
              icon="mdi:calendar-check"
              className="d-inline-block d-md-none text-xl"
            />
          )}
        </button>
      </div>
    );
  } else {
    // For upcoming events — allow signup/cancel
    actionButton = (
      <div className="d-flex flex-row gap-2">
        {hasPermission({
          action: "view_registerations",
        }) && (
          <button
            className="btn btn-info-600 radius-12 text-xs d-none d-sm-flex align-items-center justify-content-center gap-2"
            title="View Registrations"
            onClick={() => setRegistrationsOpen(true)}
          >
            {" "}
            <Icon icon="mdi:account-group-outline" className="text-xl" />{" "}
            <span className="d-none d-md-inline-block">View</span>{" "}
          </button>
        )}

        {hasPermission({ action: "edit_event" }) && (
          <ActionsEvent
            event={event}
            trigger={(open) => (
              <button
                className="btn btn-street-edit d-none d-sm-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                style={{ width: "43px", height: "40px" }}
                onClick={open}
              >
                <Icon icon="mdi:pencil" className="text-xl" />
              </button>
            )}
          />
        )}
        <button
          disabled={isFull || isRegistering || isUnregistering}
          onClick={isRegistered ? handleSignout : handleSignup}
          className={`btn btn-street-primary btn-street-lg d-flex align-items-center justify-content-center radius-12  gap-2 text-xs ${
            isRegistered ? "btn-street-delete" : ""
          }`}
        >
          {(isRegistering || isUnregistering) && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          {isRegistered ? (
            <Icon
              icon="mdi:calendar-remove"
              className="d-inline-block d-md-none text-xl"
            />
          ) : (
            <Icon
              icon="mdi:calendar-check"
              className="d-inline-block d-md-none text-xl"
            />
          )}

          <span className="d-none d-md-inline-block ">
            {" "}
            {isFull
              ? "Full"
              : isRegistered
              ? "Cancel Registration"
              : "Register"}
          </span>
        </button>
      </div>
    );
  }
  const gridClass =
    isPastEvent && event.documents.length > 0
      ? "col-6 col-md-3 d-flex flex-column gap-1"
      : "col-6 col-md-4 d-flex flex-column gap-1";
  return (
    <AnnouncementCardWrapper
      title={title}
      created_At={dayjs(createdAt).format("YYYY-MM-DD")}
      description={description}
      CTATrigger={actionButton}
    >
      {/* Event details */}
      <div className="p-8 p-md-16 rounded-1 d-flex flex-column align-content-center bg-event-details gap-3">
        <div className="row g-3">
          {/* Date & Time */}
          <div className={gridClass}>
            <p className="text-xxs xs:text-xs fw-normal">Date & Time</p>
            <p className="text-xs xs:text-sm fw-semibold">{formattedDate}</p>
            <p className="text-xxs xs:text-xs fw-normal">
              {formattedTimeRange}
            </p>
          </div>

          {/* Location */}
          <div className={gridClass}>
            <p className="text-xxs xs:text-xs fw-normal">Location</p>
            <a
              href={location.location_url}
              target="_blank"
              className="text-xs xs:text-sm fw-semibold"
            >
              {location.location_name}
            </a>
          </div>

          <div className={gridClass}>
            <p className="text-xxs xs:text-xs fw-normal">Created By</p>
            <p className="text-xs xs:text-sm fw-semibold">
              {createdBy.firstname + " " + createdBy.lastname}
            </p>
          </div>
          {isPastEvent && event.documents.length > 0 && (
            <div className={gridClass}>
              <p className="text-xxs xs:text-xs fw-normal">Documents</p>
              <p
                className="text-xs xs:text-sm fw-semibold link-street-primary cursor-pointer"
                style={{ textDecoration: "none" }}
                onClick={() => setOpen(true)}
              >
                <Icon icon="lucide:paperclip" className="text-sm me-2" />{" "}
                {event.documents.length} uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration progress */}
      <div className="d-flex flex-row align-items-center gap-16">
        <span className="text-xxs sm:text-xs fw-normal text-street-base">
          {totalRegistered}/{capacity} registered
        </span>
        <div
          className="progress h-6-px probar bg-street-primary-10"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar rounded-pill bg-street-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <EventDocuments
        eventName={event.title}
        files={event.documents ?? []}
        onOpenChange={setOpen}
        open={open}
        eventId={eventId}
      />
      {hasPermission({
        action: "view_registerations",
      }) && (
        <ViewRegistrations
          eventId={eventId}
          open={registrationsOpen}
          onOpenChange={setRegistrationsOpen}
        />
      )}
      {hasPermission({
        action: "view_registerations",
      }) && (
        <EventDocsUploader
          open={docopen}
          eventId={event._id}
          onOpenChange={setDocOpen}
          eventName={event.title}
        />
      )}

      <hr className="d-sm-none d-block" />

      <div className="row g-3 justify-content-end">
        {hasPermission({ action: "view_registerations" }) && (
          <div className="col-6 d-sm-none">
            <button
              className="btn btn-info-600 radius-12 text-xs d-flex align-items-center justify-content-center gap-2 w-100"
              title="View Registrations"
              onClick={() => setRegistrationsOpen(true)}
            >
              <Icon icon="mdi:account-group-outline" className="text-xl" />
              <span className="d-inline-block">View</span>
            </button>
          </div>
        )}

        {hasPermission({ action: "edit_event" }) && !isPastEvent && (
          <div className="col-6 d-sm-none">
            <ActionsEvent
              event={event}
              trigger={(open) => (
                <button
                  className="btn btn-street-edit text-xs d-flex align-items-center justify-content-center radius-12 gap-2 w-100"
                  style={{ height: "40px" }}
                  onClick={open}
                >
                  <Icon icon="mdi:pencil" className="text-xl" />
                  <span className="d-inline-block">Edit</span>
                </button>
              )}
            />
          </div>
        )}
        {hasPermission({
          action: "view_registerations",
        }) &&
          isPastEvent && (
            <div className="col-6 d-sm-none">
              <button
                className="btn  btn-street-edit  text-xs d-flex flex-row align-items-center justify-content-center gap-2 radius-12 w-100"
                onClick={() => setDocOpen(true)}
              >
                <Icon icon="lucide:upload" className="text-xl" />
                <span className="d-inline-block">Upload Docs</span>
              </button>
            </div>
          )}
      </div>
    </AnnouncementCardWrapper>
  );
};

export default EventCard;
