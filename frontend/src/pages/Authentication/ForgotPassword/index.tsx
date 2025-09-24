import React from "react";
import AuthWrapper from "../../../components/Authentication/AuthWrapper";
import AuthFormWrapper from "../../../components/Authentication/AuthFormWrapper";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useForgotPasswordMutation } from "../../../services/AuthApi";
import { showSuccess } from "../../../utills/toastutills";
interface ForgotValues {
  email: string;
}
const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
});
const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const forgotpassword = async (values: ForgotValues) => {
    try {
      const res = await forgotPassword({ email: values.email }).unwrap();
      if (res?.success) {
        showSuccess(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <AuthWrapper
      sideimage="assets/images/auth/8e1ff61526c7396410d2ae15f20361181167f0c1.jpg"
      mtext="Welcome to the Street Haven Community"
      subText="Create an Account or Log In to Access Support, Resources & Community Events"
    >
      <AuthFormWrapper
        title="Forgot password?"
        subText="Welcome back! Please enter your details below."
      >
        <div className="w-100 d-flex flex-column gap-24">
          <div className="text-center text-lg fw-semibold ">Login Now</div>
          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={forgotPasswordSchema}
            onSubmit={forgotpassword}
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
                        <Form.Label className="fw-medium mb-2">
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Your email"
                          value={values.email}
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
                </div>
                <Button
                  type="submit"
                  className="btn btn-street-primary text-xs btn-sm px-12 py-11 w-100 text-white fw-medium radius-12 "
                >
                  Sign In
                </Button>
              </Form>
            )}
          </Formik>
          <p className="text-center">
            {" "}
            <Link
              to={"/Signup"}
              className="text-primary-600  text-sm fw-normal mt-3 "
              style={{ color: "#0160A6" }}
            >
              <Icon
                icon="mdi:arrow-left"
                style={{ marginRight: "5px", verticalAlign: "middle" }}
              />{" "}
              Back to Login
            </Link>
          </p>
        </div>
      </AuthFormWrapper>
    </AuthWrapper>
  );
};

export default ForgotPassword;
