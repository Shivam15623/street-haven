import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import {
  useCreateEventMutation,
  useEditEventMutation,
} from "../../../../services/EventApi";
import { showSuccess } from "../../../../utills/toastutills";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form } from "react-bootstrap";

const EventFormSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
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
        const { startTime, eventDate } = this.parent;
        if (!val || !startTime || !eventDate) return true;
        const start = new Date(`${eventDate}T${startTime}`);
        const end = new Date(`${eventDate}T${val}`);
        return end > start;
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
    const res = await editEvent(values).unwrap();
    if (res.success) {
      showSuccess(res.message);
      setShowModal(false);
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
            location: "",
            facilitator: "",
            capacity: 0,
            eventDate: "",
            startTime: "",
            endTime: "",
          }}
          onSubmit={isEdit ? handleEdit : handleCreate}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
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
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  isInvalid={!!errors.description && touched.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Location */}
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  isInvalid={!!errors.location && touched.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>

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

              {/* Event Date */}
              <Form.Group>
                <Form.Label>Event Date</Form.Label>
                <Form.Control
                  type="date"
                  name="eventDate"
                  value={values.eventDate}
                  onChange={handleChange}
                  isInvalid={!!errors.eventDate && touched.eventDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.eventDate}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Start Time */}
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={values.startTime}
                  onChange={handleChange}
                  isInvalid={!!errors.startTime && touched.startTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startTime}
                </Form.Control.Feedback>
              </Form.Group>

              {/* End Time */}
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={values.endTime}
                  onChange={handleChange}
                  isInvalid={!!errors.endTime && touched.endTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endTime}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default ActionsEvent;
