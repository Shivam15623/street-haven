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
import { TimePicker } from "../../../../components/child/TimePicker";
import QuillEditor from "../../../../components/child/QuillEditor";

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
      "End time must be later than start time and within the same day",
      function (val) {
        const { startTime, eventDate } = this.parent;
        if (!val || !startTime || !eventDate) return true;

        const start = new Date(`${eventDate}T${startTime}`);
        const end = new Date(`${eventDate}T${val}`);

        // End must be after start
        if (end <= start) return false;

        // Check both times are within the same date (no next-day times)
        return end.getDate() === start.getDate();
      }
    ),
});

type EventFormValues = Yup.InferType<typeof EventFormSchema>;

const ActionsEvent = ({ id }: { id?: string }) => {
  const isEdit = Boolean(id);
  const [showModal, setShowModal] = React.useState(false);
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const [editEvent, { isLoading: isEditLoading }] = useEditEventMutation();

  const handleCreate = async (
    values: EventFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const payload = {
      ...values,
      eventDate: new Date(values.eventDate),
      startTime: new Date(`${values.eventDate}T${values.startTime}`),
      endTime: new Date(`${values.eventDate}T${values.endTime}`),
    };
    const res = await createEvent(payload).unwrap();
    if (res.success) {
      showSuccess(res.message);
      resetForm();
      setShowModal(false);
    }
  };

  const handleEdit = async (values: EventFormValues) => {
    if (id) {
      const payload = {
        ...values,
        eventDate: new Date(values.eventDate),
        startTime: new Date(`${values.eventDate}T${values.startTime}`),
        endTime: new Date(`${values.eventDate}T${values.endTime}`),
      };
      const res = await editEvent({ cred: payload, id: id }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className="btn btn-street-primary"
        onClick={() => setShowModal(true)}
      >
        {isEdit ? "Edit Event" : "Create Event"}
      </button>

      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => setShowModal(false)}
        title={isEdit ? "Edit Event" : "Create Event"}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 px-12 px-sm-16 px-md-28 text-sm"
              type="submit"
              form={isEdit ? "event-edit-form" : "event-create-form"}
              disabled={isLoading || isEditLoading}
            >
              {isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 px-12 px-sm-16 px-md-28 text-sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <Formik
          validationSchema={EventFormSchema}
          initialValues={{
            title: "",
            description: "",
            locationName: "",
            locationUrl: "",
            facilitator: "",
            capacity: 0,
            eventDate: "",
            startTime: "",
            endTime: "",
          }}
          onSubmit={isEdit ? handleEdit : handleCreate}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            setFieldTouched,
          }) => (
            <Form
              id={isEdit ? "event-ed" : "event-create-form"}
              onSubmit={handleSubmit}
              className="d-flex flex-column gap-16 gap-sm-20"
            >
              {/* Title */}
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

              {/* Description */}
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

              {/* Location Name */}
              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                <Col md={6}>
                  {" "}
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
                </Col>{" "}
                <Col md={6}>
                  {" "}
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

              {/* Facilitator */}
              <Form.Group className="d-flex flex-column gap-1">
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
              <Form.Group className="d-flex flex-column gap-1">
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

              {/* Event Date */}
              <Form.Group className="d-flex flex-column gap-1">
                <Form.Label>Event Date</Form.Label>
                <CustomDatePicker
                  value={values.eventDate ? new Date(values.eventDate) : null}
                  onChange={(date) => {
                    setFieldValue(
                      "eventDate",
                      date ? date.toISOString().split("T")[0] : ""
                    );
                    setFieldTouched("eventDate", true);
                  }}
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
                  {" "}
                  {/* Start Time */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>Start Time</Form.Label>
                    <TimePicker
                      name="startTime"
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
                </Col>{" "}
                <Col md={6}>
                  {/* End Time */}
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label>End Time</Form.Label>
                    <TimePicker
                      name="endTime"
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
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default ActionsEvent;
