import { Formik } from "formik";
import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { PatternFormat } from "react-number-format";
import * as Yup from "yup";
import { handleDownload } from "../../../../../../utills/handleDownload";
import CustomDatePicker from "../../../../../../components/child/DatePicker";
interface FormProp {
  footer: boolean;
  isLoading: boolean;
  initialvalues: FormValues;
  id?: string;
  handleSubmit: (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => void;
}
// SCHEMA
const ClientFeedBackFormSchema = Yup.object({
  date: Yup.date()
    .required("Visit Date is required")
    .test("not-future-date", "Date cannot be in the future", (val) => {
      if (!val) return true;
      const today = new Date();
      const selected = new Date(val);
      // ignore time when comparing
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return selected <= today;
    }),

  location: Yup.string().required("location is required"),

  name: Yup.string().nullable(),

  phone: Yup.string()
    .matches(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
      "Enter a valid 10-digit Canadian phone number"
    )
    .nullable(),

  email: Yup.string().email("Invalid email format").nullable(),

  address: Yup.string().nullable(),

  natureOfComplaint: Yup.mixed<
    "Service Issue" | "Product Issue" | "Staff Behaviour" | "Other"
  >()
    .oneOf(
      ["Service Issue", "Product Issue", "Staff Behaviour", "Other"],
      "Select a valid complaint type"
    )
    .required("complaint Type is required"),

  otherComplaintDescription: Yup.string().nullable(),
  preferredContactMethod: Yup.mixed<"Phone" | "Email" | "Either">()
    .oneOf(["Phone", "Email", "Either"], "Select a preferred contact method")
    .required("Preferred contact method is required"),

  description: Yup.string().required("description is required"),
  impact: Yup.string().required("impact is required"),
  desiredOutcome: Yup.string().required("desired Outcome is required"),
});

export type FormValues = Yup.InferType<typeof ClientFeedBackFormSchema>;
const ClientFeedBackForm: React.FC<FormProp> = ({
  footer,
  isLoading,
  handleSubmit,
  initialvalues,
  id,
}) => {
  return (
    <Formik
      validationSchema={ClientFeedBackFormSchema}
      validateOnChange
      validateOnBlur
      initialValues={initialvalues}
      onSubmit={handleSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        handleBlur,
      }) => (
        <Form
          id={id ? id : "clientfeedbackForm"}
          onSubmit={handleSubmit}
          className="d-flex flex-column gap-24"
        >
          {/* ======= VISIT INFORMATION CARD ======= */}
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex flex-column gap-20 p-20">
              <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                Visit Information
              </h5>

              <Row className="gy-3 gx-4">
                {/* Date */}
                <Col xs={12} md={6}>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Date of Visit:
                    </Form.Label>

                    <CustomDatePicker
                      value={values.date ? new Date(values.date) : null}
                      onChange={(date) => {
                        setFieldValue("date", date, true); // ← Add true to validate immediately
                        setFieldTouched("date", true, false); // ← false prevents double validation
                      }}
                      onBlur={handleBlur}
                      isInvalid={!!errors.date && !!touched.date}
                    />

                    {touched.date && errors.date && (
                      <div className="invalid-feedback d-block">
                        {String(errors.date)}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Location */}
                <Col xs={12} md={6}>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Location
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="location"
                      placeholder="Building, room, or area"
                      value={values.location}
                      onChange={handleChange}
                      className="text-xs xs:text-sm fw-normal"
                      isInvalid={!!errors.location && touched.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ======= CLIENT INFORMATION CARD ======= */}
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex flex-column gap-20 p-20">
              <h5 className="fw-semibold text-md md:text-lg text-street-dark ">
                Client Information <span className="text-sm">(optional)</span>
              </h5>

              {/* Name */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={values.name ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="text-xs xs:text-sm"
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Phone + Email */}
              <Row className="gy-3 gx-4">
                <Col xs={12} md={6}>
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label className="fw-normal m-0">Phone</Form.Label>
                    <PatternFormat
                      format="+1 (###) ###-####"
                      mask="_"
                      name="phone"
                      className={`form-control ${
                        touched.phone && errors.phone ? "is-invalid" : ""
                      }`}
                      value={values.phone}
                      onValueChange={(val) => {
                        handleChange({
                          target: {
                            name: "phone",
                            value: val.formattedValue,
                          },
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group className="d-flex flex-column gap-1">
                    <Form.Label className="fw-normal m-0">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email ?? ""}
                      onChange={handleChange}
                      isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Address */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Address:
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={values.address ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="text-xs xs:text-sm"
                  isInvalid={touched.address && !!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Preferred Method of Contact
                </Form.Label>

                <div className="d-flex flex-row gap-20">
                  {["Phone", "Email", "Either"].map((method) => (
                    <label
                      key={method}
                      className="d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={method}
                        checked={values.preferredContactMethod === method}
                        onChange={() =>
                          setFieldValue("preferredContactMethod", method)
                        }
                        className="form-check-input"
                      />
                      <span className="text-xs xs:text-sm">{method}</span>
                    </label>
                  ))}
                </div>

                {touched.preferredContactMethod &&
                  errors.preferredContactMethod && (
                    <div className="text-danger text-xs mt-1">
                      {errors.preferredContactMethod}
                    </div>
                  )}
              </Form.Group>
            </Card.Body>
          </Card>

          {/* ======= COMPLAINT DETAILS CARD ======= */}
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex flex-column gap-20 p-20">
              <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                Complaint Details
              </h5>

              {/* Nature of Complaint (Checkbox style, single-select) */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Nature of Complaint:
                </Form.Label>

                <div className="d-flex flex-row gap-20">
                  {[
                    "Service Issue",
                    "Product Issue",
                    "Staff Behaviour",
                    "Other",
                  ].map((option) => (
                    <label
                      key={option}
                      className="d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={values.natureOfComplaint === option}
                        onChange={() =>
                          setFieldValue(
                            "natureOfComplaint",
                            values.natureOfComplaint === option ? "" : option
                          )
                        }
                        className="form-check-input"
                      />
                      <span className="text-xs xs:text-sm">{option}</span>
                    </label>
                  ))}
                </div>

                {touched.natureOfComplaint && errors.natureOfComplaint && (
                  <div className="text-danger text-xs mt-1">
                    {errors.natureOfComplaint}
                  </div>
                )}
              </Form.Group>

              {/* Other Text Input */}
              {values.natureOfComplaint === "Other" && (
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Please specify:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="otherComplaintDescription"
                    value={values.otherComplaintDescription ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={
                      touched.otherComplaintDescription &&
                      !!errors.otherComplaintDescription
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.otherComplaintDescription}
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              {/* Description */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Please describe your concern:
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="text-xs xs:text-sm"
                  isInvalid={touched.description && !!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* ======= IMPACT & OUTCOME CARD ======= */}
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex flex-column gap-20 p-20">
              <h5 className="fw-semibold text-md md:text-lg text-street-dark ">
                Impact & Desired Outcome
              </h5>

              {/* Impact */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  How has this issue affected you?
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="impact"
                  value={values.impact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="text-xs xs:text-sm"
                  isInvalid={touched.impact && !!errors.impact}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.impact}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Desired Outcome */}
              <Form.Group className="d-flex flex-column gap-8">
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  What outcome would you like?
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="desiredOutcome"
                  value={values.desiredOutcome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="text-xs xs:text-sm"
                  isInvalid={touched.desiredOutcome && !!errors.desiredOutcome}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.desiredOutcome}
                </Form.Control.Feedback>
              </Form.Group>
            </Card.Body>
          </Card>
          {footer && (
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-row justify-content-end gap-20 p-20">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764679476/client_feedback_form_cqmdk2.pdf",
                      "Employee Incident Report Form"
                    )
                  }
                  className="btn btn-street-lg btn-street-outline-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  Download
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </Card.Body>
            </Card>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default ClientFeedBackForm;
