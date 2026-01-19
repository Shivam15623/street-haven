import React, { useState } from "react";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import ModalWrapper from "../../../../components/child/ModalWrapper";

import dayjs from "dayjs";
import {
  useEditEventMutation,
  useSignOutFromEventMutation,
  useSignUpForEventMutation,
} from "../../../../services/EventApi";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { showError, showSuccess } from "../../../../utills/toastutills";
import Badge from "../../../../components/child/Badge";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Formik } from "formik";
import * as Yup from "yup";
import TimePicker from "../../../../components/child/TimePicker";
import CustomDatePicker from "../../../../components/child/DatePicker";
import QuillEditor from "../../../../components/child/QuillEditor";
import DOMPurify from "dompurify";
import useHasPermission from "../../../../hooks/Auth";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import StreetTab from "../../../../components/StreetTab";
import FileTab from "../../../../components/child/FileTab";
import type { FileItem } from "../../../../interfaces/fileinterface";
import FileViewer from "../../../../components/FileViewer/FileViewer";
import EventDocsUploader from "./EventDocsUploader";
import { getErrorMessage } from "../../../../utills/utills";

interface EventDetailsModalProps {
  event: EventUpcomingData;
  open: boolean;
  handleClose: () => void;
}

const EventFormSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  locationName: Yup.string().required("Location is required"),
  locationUrl: Yup.string()
    .url("Enter a valid map URL")
    .required("Location URL is required"),

  capacity: Yup.number()
    .required("Capacity is required")
    .positive("Capacity must be greater than 0")
    .integer("Capacity must be an integer"),
  eventDate: Yup.date()
    .required("Event date is required")
    .test("not-in-past", "Event date cannot be in the past", (val) => {
      if (!val) return false;
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }),

  startTime: Yup.string().required("Start time is required"),

  endTime: Yup.string()
    .required("End time is required")
    .test(
      "end-after-start",
      "End time must be later than start time",
      function (val) {
        const { startTime } = this.parent;
        if (!val || !startTime) return true;

        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = val.split(":").map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        return endMinutes > startMinutes;
      }
    ),
});

