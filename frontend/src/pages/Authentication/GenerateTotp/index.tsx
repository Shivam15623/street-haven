import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  useGenerateTotpMutation,
  useVerifyTotpMutation,
} from "../../../services/AuthApi";
import { showError, showSuccess } from "../../../utills/toastutills";
import { getErrorMessage } from "../../../utills/utills";


const totpSetupSchema = Yup.object({
  totp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

const GenerateTotp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { tempToken } = location.state || {};

  const [generateTotp] = useGenerateTotpMutation();
  const [verifySetup, { isLoading }] = useVerifyTotpMutation();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [setupToken, setSetupToken] = useState<string>();

  // Fetch QR when component mounts
  useEffect(() => {
    if (!tempToken) return; // Allowed inside useEffect

    const fetchTotp = async () => {
      try {
        const response = await generateTotp({ tempToken }).unwrap();

        setQrCode(response.data.qrCode);
        setSetupToken(response.data.setupToken);
      } catch (err) {
        showError(getErrorMessage(err));
        navigate("/login");
      }
    };

    fetchTotp();
  }, [tempToken]);

  //   Now the conditional AFTER hooks — safe
  if (!tempToken) {
    return <div>Session expired. Please login again.</div>;
  }

  const handleVerifySetup = async (values: { totp: string }) => {
    if (!setupToken) {
      showError("First Complete Account Register");
      return;
    }
    try {
      await verifySetup({
        tempToken: setupToken,
        totpCode: Number(values.totp),
      }).unwrap();

      showSuccess("TOTP setup completed!");
      navigate("/login");
    } catch (err) {
      showError(getErrorMessage(err));
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
            Two-Step Verification
          </h2>
          <p className="text-md text-secondary mb-0">
            Enhance your account security.
          </p>
        </div>

        {/* Setup Section */}
        <div>
          <h3 className="text-lg fw-semibold text-street-base mb-3">
            Setup Authenticator
          </h3>

          {/* QR Code Container */}
          <div
            className="rounded-3 p-4 text-center mb-3"
            style={{
              backgroundColor: "#F5F6FA",
              border: "2px dashed #E8F0FE",
            }}
          >
            {!qrCode ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "200px" }}
              >
                <Spinner animation="border" style={{ color: "#1B66C9" }} />
                <p className="mt-2 mb-0 text-secondary">Loading QR...</p>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center mb-2"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8F0FE",
                    padding: "10px",
                  }}
                >
                  <img
                    src={qrCode}
                    alt="TOTP QR"
                    style={{ width: 180, height: 180 }}
                  />
                </div>
                <p className="text-sm text-secondary mb-0">
                  Scan with your authenticator app
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <Formik
            initialValues={{ totp: "" }}
            validationSchema={totpSetupSchema}
            onSubmit={handleVerifySetup}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="totp" className="mb-3">
                  <Form.Label
                    className="text-sm fw-medium text-secondary "
                    style={{ marginBottom: "10px" }}
                  >
                    6-Digit TOTP Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={6}
                    value={values.totp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="000000"
                    isInvalid={touched.totp && !!errors.totp}
                    className=" text-center fs-4 tracking-widest"
                    style={{
                      backgroundColor: "var(--street-auth-input)",
                      border: "2px solid #E8F0FE",
                      borderRadius: "15px",
                      padding: "14px 16px",
                      letterSpacing: "8px",
                      fontSize: "20px",
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.totp}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  className="btn btn-street-primary w-100"
                  type="submit"
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(27, 102, 201, 0.2)",
                  }}
                >
                  {isLoading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default GenerateTotp;
