import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useGetEventDetailQuery } from "../../../../services/EventApi";
import dayjs from "dayjs";
import Badge from "../../../../components/child/Badge";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Col, Row, Spinner } from "react-bootstrap";
import DOMPurify from "dompurify";

interface EventDetailsPopProps {
  eventslug: string;
  open: boolean;
  handleClose: () => void;
}

const EventDetailspop: React.FC<EventDetailsPopProps> = ({
  open,
  eventslug,
  handleClose,
}) => {
  const { data, isLoading } = useGetEventDetailQuery(eventslug);

  if (isLoading) {
    return (
      <ModalWrapper
        show={open}
        size="lg"
        onHide={handleClose}
        title="Event Details"
        headerClassName="text-xl font-semibold text-street-dark"
        className="p-6 d-flex justify-content-center align-items-center"
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-street-base">Loading event details...</p>
        </div>
      </ModalWrapper>
    );
  }

  const event = data?.data;
  if (!event)
    return (
      <ModalWrapper
        show={open}
        size="lg"
        onHide={handleClose}
        title="Event Details"
        className="p-6"
      >
        <div className="text-center text-muted py-5">
          <p>Event details not available.</p>
        </div>
      </ModalWrapper>
    );

  const {
    capacity,
    createdBy,
    isRegistered,
    endTime,
    startTime,
    location,
    facilitator,
    description,
    title,
    totalRegistered,
    createdAt,
  } = event;

  const formattedTimeRange =
    startTime && endTime
      ? `${dayjs(startTime).format("hh:mm A")} - ${dayjs(endTime).format(
          "hh:mm A"
        )}`
      : "";

  const spLeft = capacity - totalRegistered;

  return (
    <ModalWrapper
      show={open}
      size="lg"
      onHide={handleClose}
      title="Event Details"
      headerClassName="text-xl font-semibold text-street-dark"
      className="p-6"
      bodyClassName="flex flex-col gap-4"
      footerClassName="flex justify-end gap-3"
    >
      <div className="d-flex flex-column gap-3">
        {/* Title */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Title</p>
          <p className="text-street-base">{title}</p>
        </div>

        {/* Date and Time */}
        <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
          <Col md={6}>
            <div className="d-flex flex-column gap-2">
              <p className="text-street-dark fw-semibold">Date</p>
              <p className="text-street-base">
                {dayjs(event.eventDate).format("MMMM DD YYYY")}
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-2">
              <p className="text-street-dark fw-semibold">Time</p>
              <p className="text-street-base">{formattedTimeRange}</p>
            </div>
          </Col>
        </Row>

        {/* Description */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Description</p>
          <div
            className="parse Te"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(description),
            }}
          />
        </div>

        {/* Location */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Location</p>
          <a
            href={location?.location_url}
            target="_blank"
            rel="noreferrer"
            className="text-street-primary"
          >
            {location?.location_name}
          </a>
        </div>

        {/* Facilitator */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Facilitator</p>
          <p className="text-street-base">{facilitator}</p>
        </div>

        {/* Capacity and Status */}
        <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
          <Col md={4}>
            <div className="d-flex flex-column gap-2">
              <p className="text-street-dark fw-semibold">Capacity</p>
              <p className="text-street-base">{capacity}</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex flex-column gap-2">
              <p className="text-street-dark fw-semibold">Registered</p>
              <p className="text-street-base">{totalRegistered}</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex flex-column gap-2">
              <p className="text-street-dark fw-semibold">Status</p>
              <div>
                <Badge className="text-street-base" variant="primary-soft">
                  {spLeft} spots available
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        {/* Registration Status */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Your Registration</p>
          <div>
            {isRegistered ? (
              <Badge
                variant={"success-soft"}
                leftIcon={<Icon icon="akar-icons:check" />}
              >
                Registered
              </Badge>
            ) : (
              <Badge
                variant={"warning-soft"}
                leftIcon={<Icon icon="akar-icons:clock" />}
              >
                Not Registered
              </Badge>
            )}
          </div>
        </div>

        {/* Created Info */}
        <div className="d-flex flex-column gap-2">
          <p className="text-street-dark fw-semibold">Created</p>
          <p className="text-street-base">
            {dayjs(createdAt).format("MMMM DD YYYY")} by{" "}
            {createdBy?.firstname + " " + createdBy?.lastname}
          </p>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EventDetailspop;
