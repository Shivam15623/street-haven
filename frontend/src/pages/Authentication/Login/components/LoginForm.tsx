import React from "react";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setLoggedIn } from "../../../../redux/AuthSlice";
import { useLoginMutation } from "../../../../services/AuthApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import PasswordInput from "../../../../components/Authentication/PasswordInput";
interface LoginValues {
  email: string;
  password: string;
}
const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  password: Yup.string().required("Password is required"),
});

const LoginForm: React.FC = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const handleLogin = async (values: LoginValues) => {
    try {
      const response = await login(values).unwrap();
      if (response.success) {
        const { accessToken, user } = response.data;
        const payload = {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNo: user.phoneNo,
          profilePic: user.profilePic,
          role: user.role,
          slug: user.slug,
          createdAt:user.createdAt
        };

        dispatch(
          setLoggedIn({
            accessToken: accessToken,
            UserData: payload,
          })
        );
        showSuccess(response.message);
      }
    } catch (error: any) {
      showError(error.data.message);
    }
  };
  return (
    <div className="w-100 d-flex flex-column gap-24">
      <div className="text-center text-lg fw-semibold ">Login Now</div>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          touched,
          errors,
        }) => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-40"
          >
            {/* First + Last Name in same Row */}
            <div className="d-flex flex-column gap-16">
              {/* Email */}
              <Row>
                <Col>
                  <Form.Group
                    controlId="email"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-medium mb-2">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Your email"
                      value={values.email}
                      disabled={isLoading}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className=" h-50-px "
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

              {/* Password */}
              <Row className=" gap-1">
                <Col>
                  <Form.Group
                    controlId="password"
                    className="d-flex flex-column gap-1"
                  >
                    <Form.Label className="fw-medium mb-2">Password</Form.Label>
                    <PasswordInput
                      name="password"
                      value={values.password}
                      className="h-50-px"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        backgroundColor: "#F2F0EC",
                        borderColor: "#E2E8F0",
                        borderRadius: "15px",
                        paddingRight: "2.5rem",
                      }}
                      isInvalid={touched.password && !!errors.password}
                      error={errors.password}
                    />
                  </Form.Group>
                </Col>
                <div className="d-flex justify-content-start ">
                  <Link
                    to={"/forgot-password"}
                    className=" text-sm fw-normal link-street-primary"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </Row>
            </div>

            {/* Forgot Password Link */}

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn btn-street-primary text-xs btn-sm px-12 py-11 w-100 text-white fw-medium radius-12 "
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
        )}
      </Formik>
      <p className="text-center  text-sm  text-street-base mb-0 ">
        Don’t have an account?{" "}
        <Link to="/Signup" className="text-sm fw-semibold link-street-base">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
