import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { Form as BootstrapForm, Row, Col } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import {
  useAllEmployeesQuery,
  useEditEmployeeMutation,
} from "../../../../services/EmployeeApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormImageUploader from "./FormProfileUploader";
import { PatternFormat } from "react-number-format";
import { ROLES } from "../../../../interfaces/AuthInterfaces";
import CustomDatePicker from "../../../../components/child/DatePicker";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import { PERMISSIONS } from "../../../../utills/auth/permissions";
import { getErrorMessage } from "../../../../utills/utills";
import { useFetchLocationsQuery } from "../../../../services/locationApi";

// Yup validation schema
const editEmployeeSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  role: yup.string().required("Role is required"),
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9._%+-]/, "Email must be from @streethaven.com domain")
    .required("Email is required"),
  title: yup.string().required("Title is required"),
  phoneNo: yup
    .string()
    .matches(
      /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/,
      "Enter a valid Canadian phone number",
    )
    .required("Phone number is required"),
  profilePic: yup.mixed<File>().nullable(),
  hireDate: yup.date().required("Hire Date is required"),
  timePeriod: yup.string(),
  superviserId: yup.string().nullable(),
  customPermissions: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(Object.values(PERMISSIONS), "Invalid permission selected"),
    )
    .default([])
    .nullable(),
  locations: yup
    .array()
    .of(yup.string().required())
    .when("role", {
      is: ROLES.MANAGER,
      then: (schema) => schema.min(1, "Select at least one location"),
      otherwise: (schema) => schema.notRequired(),
    })
    .default([]),
  endAt: yup.date().nullable().optional(),
});

type EditEmployeeValues = yup.InferType<typeof editEmployeeSchema>;

