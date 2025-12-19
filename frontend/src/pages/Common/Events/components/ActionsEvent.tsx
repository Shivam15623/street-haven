import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import {
  useCreateEventMutation,
  useEditEventMutation,
} from "../../../../services/EventApi";
import { showSuccess } from "../../../../utills/toastutills";
import { Formik } from "formik";
import * as Yup from "yup";
import { Col, Form, Row } from "react-bootstrap";
import CustomDatePicker from "../../../../components/child/DatePicker";
import TimePicker from "../../../../components/child/TimePicker";
import QuillEditor from "../../../../components/child/QuillEditor";
import type { EventUpcomingData } from "../../../../interfaces/EventInterfaces";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import dayjs from "dayjs";

const EventFormSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  locationName: Yup.string().required("Location is required"),
  locationUrl: Yup.string()
    .url("Enter a valid map URL")
    .required("Location URL is required"),
  facilitator: Yup.string().required("Facilitator name is required"),
  capacity: Yup.number()
    .required("Capacity is required")
    .positive("Capacity must be greater than 0")
    .integer("Capacity must be an integer"),
  eventDate: Yup.string()
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

const ActionsEvent = ({ event }: { event?: EventUpcomingData }) => {
  const isEdit = Boolean(event?._id);
  const [showModal, setShowModal] = React.useState(false);

  const [createEvent, { isLoading }] = useCreateEventMutation();
  const [editEvent, { isLoading: isEditLoading }] = useEditEventMutation();

  const handleCreate = async (
    values: EventFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const tempDate = new Date(values.eventDate).toISOString().split("T")[0];
    const payload = {
      ...values,
      eventDate: new Date(values.eventDate),
      startTime: new Date(`${tempDate}T${values.startTime}`),
      endTime: new Date(`${tempDate}T${values.endTime}`),
    };
    console.log("payload", payload);
    const res = await createEvent(payload).unwrap();
    if (res.success) {
      showSuccess(res.message);
      resetForm();
      setShowModal(false);
    }
  };

  const handleEdit = async (values: EventFormValues) => {
    if (!event?._id) return;
    const tempDate = new Date(values.eventDate).toISOString().split("T")[0];
    const payload = {
      ...values,
      eventDate: new Date(values.eventDate),
      startTime: new Date(`${tempDate}T${values.startTime}`),
      endTime: new Date(`${tempDate}T${values.endTime}`),
    };
    const res = await editEvent({ cred: payload, id: event._id }).unwrap();
    if (res.success) {
      showSuccess(res.message);
      setShowModal(false);
    }
  };

  const initialValues: EventFormValues = {
    title: event?.title || "",
    description: event?.description || "",
    locationName: event?.location.location_name || "",
    locationUrl: event?.location.location_url || "",
    facilitator: event?.facilitator || "",
    capacity: event?.capacity || 0,
    eventDate: event?.eventDate
      ? new Date(event.eventDate).toISOString().split("T")[0]
      : "",
    startTime: event?.startTime ? dayjs(event.startTime).format("HH:mm") : "",
    endTime: event?.endTime ? dayjs(event.endTime).format("HH:mm") : "",
  };

  return (
    <>
      {/* Trigger Button */}
      {isEdit ? (
        <button
          className="btn btn-street-edit d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
          style={{ width: "43px", height: "40px" }}
          onClick={() => setShowModal(true)}
        >
          <Icon icon="mdi:pencil" className="text-xl" />
        </button>
      ) : (
        <button
          className="btn btn-street-primary btn-street-lg radius-12 d-flex  flex-row align-items-center justify-content-center text-sm"
          onClick={() => setShowModal(true)}
        >
          Create Event
        </button>
      )}

      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => setShowModal(false)}
        title={isEdit ? "Edit Event" : "Create Event"}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isLoading || isEditLoading}
            variant="spinner" // spinner | dots | pulse | progress
            message="Saving changes..."
            subMessage="Please wait"
          />
        }
        isLoading={isLoading || isEditLoading}
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex flex-row align-items-center justify-content-center text-sm"
              type="submit"
              form={isEdit ? "event-edit-form" : "event-create-form"}
              disabled={isLoading || isEditLoading}
            >
              {isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex flex-row align-items-center justify-content-center text-sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <Formik
          validationSchema={EventFormSchema}
          initialValues={initialValues}
          enableReinitialize
          onSubmit={isEdit ? handleEdit : handleCreate}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            handleBlur,
            setFieldTouched,
          }) => {
            console.log("Formik Errors:", errors, values.endTime);
            console.log("Formik Touched:", touched);
            return (
              <Form
                id={isEdit ? "event-edit-form" : "event-create-form"}
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-16 gap-sm-20"
              >
                {/* Title */}
                <Form.Group>
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

                {/* Description */}
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <QuillEditor
                    content={values.description}
                    onChange={(val) => setFieldValue("description", val)}
                    isInvalid={touched.description && !!errors.description}
                    errorMessage={errors.description as string}
                  />
                </Form.Group>

                {/* Location */}
                <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location Name</Form.Label>
                      <Form.Control
                        name="locationName"
                        value={values.locationName}
                        onChange={handleChange}
                        isInvalid={
                          !!errors.locationName && touched.locationName
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.locationName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location URL</Form.Label>
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

                {/* Facilitator */}
                <Form.Group>
                  <Form.Label>Facilitator</Form.Label>
                  <Form.Control
                    name="facilitator"
                    value={values.facilitator}
                    onChange={handleChange}
                    isInvalid={!!errors.facilitator && touched.facilitator}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.facilitator}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Capacity */}
                <Form.Group>
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={values.capacity}
                    onChange={handleChange}
                    isInvalid={!!errors.capacity && touched.capacity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Date and Time */}
                <Form.Group>
                  <Form.Label>Event Date</Form.Label>
                  <CustomDatePicker
                    name="eventDate"
                    value={values.eventDate ? new Date(values.eventDate) : null}
                    onChange={(date) => {
                      setFieldValue("eventDate", date, true); // ← Add true to validate immediately
                      setFieldTouched("eventDate", true, false); // ← false prevents double validation
                    }}
                    onBlur={handleBlur}
                    isInvalid={!!errors.eventDate && touched.eventDate}
                  />
                  {errors.eventDate && touched.eventDate && (
                    <div className="invalid-feedback d-block">
                      {errors.eventDate}
                    </div>
                  )}
                </Form.Group>

                <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Start Time</Form.Label>
                      <TimePicker
                        className={
                          touched.startTime && errors.startTime
                            ? "is-invalid"
                            : ""
                        }
                        value={values.startTime}
                        onChange={(val) => setFieldValue("startTime", val)}
                        onBlur={() => setFieldTouched("startTime", true)}
                      />
                      {errors.startTime && touched.startTime && (
                        <div className="invalid-feedback d-block">
                          {errors.startTime}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>End Time</Form.Label>
                      <TimePicker
                        className={
                          touched.endTime && errors.endTime ? "is-invalid" : ""
                        }
                        value={values.endTime}
                        onChange={(val) => setFieldValue("endTime", val)}
                        onBlur={() => setFieldTouched("endTime", true)}
                      />
                      {errors.endTime && touched.endTime && (
                        <div className="invalid-feedback d-block">
                          {errors.endTime}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            );
          }}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default ActionsEvent;
