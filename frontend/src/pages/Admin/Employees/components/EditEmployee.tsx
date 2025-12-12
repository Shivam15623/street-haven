import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { Form as BootstrapForm, Row, Col } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useEditEmployeeMutation } from "../../../../services/EmployeeApi";
import { showSuccess } from "../../../../utills/toastutills";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormImageUploader from "./FormProfileUploader";
import { PatternFormat } from "react-number-format";
import { ROLES } from "../../../../interfaces/AuthInterfaces";
import CustomDatePicker from "../../../../components/child/DatePicker";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

// Yup validation schema
const editEmployeeSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  role: yup.string().required("Role is required"),
  email: yup
    .string()
    // .matches(
    //   /^[A-Za-z0-9._%+-]+@streethaven\.com$/,
    //   "Email must be from @streethaven.com domain"
    // )
    .required("Email is required"),
  title: yup
    .string()
    .matches(/^[a-zA-Z\s]+$/, "Title can only contain letters and spaces")
    .required("Title is required"),
  phoneNo: yup
    .string()
    .matches(
      /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/,
      "Enter a valid Canadian phone number"
    )
    .required("Phone number is required"),
  profilePic: yup.mixed<File>().nullable(),
  hireDate: yup.date().required("Hire Date is required"),
  timePeriod: yup.object({
    value: yup.number().required("Time Period value is required"),
    unit: yup.string().required("Time Period unit is required"),
  }),
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

  const handleSave = async (values: EditEmployeeValues) => {
    try {
      // Ensure timePeriod exists
      const safeTimePeriod = {
        value: values.timePeriod?.value ?? 0,
        unit: values.timePeriod?.unit ?? "days",
      };

      const formData = new FormData();
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("email", values.email);
      formData.append("phoneNo", values.phoneNo);
      formData.append("role", values.role);
      formData.append("title", values.title);

      formData.append("timePeriod", JSON.stringify(safeTimePeriod));
      function toISODate(value: Date | string | null | undefined) {
        if (!value) return "";
        return value instanceof Date
          ? value.toISOString()
          : new Date(value).toISOString();
      }

      // Usage
      formData.append("hireDate", toISODate(values.hireDate));

      if (values.profilePic) formData.append("profilePic", values.profilePic);

      const res = await editEmployee({ id, data: formData }).unwrap();
      if (res.success) showSuccess(res.message);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save employee:", err);
    }
  };

  const formatRole = (role: string) =>
    role === "hr"
      ? "HR"
      : role
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
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              form="edit-employee-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
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
              <Row>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Title</BootstrapForm.Label>
                    <Field
                      name="title"
                      type="text"
                      className={`form-control ${
                        touched.title && errors.title ? "is-invalid" : ""
                      }`}
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
                    <BootstrapForm.Label>Hire Date</BootstrapForm.Label>
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

              {/* Time Period */}
              <Row>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Time Period</BootstrapForm.Label>
                    <Field
                      name="timePeriod.value"
                      type="number"
                      className={`form-control ${
                        touched.timePeriod?.value && errors.timePeriod?.value
                          ? "is-invalid"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      className="invalid-feedback"
                      name="timePeriod.value"
                    />
                  </BootstrapForm.Group>
                </Col>
                <Col md={6}>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Unit</BootstrapForm.Label>
                    <Field
                      as="select"
                      name="timePeriod.unit"
                      
                      className={`form-control ${
                        touched.timePeriod?.unit && errors.timePeriod?.unit
                          ? "is-invalid"
                          : ""
                      }`}
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </Field>
                    <ErrorMessage
                      component="div"
                      className="invalid-feedback"
                      name="timePeriod.unit"
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
