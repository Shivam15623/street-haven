import { Link } from "react-router-dom";
import * as formik from "formik";
import * as Yup from "yup";
import Form from "react-bootstrap/Form";
import { Button, Col, Row } from "react-bootstrap";
import { useRegisterEmployeeMutation } from "../../../../services/AuthApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import PasswordInput from "../../../../components/Authentication/PasswordInput";
import { PatternFormat } from "react-number-format";
import type { Role } from "../../../../interfaces/AuthInterfaces";
interface SignupValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}
const signupSchema = Yup.object({
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
  role: Yup.string()
    .required("Role is required")
    .oneOf(["manager", "employee", "hr"], "Invalid role"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
      "Enter a valid 10-digit Canadian phone number"
    ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[@$!%*?&#]/, "Must contain at least one special character"),
});
const SignupForm = () => {
  const { Formik } = formik;
  const [signup, { isLoading }] = useRegisterEmployeeMutation();
  const handleSignup = async (values: SignupValues) => {
    try {
      const res = await signup(values).unwrap();
      if (res.success) {
        showSuccess(res.message);
      }
    } catch (error: any) {
      showError(error.data.message);
    }
  };

  return (
    <div className="w-100 d-flex flex-column gap-24">
      <div className="text-center text-lg fw-semibold "> Register Now</div>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          role: "employee",
        }}
        validationSchema={signupSchema}
        onSubmit={handleSignup}
        disabled={isLoading}
      >
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-40"
          >
            {/* First + Last Name in same Row */}
            <div className="d-flex flex-column gap-16">
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
                      className="form-control h-50-px "
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                      }}
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
                      className="form-control h-50-px "
                      placeholder="Last Name"
                      value={values.lastName}
                      onChange={handleChange}
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                      }}
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
                      className="form-control h-50-px "
                      name="email"
                      placeholder="Your email"
                      value={values.email}
                      onChange={handleChange}
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                      }}
                      isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
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
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                      }}
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
              <Row>
                <Col>
                  <Form.Group
                    controlId="role"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-normal m-0">Role</Form.Label>
                    <Form.Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      className={`form-control d-flex align-items-center h-50-px ${
                        touched.role && errors.role ? "is-invalid" : ""
                      }`}
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                      }}
                    >
                      <option value="">Select Role</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {errors.role}
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
                      className="h-50-px"
                      onChange={handleChange}
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                        paddingRight: "2.5rem",
                      }}
                      isInvalid={touched.password && !!errors.password}
                      error={errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Submit */}
            <Row>
              <Col>
                <Button
                  type="submit"
                  className="btn btn-street-primary text-xs btn-sm px-12 py-11 w-100 text-white bg-street-primary fw-medium radius-12"
                  disabled={isLoading} // disable while loading
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}{" "}
                  {/* Show loading text */}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
      <p className="text-center  text-sm  text-street-base mb-0 ">
        Already have an account?{" "}
        <Link to={"/login"} className="text-sm fw-semibold link-street-base">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
