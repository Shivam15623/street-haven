import { useState } from "react";
import { useAddEmployeeMutation } from "../../../../services/EmployeeApi";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import * as Yup from "yup";
import { Formik } from "formik";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { Col, Form, Row } from "react-bootstrap";
import PasswordInput from "../../../../components/Authentication/PasswordInput";
import { Icon } from "@iconify/react/dist/iconify.js";
import { PatternFormat } from "react-number-format";
import { ROLES, type Role } from "../../../../interfaces/AuthInterfaces";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
interface AddEmployeeValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}
const roleValues = Object.values(ROLES) as Array<string>;
function formatRole(role: string): string {
  if (role === "hr") return "HR";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
const AddEmployeeSchema = Yup.object({
  firstName: Yup.string()
    .required("First Name is required")
    .min(3, "First Name must be at least 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "First Name can only contain letters and spaces"),
  lastName: Yup.string()
    .required("Last Name is required")
    .min(3, "Last Name must be at least 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last Name can only contain letters and spaces"),
  email: Yup.string()
    .matches(
      /^[A-Za-z0-9._%+-]+@streethaven\.com$/,
      "Email must be from @streethaven.com domain"
    )
    .email("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
      "Enter a valid 10-digit Canadian phone number"
    ),
  role: Yup.string()
    .oneOf(roleValues, "Invalid role selected")
    .required("Role is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[@$!%*?&#]/, "Must contain at least one special character"),
});
const AddEmployee = () => {
  const [showModal, setShowModal] = useState(false);
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();

  const handleAddEmployee = async (values: AddEmployeeValues) => {
    try {
      const res = await addEmployee(values).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    } catch (error: any) {
      showError(error.data.message);
    }
  };
  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="mdi:plus" className="text-sm sm:text-xl" /> Add Employee
      </button>
      <ModalWrapper
        show={showModal}
        title="Add New Employee"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        isLoading={isLoading}
        ModalLoader={
          <FormSubmissionLoader isLoading={isLoading} variant="spinner" />
        }
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              form="add-employee-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            role: "employee",
          }}
          validationSchema={AddEmployeeSchema}
          onSubmit={handleAddEmployee}
          disabled={isLoading}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            <Form
              noValidate
              id="add-employee-form"
              onSubmit={handleSubmit}
              className="d-flex flex-column gap-16"
            >
              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                <Col md={6}>
                  <Form.Group
                    controlId=" firstName"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className=" m-0 fw-normal">
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={values.firstName}
                      onChange={handleChange}
                      className="form-control  "
                      isInvalid={touched.firstName && !!errors.firstName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group
                    controlId="lastName"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="m-0 fw-normal">Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      className="form-control  "
                      placeholder="Last Name"
                      value={values.lastName}
                      onChange={handleChange}
                      isInvalid={touched.lastName && !!errors.lastName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Email */}
              <Row>
                <Col>
                  <Form.Group
                    controlId="email"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-normal m-0">Email</Form.Label>
                    <Form.Control
                      type="email"
                      className="form-control  "
                      name="email"
                      placeholder="Your email"
                      value={values.email}
                      onChange={handleChange}
                      isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              {/* Role Select */}
              <Row>
                <Col>
                  <Form.Group
                    controlId="role"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-normal m-0">
                      Select Role
                    </Form.Label>

                    <Form.Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      className={
                        touched.role && errors.role ? "is-invalid" : ""
                      }
                    >
                      <option value="">-- Select Role --</option>
                      {Object.values(ROLES).map((role) => (
                        <option key={role} value={role}>
                          {formatRole(role)}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {errors.role}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Phone */}
              <Row>
                <Col>
                  <Form.Group
                    controlId="phone"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-normal m-0">Phone</Form.Label>
                    <PatternFormat
                      format="+1 (###) ###-####"
                      mask="_"
                      name="phone"
                      className={`form-control ${
                        touched.phone && errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="+1 (123) 456-7890"
                      value={values.phone}
                      onValueChange={(valuesObj) => {
                        handleChange({
                          target: {
                            name: "phone",
                            value: valuesObj.formattedValue,
                          },
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Password */}
              <Row>
                <Col>
                  <Form.Group
                    controlId="password"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-normal m-0">Password</Form.Label>
                    <PasswordInput
                      name="password"
                      value={values.password}
                      className=""
                      onChange={handleChange}
                      isInvalid={touched.password && !!errors.password}
                      error={errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
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

export default AddEmployee;
