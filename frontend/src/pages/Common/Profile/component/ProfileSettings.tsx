import React from "react";
import { Formik, Form as FormikForm } from "formik";
import { Form, Row, Col } from "react-bootstrap";
import * as Yup from "yup";
import { Icon } from "@iconify/react/dist/iconify.js";

// ✅ Validation Schema
const ProfileSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  title: Yup.string().required("Title is required"),
  hireDate: Yup.date().required("Hire date is required"),
  timePeriod: Yup.string().required("Time period is required"),
  workEmail: Yup.string()
    .email("Invalid email")
    .required("Work email is required"),
  workPhone: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Work phone is required"),
});

const ProfileSettings: React.FC = () => {
  return (
    <div className="card">
      <div className="card-body p-16 radius-8 p-md-24  d-flex flex-column gap-20">
        <h3 className="text-street-dark text-xl fw-semibold">Settings</h3>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            title: "",
            hireDate: "",
            timePeriod: "",
            workEmail: "",
            workPhone: "",
          }}
          validationSchema={ProfileSchema}
          onSubmit={(values) => {
            console.log("Form submitted ✅", values);
          }}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            <Form noValidate onSubmit={handleSubmit} as={FormikForm}>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  First Name
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    isInvalid={touched.firstName && !!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Last Name
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    isInvalid={touched.lastName && !!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Title
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    isInvalid={touched.title && !!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Hire Date
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="date"
                    name="hireDate"
                    value={values.hireDate}
                    onChange={handleChange}
                    isInvalid={touched.hireDate && !!errors.hireDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hireDate}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Time Period
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="timePeriod"
                    value={values.timePeriod}
                    onChange={handleChange}
                    isInvalid={touched.timePeriod && !!errors.timePeriod}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.timePeriod}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Work Email
                </Form.Label>
                <Col sm={10}>
                  <div className="icon-field">
                    <span className="icon">
                      <Icon
                        icon="mdi-light:email"
                        className="text-street-base"
                      />
                    </span>
                    <Form.Control
                      type="text"
                      name="workEmail"
                      placeholder="jane.doe@streethaven.org"
                      value={values.workEmail}
                      onChange={handleChange}
                      isInvalid={touched.workEmail && !!errors.workEmail}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.workEmail}
                    </Form.Control.Feedback>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Work Phone
                </Form.Label>
                <Col sm={10}>
                  <div className="icon-field">
                    <span className="icon">
                      <Icon
                        icon="famicons:call-outline"
                        className="text-street-base"
                      />
                    </span>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="workPhone"
                      placeholder="+1 (416) 555-2045"
                      value={values.workPhone}
                      onChange={handleChange}
                      isInvalid={touched.workPhone && !!errors.workPhone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.workPhone}
                    </Form.Control.Feedback>
                  </div>
                </Col>
              </Row>
              <div className="d-flex gap-16 justify-content-end">
                <button
                  className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12  px-8"
                  type="submit"
                >
                  Submit
                </button>
                <button
                  className="btn btn-street-neutral btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 w-144-px h-40-px px-8"
                  type="submit"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfileSettings;