type EventFormValues = Yup.InferType<typeof EventFormSchema>;
const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  open,
  handleClose,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [registerEvent, { isLoading: isRegistering }] =
    useSignUpForEventMutation();
  const [signOutEvent, { isLoading: isUnregistering }] =
    useSignOutFromEventMutation();
  const [editEvent, { isLoading: isEditing }] = useEditEventMutation();
  const { hasPermission } = useHasPermission();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [docopen, setDocOpen] = useState(false);
  if (!event) return null;
  const {
    _id: eventId,
    capacity,
    createdBy,
    isRegistered,
    eventDate,
    endTime,
    startTime,
    location,
    documents,
    description,
    title,
    totalRegistered,
    createdAt,
  } = event;
  const isPastEvent = dayjs(eventDate).isBefore(dayjs(), "day");

  // --- GROUP FILES ---

  const images = isPastEvent
    ? documents.filter((f) => f.fileType === "image")
    : [];

  const docs = isPastEvent
    ? documents.filter((f) =>
        ["pdf", "doc", "docx", "txt", "ppt", "pptx"].includes(f.fileType)
      )
    : [];

  const videos = isPastEvent
    ? documents.filter((f) => f.fileType === "video")
    : [];

  const others = isPastEvent
    ? documents.filter(
        (f) => !images.includes(f) && !docs.includes(f) && !videos.includes(f)
      )
    : [];
  // --- OPEN CORRECT FILE IN VIEWER ---
  const handleOpenFile = (file: FileItem) => {
    const globalIndex = documents.findIndex((f) => f.fileUrl === file.fileUrl);
    setSelectedIndex(globalIndex);
    setViewerOpen(true);
  };

  const formattedTimeRange =
    startTime && endTime
      ? `${dayjs(startTime).format("hh:mm A")} -  ${dayjs(endTime).format(
          "hh:mm A"
        )}`
      : "";
  const spLeft = capacity - totalRegistered;
  const isFull = totalRegistered >= capacity;
  let commonActionButton;
  const handleEdit = async (
    values: EventFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const eventDate = values.eventDate;

    const [sh, sm] = values.startTime.split(":").map(Number);
    const [eh, em] = values.endTime.split(":").map(Number);

    const startDateTime = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      sh,
      sm
    );

    const endDateTime = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      eh,
      em
    );

    const payload = {
      ...values,
      eventDate, // keep as Date
      startTime: startDateTime,
      endTime: endDateTime,
    };
    const res = await editEvent({ cred: payload, id: eventId }).unwrap();
    if (res.success) {
      showSuccess(res.message);
      resetForm();
      setEditMode(false);
    }
  };
  // Handle Register
  const handleSignup = async () => {
    try {
      const res = await registerEvent(eventId).unwrap();
      if (res.success) {
        showSuccess(res.message);
        handleClose();
      }
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  // Handle Unregister
  const handleSignout = async () => {
    try {
      const res = await signOutEvent(eventId).unwrap();
      if (res.success) {
        showSuccess(res.message);
        handleClose();
      }
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  if (isPastEvent) {
    // For past events — only show registration status
    commonActionButton = (
      <button
        disabled
        type="button"
        className={`btn d-flex align-items-center justify-content-center radius-12 btn-street-lg  gap-2 text-xs ${
          isRegistered ? "btn-success" : "btn-secondary"
        }`}
      >
        {isRegistered ? "You registered for this" : "You didn’t register"}
      </button>
    );
  } else {
    // For upcoming events — allow signup/cancel
    commonActionButton = (
      <button
        disabled={isFull || isRegistering || isUnregistering}
        type="button"
        onClick={isRegistered ? handleSignout : handleSignup}
        className={`btn btn-street-primary d-flex align-items-center justify-content-center radius-12 btn-street-lg gap-2 text-xs ${
          isRegistered ? "btn-street-delete" : ""
        }`}
      >
        {(isRegistering || isUnregistering) && (
          <Spinner animation="border" size="sm" className="me-2" />
        )}
        {isFull ? "Full" : isRegistered ? "Cancel Registration" : "Register"}
      </button>
    );
  }

  return (
    <ModalWrapper
      show={open}
      size="lg"
      onHide={() => {
        setEditMode(false);
        handleClose();
      }}
      title="Event Details"
      headerClassName="text-xl font-semibold text-street-dark"
      className="p-6"
      bodyClassName="flex flex-col gap-4"
      footerClassName="flex justify-end gap-3"
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isEditing}
          variant="spinner" // spinner | dots | pulse | progress
          message="Saving changes..."
          subMessage="Please wait"
        />
      }
      footer={
        <div
          className={`d-flex w-100 flex-row ${
            isPastEvent ? "justify-content-between" : "justify-content-end"
          }`}
        >
          {isPastEvent &&
            hasPermission({
              action: "view_registerations",
            }) && (
              <button
                className="btn btn-street-outline-primary d-flex flex-row align-items-center justify-content-center radius-12"
                onClick={() => setDocOpen(true)}
              >
                <Icon icon="lucide:upload" className="text-xl" />{" "}
                <span>Upload Documents</span>
              </button>
            )}

          {isPastEvent &&
            hasPermission({
              action: "view_registerations",
            }) && (
              <EventDocsUploader
                open={docopen}
                eventId={event._id}
                onOpenChange={setDocOpen}
                eventName={event.title}
              />
            )}
          <div className="d-flex gap-3">
            {editMode ? (
              <>
                <button
                  className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
                  type="submit"
                  form="Temp-edit-form"
                  disabled={isEditing}
                >
                  {isEditing ? "Saving" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); // 🛑 Stops any form submission event
                    e.stopPropagation(); // 🛑 Stops bubbling to parent form
                    setEditMode(false);
                  }}
                  className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {hasPermission({ action: "edit_event" }) && (
                  <button
                    type="button"
                    className="btn btn-street-edit  btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
                    onClick={(e) => {
                      e.preventDefault(); // 🛑 Stops any form submission event
                      e.stopPropagation(); // 🛑 Stops bubbling to parent form
                      setEditMode(true);
                    }}
                  >
                    Edit
                  </button>
                )}
                {commonActionButton}
              </>
            )}
          </div>
        </div>
      }
    >
      {editMode ? (
        <Formik
          initialValues={{
            title: event.title || "",
            description: event.description || "",

            capacity: event.capacity || 0,
            eventDate: new Date(event.eventDate),
            startTime: dayjs(event.startTime).format("HH:mm"),
            endTime: dayjs(event.endTime).format("HH:mm"),
            locationName: event.location.location_name || "",
            locationUrl: event.location.location_url || "",
          }}
          validationSchema={EventFormSchema}
          onSubmit={handleEdit}
        >
          {({
            values,
            handleChange,
            setFieldValue,
            setFieldTouched,
            errors,
            touched,
            handleSubmit,
          }) => (
            <Form
              id="Temp-edit-form"
              className="d-flex flex-column gap-3"
              onSubmit={handleSubmit}
            >
              <Form.Group className="d-flex flex-column gap-1">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title && touched.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                <Col md={4}>
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Event Date</Form.Label>
                    <CustomDatePicker
                      value={
                        values.eventDate ? new Date(values.eventDate) : null
                      }
                      onChange={(date) => {
                        setFieldValue("eventDate", date, true); // ← Add true to validate immediately
                        setFieldTouched("eventDate", true, false); // ← false prevents double validation
                      }}
                      isInvalid={!!errors.eventDate && !!touched.eventDate}
                    />

                    {errors.eventDate && touched.eventDate && (
                      <div className="invalid-feedback d-block">
                        {errors.eventDate as string}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  {/* Start Time */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Start Time</Form.Label>
                    <TimePicker
                      //  isInvalid={!!errors.startTime && touched.startTime}
                      className={
                        touched.startTime && errors.startTime
                          ? "is-invalid"
                          : ""
                      }
                      value={values.startTime}
                      onChange={(val) => setFieldValue("startTime", val)}
                      onBlur={() => setFieldTouched("startTime", true)} // 👈 handled automatically
                    />

                    {errors.startTime && touched.startTime && (
                      <div className="invalid-feedback d-block">
                        {errors.startTime}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  {/* End Time */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>End Time</Form.Label>
                    <TimePicker
                      className={
                        touched.endTime && errors.endTime ? "is-invalid" : ""
                      }
                      value={values.endTime}
                      onChange={(val) => setFieldValue("endTime", val)}
                      onBlur={() => setFieldTouched("endTime", true)} // 👈 handled automatically
                    />

                    {errors.endTime && touched.endTime && (
                      <div className="invalid-feedback d-block">
                        {errors.endTime}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="d-flex flex-column gap-1">
                <Form.Label>Description</Form.Label>
                <QuillEditor
                  content={values.description}
                  onChange={(val) => setFieldValue("description", val)}
                  isInvalid={touched.description && !!errors.description}
                  errorMessage={errors.description as string}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                <Col md={6}>
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Location Name</Form.Label>
                    <Form.Control
                      name="locationName"
                      value={values.locationName}
                      onChange={handleChange}
                      isInvalid={!!errors.locationName && touched.locationName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.locationName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {/* Location URL */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Location URL (Google Maps or other)</Form.Label>
                    <Form.Control
                      name="locationUrl"
                      value={values.locationUrl}
                      onChange={handleChange}
                      placeholder="https://maps.app.goo.gl/..."
                      isInvalid={!!errors.locationUrl && touched.locationUrl}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.locationUrl}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                <Col md={6}>
                  {" "}
                  {/* Location URL */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                      type="number"
                      name="capacity"
                      value={values.capacity}
                      disabled={isFull}
                      onChange={handleChange}
                      isInvalid={!!errors.capacity && touched.capacity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.capacity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex flex-column gap-2">
            <p className="text-street-dark fw-semibold">Title</p>
            <p className="text-street-base">{title}</p>
          </div>
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
              {" "}
              <div className="d-flex flex-column gap-2">
                <p className="text-street-dark fw-semibold">Time</p>
                <p className="text-street-base">{formattedTimeRange}</p>
              </div>
            </Col>
          </Row>

          <div className="d-flex flex-column gap-2">
            <p className="text-street-dark fw-semibold">Description</p>
            <div
              className="parse Te"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description),
              }}
            />
          </div>
          <div className="d-flex flex-column gap-2">
            <p className="text-street-dark fw-semibold">Location</p>
            <a
              href={location.location_url}
              target="_blank"
              className="text-street-primary"
            >
              {location.location_name}
            </a>
          </div>

          <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
            <Col md={4}>
              <div className="d-flex flex-column gap-2">
                <p className="text-street-dark fw-semibold">Capacity</p>
                <p className="text-street-base">{capacity}</p>
              </div>
            </Col>
            <Col md={4}>
              {" "}
              <div className="d-flex flex-column gap-2">
                <p className="text-street-dark fw-semibold">Registered</p>
                <p className="text-street-base">{totalRegistered}</p>
              </div>
            </Col>
            <Col md={4}>
              {" "}
              <div className="d-flex flex-column gap-2">
                <p className="text-street-dark fw-semibold">Status</p>
                <div>
                  {" "}
                  <Badge className="text-street-base" variant="primary-soft">
                    {spLeft} spots available
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
          <div className="d-flex flex-column gap-2">
            <p className="text-street-dark fw-semibold">Your Registeration</p>
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
          <div className="d-flex flex-column gap-2">
            <p className="text-street-dark fw-semibold">Created</p>
            <p className="text-street-base">
              {" "}
              {dayjs(createdAt).format("MMMM DD YYYY")}{" "}
              {createdBy.firstname + " " + createdBy.lastname}
            </p>
          </div>
          {isPastEvent && documents?.length > 0 && (
            <>
              <StreetTab
                tabs={[
                  {
                    key: "images",
                    label: "Images",
                    content: (
                      <FileTab
                        files={images}
                        tab="Images"
                        handleOpenFile={handleOpenFile}
                        eventId={eventId}
                      />
                    ),
                  },
                  {
                    key: "docs",
                    label: "Documents",
                    content: (
                      <FileTab
                        files={docs}
                        tab="Documents"
                        handleOpenFile={handleOpenFile}
                        eventId={eventId}
                      />
                    ),
                  },
                  {
                    key: "videos",
                    label: "Videos",
                    content: (
                      <FileTab
                        files={videos}
                        tab="Videos"
                        handleOpenFile={handleOpenFile}
                        eventId={eventId}
                      />
                    ),
                  },
                  {
                    key: "others",
                    label: "Others",
                    content: (
                      <FileTab
                        files={others}
                        tab="Other Documents"
                        handleOpenFile={handleOpenFile}
                        eventId={eventId}
                      />
                    ),
                  },
                ]}
              />
              {documents.length > 0 && (
                <FileViewer
                  files={documents}
                  initialIndex={selectedIndex}
                  open={viewerOpen}
                  onOpenChange={setViewerOpen}
                />
              )}
            </>
          )}
        </div>
      )}
    </ModalWrapper>
  );
};

export default EventDetailsModal;
