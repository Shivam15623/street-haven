import React, { lazy, useState } from "react";
import { Col, Row, Form, Spinner } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEditTicketMutation } from "../../../../services/ticketApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import type { TicketData } from "../../../../interfaces/Ticket";
import { useAllEmployeesQuery } from "../../../../services/EmployeeApi";
import ImageUpload from "../../../../components/child/Imageupload";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

import { getErrorMessage } from "../../../../utills/utills";
import { useFetchLocationsQuery } from "../../../../services/locationApi";
import {
  useCreateTicketCategoryMutation,
  useGetTicketCategoriesQuery,
} from "../../../../services/ticketCategoryApi";
import useHasPermission from "../../../../hooks/Auth";
const QuillEditor = lazy(
  () => import("../../../../components/child/QuillEditor"),
);
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
  const { hasPermission } = useHasPermission();
  const { data: locationsData, isLoading: locationsLoading } =
    useFetchLocationsQuery({}, { skip: !showModal });
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetTicketCategoriesQuery({ isActive: "true" });
  const [createTicketCategory, { isLoading: isCreatingCategory }] =
    useCreateTicketCategoryMutation();

  const [customCategoryValue, setCustomCategoryValue] = useState("");
  const isAssigned = ticket.assignedTo?._id === user?._id;
  const isRequester = ticket.createdBy._id === user?._id;
  const isApprovingManager = ticket.approvedBy?._id === user?._id;
  const [editphoto, seteditphoto] = useState(false);

  const { data: employeeData, isLoading: isEmployeeLoading } =
    useAllEmployeesQuery({ forDropdown: true }, { skip: !showModal });
  const [editTicket, { isLoading }] = useEditTicketMutation();
  const hasCreatorPermissions = isRequester && ticket.status === "Open";
  // derive once, near hasCreatorPermissions
  const canTouchApproverFields = [
    "Approved",
    "In Progress",
    "Completed",
  ].includes(ticket.status);
  // pre-select custom-category UI if the ticket's category isn't one of the predefined ones
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const initialValues: TicketValues = {
    requestTitle: ticket.req_title,
    requester: ticket.createdBy.firstname + " " + ticket.createdBy.lastname,
    // "" (not "Unassigned") so it matches the placeholder <option value="">
    assignedId: ticket.assignedTo ? ticket.assignedTo._id : "",
    status: ticket.status,
    // show the human-facing slug, never the raw Mongo _id
    id: ticket.displayId ?? ticket.slug,
    description: ticket.description,
    priority: ticket.priority ?? "",
    category: ticket.category._id,
    location: ticket.location?._id ?? "", // default to empty string
  };

  const statusOptions = [
    "Open",
    "In Progress",
    "Completed",
    "Approved", // was "Approoved"
    "Rejected",
    "Closed",
  ];

  const handleEdit = async (values: TicketValues) => {
    try {
      const formData = new FormData();
      if (values.requestTitle && values.requestTitle !== ticket.req_title)
        formData.append("requestTitle", values.requestTitle);
      if (values.description && values.description !== ticket.description)
        formData.append("description", values.description);
      if (values.priority && values.priority !== ticket.priority)
        formData.append("priority", values.priority);
      if (values.category && values.category !== ticket.category._id)
        formData.append("category", values.category);
      // compare against the populated location's _id, not the object itself
      if (values.location && values.location !== ticket.location?._id)
        formData.append("location", values.location);

      // BEFORE: formData.append("assignedId", values.assignedId)
      // Backend reads req.body.assignedTo — this key must match or the
      // reassignment silently gets dropped.
      if (values.assignedId && values.assignedId !== ticket.assignedTo?._id)
        formData.append("assignedTo", values.assignedId);

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
      showError(getErrorMessage(error));
    }
  };
  const handleAddCustomCategory = async (
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const trimmed = customCategoryValue.trim();
    if (!trimmed) {
      showError("Please enter a category name");
      return;
    }
    try {
      const res = await createTicketCategory({ name: trimmed }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setFieldValue("category", res.data._id);
        setIsCustomCategory(false);
        setCustomCategoryValue("");
      }
    } catch (error) {
      showError(getErrorMessage(error));
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
        isLoading={isLoading}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 px-12 px-sm-16 px-md-28 text-xxs xs:text-xs sm:text-sm"
              type="submit"
              form="ticket-form"
            >
              Save
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg d-none d-sm-flex flex-row align-items-center justify-content-center radius-12 px-12 px-sm-16 px-md-28 text-xxs xs:text-xs sm:text-sm"
              onClick={() => {
                setShowModal(false);
                seteditphoto(false);
              }}
            >
              Cancel
            </button>
          </div>
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
                      disabled={!hasCreatorPermissions}
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
                      disabled={
                        (!isAssigned && !isApprovingManager) ||
                        !canTouchApproverFields
                      }
                      isInvalid={touched.assignedId && !!errors.assignedId}
                    >
                      <option value="">Unassigned</option>
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
                      disabled
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

                {/* Ticket ID (human-facing slug, never the raw Mongo _id) */}
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
                      disabled={!hasCreatorPermissions}
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
                      disabled={!isApprovingManager || !canTouchApproverFields}
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

                {/* Category (single field — predefined list + custom-entry toggle) */}
                <Row className="mb-3">
                  <Form.Label
                    className="align-items-center d-flex"
                    column
                    sm={2}
                  >
                    Category
                  </Form.Label>
                  <Col>
                    {!isCustomCategory ? (
                      <div className="d-flex align-items-center gap-8">
                        <Form.Select
                          name="category"
                          size="sm"
                          value={values.category}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setIsCustomCategory(true);
                              setFieldValue("category", "");
                            } else {
                              handleChange(e);
                            }
                          }}
                          disabled={
                            categoryLoading ||
                            categoryError ||
                            !hasCreatorPermissions
                          }
                          className="text-street-base"
                          isInvalid={touched.category && !!errors.category}
                        >
                          <option value="">
                            {categoryLoading
                              ? "Loading categories..."
                              : categoryError
                                ? "Failed to load categories"
                                : "Select category"}
                          </option>
                          {categoryData?.data.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                          {hasPermission({
                            action: "ticket_category_manage",
                          }) && (
                            <option value="__custom__">
                              + Add custom category
                            </option>
                          )}
                        </Form.Select>
                        {categoryLoading && (
                          <Spinner animation="border" size="sm" role="status" />
                        )}
                      </div>
                    ) : hasPermission({
                        action: "ticket_category_manage",
                      }) ? (
                      <div className="d-flex gap-8">
                        <Form.Control
                          type="text"
                          size="sm"
                          autoFocus
                          placeholder="Enter custom category"
                          value={customCategoryValue}
                          onChange={(e) =>
                            setCustomCategoryValue(e.target.value)
                          }
                          className="py-12 px-16 text-street-base"
                          disabled={
                            isCreatingCategory || !hasCreatorPermissions
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-street-primary btn-sm"
                          disabled={isCreatingCategory}
                          onClick={() => handleAddCustomCategory(setFieldValue)}
                        >
                          {isCreatingCategory ? "Adding..." : "Add"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-street-neutral btn-sm"
                          disabled={isCreatingCategory}
                          onClick={() => {
                            setIsCustomCategory(false);
                            setCustomCategoryValue("");
                            setFieldValue("category", "");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}

                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                    {categoryError && (
                      <small className="text-danger">
                        Could not load categories. Please refresh the page.
                      </small>
                    )}
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
                    <Form.Select
                      size="sm"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      disabled={!hasCreatorPermissions || locationsLoading}
                      isInvalid={touched.location && !!errors.location}
                    >
                      <option value="">
                        {locationsLoading
                          ? "Loading locations..."
                          : "Select location"}
                      </option>

                      {locationsData?.data?.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                {/* Attachment */}
                <Row className="mb-3">
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
                      {hasCreatorPermissions && (
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
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </div>
  );
};

export default TicketEdit;
