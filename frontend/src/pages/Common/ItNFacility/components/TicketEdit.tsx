import React, { useState } from "react";
import { Col, Row, Form,Spinner } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEditTicketMutation } from "../../../../services/ticketApi";
import { showSuccess } from "../../../../utills/toastutills";
import type { TicketData } from "../../../../interfaces/Ticket";
// ✅ Validation Schema
const TicketSchema = Yup.object({
  requestTitle: Yup.string().required("Request title is required"),
  requester: Yup.string().required("Requester is required"),
  assignee: Yup.string().required("Assignee is required"),
  status: Yup.string().required("Status is required"),
  id: Yup.string().required("Ticket ID is required"),
  description: Yup.string().required("Description is required"),
  priority: Yup.string().required("Priority is required"),
  category: Yup.string().required("Category is required"),
  location: Yup.string().required("Location is required"),
  attachment: Yup.string().required("Attachment is required"),
});

type TicketValues = Yup.InferType<typeof TicketSchema>;

interface TicketCardProps {
  ticket: TicketData;
}

const TicketEdit: React.FC<TicketCardProps> = ({ ticket }) => {
  const [showModal, setShowModal] = useState(false);
  const [editTicket, { isLoading }] = useEditTicketMutation();

  const initialValues: TicketValues = {
    requestTitle: ticket.req_title,
    requester: ticket.createdBy.firstname + " " + ticket.createdBy.lastname,
    assignee: ticket.assignedTo
      ? ticket.assignedTo.firstname + " " + ticket.assignedTo.lastname
      : "Unassigned",
    status: ticket.status,
    id: ticket._id,
    description: ticket.description,
    priority: ticket.priority,
    category: ticket.category,
    location: ticket.location ?? "", // default to empty string
    attachment: ticket.photo?.fileUrl ?? "", // default to empty string
  };

  const handleEdit = async (values: TicketValues) => {
    try {
      const res = await editTicket(values).unwrap();
      if (res.success) {
        showSuccess(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="d-flex justify-content-end">
      <button
        className="btn btn-street-light-primary btn-street-lg ticketcardbtn radius-12 px-12 px-sm-16 px-md-28  text-xs sm:text-sm"
        onClick={() => setShowModal(true)}
      >
        Edit
      </button>

      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => {
          setShowModal(false);
        }}
        title="Ticket Details"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 px-12 px-sm-16 px-md-28 text-xxs xs:text-xs sm:text-sm"
              type="submit"
              form="ticket-form"
            >
              Save
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 px-12 px-sm-16 px-md-28 text-xxs xs:text-xs sm:text-sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={TicketSchema}
          onSubmit={handleEdit}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Form
              noValidate
              onSubmit={handleSubmit}
              as={FormikForm}
              id="ticket-form"
            >
              <div
                className={`position-relative ${
                  isLoading ? "pointer-events-none" : ""
                }`}
              >
                {/* Request Title */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Request Title
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      size="sm"
                      type="text"
                      name="requestTitle"
                      value={values.requestTitle}
                      onChange={handleChange}
                      isInvalid={touched.requestTitle && !!errors.requestTitle}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.requestTitle}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Requester */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Requester
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      size="sm"
                      type="text"
                      name="requester"
                      value={values.requester}
                      onChange={handleChange}
                      isInvalid={touched.requester && !!errors.requester}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.requester}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Assignee */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Assignee
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="assignee"
                      value={values.assignee}
                      onChange={handleChange}
                      isInvalid={touched.assignee && !!errors.assignee}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.assignee}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Status */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Status
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                      isInvalid={touched.status && !!errors.status}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.status}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Ticket ID */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Ticket ID
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="id"
                      value={values.id}
                      onChange={handleChange}
                      isInvalid={touched.id && !!errors.id}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.id}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Description */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Description
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      isInvalid={touched.description && !!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Priority */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Priority
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="priority"
                      value={values.priority}
                      onChange={handleChange}
                      isInvalid={touched.priority && !!errors.priority}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.priority}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Category */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Category
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      isInvalid={touched.category && !!errors.category}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Location */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Location
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      isInvalid={touched.location && !!errors.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {/* Attachment */}
                <Row className="mb-3  ">
                  <Col sm={2}>
                    <p className="text-street-dark text-sm">Attachment</p>
                  </Col>
                  <Col sm={10}>
                    <Icon icon="lucide:paperclip" className="me-1" />
                    <Link
                      className="text-street-primary mt-1 mt-sm-0 text-xs fw-normal"
                      to="#"
                    >
                      printer image.png
                    </Link>
                  </Col>
                </Row>

                {isLoading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center "
                    style={{ zIndex: 10 }}
                  >
                    <Spinner
                      animation="border"
                      role="status"
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderWidth: "0.25rem",
                        color: "var(--street-primary-base)",
                      }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </div>
  );
};

export default TicketEdit;
