import React, { useState } from "react";
import { Col, Row, Form, Spinner } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEditTicketMutation } from "../../../../services/ticketApi";
import { showSuccess } from "../../../../utills/toastutills";
import type { TicketData } from "../../../../interfaces/Ticket";
import { useAllEmployeesQuery } from "../../../../services/EmployeeApi";
import ImageUpload from "../../../../components/child/Imageupload";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";

import QuillEditor from "../../../../components/child/QuillEditor";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

// ✅ Validation Schema
const TicketSchema = Yup.object({
  requestTitle: Yup.string(),
  requester: Yup.string(),
  assignedId: Yup.string(),
  status: Yup.string(),
  id: Yup.string(),
  description: Yup.string(),
  priority: Yup.string(),
  category: Yup.string(),
  location: Yup.string(),
  photo: Yup.mixed<File>().nullable(),
});

type TicketValues = Yup.InferType<typeof TicketSchema>;

interface TicketCardProps {
  ticket: TicketData;
}

const TicketEdit: React.FC<TicketCardProps> = ({ ticket }) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useSelector(selectAuth);

  const isAssigned = ticket.assignedTo?._id === user?._id;
  const isRequester = ticket.createdBy._id === user?._id;
  const [editphoto, seteditphoto] = useState(false);
  const { data: employeeData, isLoading: isEmployeeLoading } =
    useAllEmployeesQuery({ forDropdown: true });
  const [editTicket, { isLoading }] = useEditTicketMutation();

  const initialValues: TicketValues = {
    requestTitle: ticket.req_title,
    requester: ticket.createdBy.firstname + " " + ticket.createdBy.lastname,
    assignedId: ticket.assignedTo ? ticket.assignedTo._id : "Unassigned",
    status: ticket.status,
    id: ticket._id,
    description: ticket.description,
    priority: ticket.priority,
    category: ticket.category,
    location: ticket.location ?? "", // default to empty string
  };
  const statusOptions = ["Open", "In Progress", "Completed", "Under Review"];
  const handleEdit = async (values: TicketValues) => {
    try {
      const formData = new FormData();
      if (values.requestTitle && values.requestTitle !== ticket.req_title)
        formData.append("requestTitle", values.requestTitle);
      if (values.description && values.description !== ticket.description)
        formData.append("description", values.description);
      if (values.priority && values.priority !== ticket.priority)
        formData.append("priority", values.priority);
      if (values.category && values.category !== ticket.category)
        formData.append("category", values.category);
      if (values.location && values.location !== ticket.location)
        formData.append("location", values.location);
      if (values.status && values.status !== ticket.status)
        formData.append("status", values.status);
      if (values.assignedId && values.assignedId !== ticket.assignedTo?._id)
        formData.append("assignedId", values.assignedId);
      if (values.photo) {
        formData.append("photo", values.photo);
      }
      const res = await editTicket({
        ticketId: ticket._id,
        formData: formData,
      }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
        seteditphoto(false);
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
          seteditphoto(false);
        }}
        title="Ticket Details"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isLoading}
            variant="spinner" // spinner | dots | pulse | progress
            message="Saving changes..."
            subMessage="Please wait"
          />
        }
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
              onClick={() => {
                setShowModal(false);
                seteditphoto(false);
              }}
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
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
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
                      disabled={!isRequester}
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
                      disabled
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
                    <Form.Select
                      size="sm"
                      name="assignedId"
                      value={values.assignedId}
                      onChange={handleChange}
                      isInvalid={touched.assignedId && !!errors.assignedId}
                    >
                      <option value="">Select Assignee</option>
                      {isEmployeeLoading ? (
                        <option disabled>Loading...</option>
                      ) : (
                        employeeData?.data.employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstname} {emp.lastname} ({emp.email})
                          </option>
                        ))
                      )}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.assignedId}
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
                    <Form.Select
                      size="sm"
                      name="status"
                      value={values.status}
                      disabled={!isAssigned}
                      onChange={handleChange}
                      isInvalid={touched.status && !!errors.status}
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
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
                      disabled
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
                    <QuillEditor
                      content={values.description}
                      onChange={(val) => setFieldValue("description", val)}
                      disabled={!isRequester}
                      isInvalid={touched.description && !!errors.description}
                      errorMessage={errors.description as string}
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
                    <Form.Select
                      name="priority"
                      size="sm"
                      value={values.priority}
                      disabled={!isRequester}
                      onChange={handleChange}
                      className="text-street-base"
                      isInvalid={touched.priority && !!errors.priority}
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Form.Select>
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
                    <Form.Select
                      name="category"
                      size="sm"
                      value={values.category}
                      onChange={handleChange}
                      disabled={!isRequester}
                      className="text-street-base"
                      isInvalid={touched.category && !!errors.category}
                    >
                      <option value="">Select category</option>
                      {["IT Help Desk", "Property Maintenance"].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
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
                      disabled={!isRequester}
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
                    <p className="form-label">Attachment</p>
                  </Col>
                  {!(editphoto || !ticket.photo) && (
                    <Col sm={10}>
                      <Icon icon="lucide:paperclip" className="me-1" />
                      <Link
                        className="text-street-primary mt-1 mt-sm-0 text-xs fw-normal"
                        to="#"
                      >
                        {ticket.photo?.fileName}
                      </Link>
                      {!!isRequester && (
                        <Icon
                          icon="mdi:file-edit"
                          className="ms-2 icon-street-edit"
                          onClick={() => seteditphoto(true)}
                        />
                      )}
                    </Col>
                  )}
                  {(editphoto || !ticket.photo) && (
                    <Col sm={10}>
                      <ImageUpload name="photo" />
                    </Col>
                  )}
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
