import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Row, Col, Form as BootstrapForm, Button } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useResetPasswordMutation } from "../../../services/AuthApi";
import AuthFormWrapper from "../../../components/Authentication/AuthFormWrapper";
import AuthWrapper from "../../../components/Authentication/AuthWrapper";
import { showError, showSuccess } from "../../../utills/toastutills";
import PasswordInput from "../../../components/Authentication/PasswordInput";

// ✅ Validation Schema
const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[@$!%*?&#]/, "Must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm Password is required"),
});
type ResetPasswordValues = Yup.InferType<typeof resetPasswordSchema>;
const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token: string | null = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (values: ResetPasswordValues) => {
    try {
      if (token) {
        const response = await resetPassword({
          token,
          newpassword: values.newPassword,
        }).unwrap();

        if (response?.success) {
          showSuccess(response.message);
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        showError("invaid session");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthWrapper
      sideimage="assets/images/auth/8e1ff61526c7396410d2ae15f20361181167f0c1.jpg"
      mtext="Welcome to the Street Haven Community"
      subText="Create an Account or Log In to Access Support, Resources & Community Events"
    >
      <AuthFormWrapper
        title="Reset your password"
        subText="Enter your new password below."
      >
        <div className="w-100 d-flex flex-column gap-16 gap-sm-20 gap-md-24">
          <div className="text-center text-sm sm:text-md md:text-lg fw-semibold ">
            Set New Password
          </div>

          <Formik
            initialValues={{
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={resetPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              status,
            }) => (
              <Form noValidate onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form-input-group">
                  {/* New Password */}
                  <Row>
                    <Col>
                      <BootstrapForm.Group
                        controlId="newPassword"
                        className="d-flex flex-column gap-1"
                      >
                        <BootstrapForm.Label className="auth-label">
                          New Password
                        </BootstrapForm.Label>
                        <PasswordInput
                          name="newPassword"
                          value={values.newPassword}
                          className="h-50-px"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          style={{
                            backgroundColor: "#F2F0EC",
                            borderColor: "#E2E8F0",
                            borderRadius: "15px",
                            paddingRight: "2.5rem",
                          }}
                          isInvalid={
                            touched.newPassword && !!errors.newPassword
                          }
                          error={errors.newPassword}
                        />
                      </BootstrapForm.Group>
                    </Col>
                  </Row>

                  {/* Confirm Password */}
                  <Row>
                    <Col>
                      <BootstrapForm.Group
                        controlId="confirmPassword"
                        className="d-flex flex-column gap-1"
                      >
                        <BootstrapForm.Label className="auth-label">
                          Confirm Password
                        </BootstrapForm.Label>
                        <PasswordInput
                          name="confirmPassword"
                          placeholder="Re-enter password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-input"
                          style={{
                            backgroundColor: "#F2F0EC",
                            borderColor: "#E2E8F0",
                            borderRadius: "15px",
                            paddingRight: "2.5rem",
                          }}
                          isInvalid={
                            touched.confirmPassword && !!errors.confirmPassword
                          }
                          error={errors.newPassword}
                        />
                        <BootstrapForm.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </BootstrapForm.Control.Feedback>
                      </BootstrapForm.Group>
                    </Col>
                  </Row>
                </div>

                {/* Status message */}
                {status && <p className="auth-status">{status}</p>}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-street-primary auth-btn"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="text-center">
            <Link to="/login" className="auth-back-link">
              <Icon icon="mdi:arrow-left" />
              Back to Login
            </Link>
          </p>
        </div>
      </AuthFormWrapper>
    </AuthWrapper>
  );
};

export default ResetPassword;
