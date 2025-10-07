import React from "react";
import { Spinner } from "react-bootstrap";
import AnnouncementCardWrapper from "./AnnouncementCardWrapper";
import dayjs from "dayjs";
import {
  useSignOutFromEventMutation,
  useSignUpForEventMutation,
} from "../../../../services/EventApi";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import { showSuccess } from "../../../../utills/toastutills";

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
    facilitator,
    description,
    title,
    totalRegistered,
    createdAt,
  } = event;

  const progress = Math.min((totalRegistered / capacity) * 100, 100);
  const formattedDate = dayjs(eventDate).format("MM/DD/YYYY");
  const formattedTimeRange =
    startTime && endTime
      ? `${dayjs(startTime).format("hh:mm A")} - ${dayjs(endTime).format(
          "hh:mm A"
        )}`
      : "";
  const isFull = totalRegistered >= capacity;

  // Mutations
  const [registerEvent, { isLoading: isRegistering }] =
    useSignUpForEventMutation();
  const [signOutEvent, { isLoading: isUnregistering }] =
    useSignOutFromEventMutation();

  // Handle Register
  const handleSignup = async () => {
    try {
      const res = await registerEvent(eventId).unwrap();
      if (res.success) showSuccess(res.message);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle Unregister
  const handleSignout = async () => {
    try {
      const res = await signOutEvent(eventId).unwrap();
      if (res.success) showSuccess(res.message);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AnnouncementCardWrapper
      title={title}
      createdBy={createdBy.firstname + " " + createdBy.lastname}
      created_At={dayjs(createdAt).format("YYYY-MM-DD")}
      description={description}
      CTATrigger={
        <button
          disabled={isFull || isRegistering || isUnregistering}
          onClick={isRegistered ? handleSignout : handleSignup}
          className={`btn btn-street-primary d-flex align-items-center justify-content-center radius-12 w-160-px gap-2 text-xs ${
            isRegistered ? "btn-street-delete" : ""
          }`}
        >
          {(isRegistering || isUnregistering) && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          {isFull ? "Full" : isRegistered ? "Cancel Registration" : "Sign Up"}
        </button>
      }
    >
      {/* Event details */}
      <div className="p-8 p-md-16 rounded-1 d-flex flex-column align-content-center bg-event-details gap-3">
        <div className="row g-3">
          {/* Date & Time */}
          <div className="col-6 col-md-4 d-flex flex-column gap-1">
            <p className="text-xxs xs:text-xs fw-normal">Date & Time</p>
            <p className="text-xs xs:text-sm fw-semibold">{formattedDate}</p>
            <p className="text-xxs xs:text-xs fw-normal">
              {formattedTimeRange}
            </p>
          </div>

          {/* Location */}
          <div className="col-6 col-md-4 d-flex flex-column gap-1">
            <p className="text-xxs xs:text-xs fw-normal">Location</p>
            <p className="text-xs xs:text-sm fw-semibold">{location}</p>
          </div>

          {/* Facilitator (optional) */}
          {facilitator && (
            <div className="col-6 col-md-4 d-flex flex-column gap-1">
              <p className="text-xxs xs:text-xs fw-normal">Facilitator</p>
              <p className="text-xs xs:text-sm fw-semibold">{facilitator}</p>
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
      <hr className="d-block d-sm-none bg-street-base" />
      <div className="d-flex d-sm-none justify-content-end">
        <button
          disabled={isFull || isRegistering || isUnregistering}
          onClick={isRegistered ? handleSignout : handleSignup}
          className={`btn btn-street-primary d-flex align-items-center justify-content-center radius-12 w-160-px gap-2 text-xs ${
            isRegistered ? "btn-outline-danger" : ""
          }`}
        >
          {(isRegistering || isUnregistering) && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          {isFull ? "Full" : isRegistered ? "Cancel Registration" : "Sign Up"}
        </button>
      </div>
    </AnnouncementCardWrapper>
  );
};

export default EventCard;
