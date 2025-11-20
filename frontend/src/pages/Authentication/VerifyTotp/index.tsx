import React from "react";
import { useLocation } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import { useVerifyTotpMutation } from "../../../services/AuthApi";
import { showError, showSuccess } from "../../../utills/toastutills";
import { setLoggedIn } from "../../../redux/AuthSlice";
import { useDispatch } from "react-redux";

const totpSchema = Yup.object({
  totp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

const VerifyTotp: React.FC = () => {
  const location = useLocation();

  const [verifyTotp, { isLoading }] = useVerifyTotpMutation();
  const dispatch = useDispatch();
  const { tempToken } = location.state || {};

  const handleVerify = async (values: { totp: string }) => {
    try {
      const response = await verifyTotp({
        tempToken,
        totpCode: Number(values.totp),
      }).unwrap();

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
          createdAt: user.createdAt,
        };

        dispatch(
          setLoggedIn({
            accessToken: accessToken,
            UserData: payload,
          })
        );
        showSuccess("Logged in successfully");
      }
    } catch (error: any) {
      showError(error.data?.message || "Invalid TOTP");
    }
  };

  return (
    <div
      className="w-100  d-flex flex-column align-items-center justify-content-center p-32"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="rounded-4 p-4 d-flex flex-column p-24 gap-20 md:gap-24 "
        style={{
          boxShadow: "0 10px 40px rgba(10, 26, 47, 0.08)",
          backgroundColor: "var(--street-card)",
          maxWidth: "500px",
          width: "100%",
          height: "fit-content",
        }}
      >
        {/* Logo Section */}
        <div className="d-flex flex-column align-items-center justify-content-center ">
          <div className="d-flex flex-row align-items-center justify-content-center ">
            <img
              className="verify-form-wrap-img"
              src="assets/images/auth/e5fcae70d4835039e473c6b00f4a901799a86cf3.png"
            />
          </div>
        </div>

        {/* Card Header */}
        <div className="text-center mb-3 ">
          <h2 className="text-2xxl text-street-base fw-bold mb-2">
            Verify Your Identity
          </h2>
          <p className="text-md text-secondary mt-1">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <Formik
          initialValues={{ totp: "" }}
          validationSchema={totpSchema}
          onSubmit={handleVerify}
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
              <Form.Group controlId="totp" className="d-flex flex-column gap-2">
                <Form.Label className="fw-medium mb-1">OTP Code</Form.Label>
                <Form.Control
                  type="text"
                  name="totp"
                  maxLength={6}
                  placeholder="123456"
                  value={values.totp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-50-px text-center fs-4 tracking-widest"
                  style={{
                    backgroundColor: "#F2F0EC",
                    border: "2px solid #E8F0FE",
                    padding: "14px 16px",
                    borderRadius: "15px",
                    letterSpacing: "8px",
                    fontSize: "20px",
                  }}
                  isInvalid={touched.totp && !!errors.totp}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.totp}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="btn btn-street-primary w-100 py-11 text-white fw-medium radius-12"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default VerifyTotp;