interface EditEmployeeProps {
  initialValues: EditEmployeeValues;
  id: string;
  profilePic: string | null;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
  initialValues,
  id,
  profilePic,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, { isLoading }] = useEditEmployeeMutation();
  const { data: locationsData, isLoading: locationsLoading } =
    useFetchLocationsQuery({}, { skip: !showModal });
  const { data: employeeData, isLoading: isEmployeeLoading } =
    useAllEmployeesQuery(
      { forDropdown: true },
      { skip: !showModal, refetchOnMountOrArgChange: false },
    );
  console.log("data", employeeData, initialValues);
  const handleSave = async (values: EditEmployeeValues) => {
    try {
      const formData = new FormData();
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("email", values.email);
      formData.append("phoneNo", values.phoneNo);
      formData.append("role", values.role);
      formData.append("title", values.title);

      if (values.superviserId)
        formData.append("superviserId", values.superviserId);

      function toISODate(value: Date | string | null | undefined) {
        if (!value) return "";
        return value instanceof Date
          ? value.toISOString()
          : new Date(value).toISOString();
      }

      if (values.customPermissions?.length) {
        values.customPermissions.forEach((p) =>
          formData.append("customPermissions[]", p!),
        );
      }

      // send locations only when role is manager — avoids the backend's
      // "only managers can be assigned to locations" guard rejecting the request
      if (values.role === ROLES.MANAGER && values.locations?.length) {
        values.locations.forEach((locId) =>
          formData.append("locations[]", locId),
        );
      }

      formData.append("hireDate", toISODate(values.hireDate));
      if (values.profilePic) formData.append("profilePic", values.profilePic);
      // Only send endAt if it's actually set — never force null/undefined through
      if (values.endAt) {
        formData.append("endAt", toISODate(values.endAt));
      }

      const res = await editEmployee({ id, data: formData }).unwrap();
      if (res.success) showSuccess(res.message);
      setShowModal(false);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const formatRole = (role: string) =>
    role
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <>
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>

      <ModalWrapper
        show={showModal}
        title="Edit Employee Profile"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
        onHide={() => setShowModal(false)}
        isLoading={isLoading}
        ModalLoader={
          <FormSubmissionLoader isLoading={isLoading} variant="spinner" />
        }
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              type="submit"
              form="edit-employee-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        {" "}
        <Formik
          initialValues={initialValues}
          validationSchema={editEmployeeSchema}
          onSubmit={handleSave}
        >
          {({
            setFieldValue,
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
          }) => (
            <Form id="edit-employee-form" className="d-flex flex-column gap-18">
              {/* Profile Picture */}
              <div className="d-flex justify-content-center mb-3">
                <FormImageUploader
                  setFieldValue={setFieldValue}
                  value={values.profilePic}
                  imageUrl={profilePic}
                />
              </div>

              {/* First & Last Name */}
              <Row>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>First Name</BootstrapForm.Label>
                    <Field
                      name="firstname"
                      type="text"
                      className={`form-control ${
                        touched.firstname && errors.firstname
                          ? "is-invalid"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      className="invalid-feedback"
                      name="firstname"
                    />
                  </BootstrapForm.Group>
                </Col>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Last Name</BootstrapForm.Label>
                    <Field
                      name="lastname"
                      type="text"
                      className={`form-control ${
                        touched.lastname && errors.lastname ? "is-invalid" : ""
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      className="invalid-feedback"
                      name="lastname"
                    />
                  </BootstrapForm.Group>
                </Col>
              </Row>

              {/* Email */}
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Email</BootstrapForm.Label>
                <Field
                  name="email"
                  type="email"
                  className={`form-control ${
                    touched.email && errors.email ? "is-invalid" : ""
                  }`}
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="email"
                />
              </BootstrapForm.Group>

              {/* Role */}
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Role</BootstrapForm.Label>
                <Field
                  as="select"
                  name="role"
                  className={`form-control ${
                    touched.role && errors.role ? "is-invalid" : ""
                  }`}
                >
                  <option value="">Select Role</option>
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {formatRole(role)}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="role"
                />
              </BootstrapForm.Group>
              {/* Ticket Permissions */}
              {values.role === ROLES.MANAGER && (
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Assigned Locations</BootstrapForm.Label>

                  {locationsLoading ? (
                    <div className="text-sm">Loading locations...</div>
                  ) : (
                    <div
                      className="d-flex flex-column gap-2 border rounded p-2"
                      style={{ maxHeight: 180, overflowY: "auto" }}
                    >
                      {locationsData?.data.map((loc) => (
                        <BootstrapForm.Check
                          key={loc._id}
                          type="checkbox"
                          id={`edit-location-${loc._id}`}
                          label={loc.name}
                          checked={(values.locations ?? []).includes(loc._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue(
                              "locations",
                              checked
                                ? [...(values.locations ?? []), loc._id]
                                : (values.locations ?? []).filter(
                                    (id: string) => id !== loc._id,
                                  ),
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {touched.locations && errors.locations && (
                    <div className="invalid-feedback d-block">
                      {String(errors.locations)}
                    </div>
                  )}
                </BootstrapForm.Group>
              )}

              {/* Phone */}
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Phone Number</BootstrapForm.Label>
                <PatternFormat
                  format="+1 (###) ###-####"
                  allowEmptyFormatting
                  mask="_"
                  className={`form-control ${
                    touched.phoneNo && errors.phoneNo ? "is-invalid" : ""
                  }`}
                  value={values.phoneNo}
                  onValueChange={(v) =>
                    setFieldValue("phoneNo", v.formattedValue)
                  }
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="phoneNo"
                />
              </BootstrapForm.Group>

              {/* Title & Hire Date */}
              {/* Title & Hire/Start Date */}
              <Row>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Title</BootstrapForm.Label>
                    <Field
                      name="title"
                      type="text"
                      className={`form-control ${touched.title && errors.title ? "is-invalid" : ""}`}
                    />
                    <ErrorMessage
                      component="div"
                      className="invalid-feedback"
                      name="title"
                    />
                  </BootstrapForm.Group>
                </Col>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      {values.role === ROLES.VOLUNTEER
                        ? "Volunteer Start Date"
                        : "Hire Date"}
                    </BootstrapForm.Label>
                    <CustomDatePicker
                      value={values.hireDate ? new Date(values.hireDate) : null}
                      onChange={(date) => setFieldValue("hireDate", date)}
                      onBlur={handleBlur}
                    />
                    {touched.hireDate && errors.hireDate && (
                      <div className="invalid-feedback d-block">
                        {errors.hireDate as string}
                      </div>
                    )}
                  </BootstrapForm.Group>
                </Col>
              </Row>

              {/* Volunteer-only: End Date (optional, only sent if set) */}
              {values.role === ROLES.VOLUNTEER && (
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>End Date (optional)</BootstrapForm.Label>
                  <CustomDatePicker
                    value={values.endAt ? new Date(values.endAt) : null}
                    onChange={(date) => setFieldValue("endAt", date)}
                    onBlur={handleBlur}
                  />
                  <div className="form-text">
                    Leave blank if the volunteer is still active.
                  </div>
                </BootstrapForm.Group>
              )}
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label
                  className="align-items-center d-flex"
                  column
                  sm={2}
                >
                  Manager
                </BootstrapForm.Label>

                <BootstrapForm.Select
                  size="sm"
                  name="superviserId"
                  value={values.superviserId ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.superviserId && !!errors.superviserId}
                >
                  <option value="">Select Supervisor</option>

                  {isEmployeeLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    employeeData?.data.employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstname} {emp.lastname} ({emp.email})
                      </option>
                    ))
                  )}
                </BootstrapForm.Select>

                <BootstrapForm.Control.Feedback type="invalid">
                  {errors.superviserId}
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>

              {/* Time Period */}
              <Row>
                <Col md={12}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Time Period</BootstrapForm.Label>
                    <Field
                      name="timePeriod"
                      type="text"
                      className={`form-control`}
                      disabled
                    />
                  </BootstrapForm.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EditEmployee;
