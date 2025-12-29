import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";

import Badge from "../../../../../../components/child/Badge";

import TimePicker from "../../../../../../components/child/TimePicker";
import CustomDatePicker from "../../../../../../components/child/DatePicker";
import QuillEditor from "../../../../../../components/child/QuillEditor";
import { handleDownload } from "../../../../../../utills/handleDownload";
const incidentReportSchema = Yup.object({
  date: Yup.date()
    .required("Date of incident is required")

    .test("not-future-date", "Date cannot be in the future", (val) => {
      if (!val) return true;
      const today = new Date();
      const selected = new Date(val);
      // ignore time when comparing
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return selected <= today;
    }),
  time: Yup.string()
    .required("Time of incident is required")
    .test("not-future-time", "Time cannot be in the future", function (val) {
      const { date } = this.parent;
      if (!date || !val) return true;

      const today = new Date();
      const selectedDate = new Date(date);

      // check only if the selected date = today
      const isToday =
        selectedDate.getFullYear() === today.getFullYear() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getDate() === today.getDate();

      if (isToday) {
        const [h, m] = val.split(":");
        const selected = new Date();
        selected.setHours(Number(h), Number(m), 0, 0);

        return selected <= today;
      }

      return true;
    }),

  location: Yup.string().required("location is required"),

  description: Yup.string()
    .required("Description is required")
    .max(500, "Description cannot exceed 500 characters"),

  witnesses: Yup.array()
    .of(Yup.string().required("Witness cannot be empty"))
    .min(1, "At least one witness is required")
    .max(5, "At most five witness is required"),

  actionsTaken: Yup.string()
    .max(500, "Actions taken cannot exceed 500 characters")
    .required("actions Taken is Required"),
  newWitness: Yup.string(),
});
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
export type FormValues = Yup.InferType<typeof incidentReportSchema>;
const IncidentReportForm: React.FC<FormProp> = ({
  footer,
  isLoading,
  initialvalues,
  id,
  handleSubmit,
}) => {
  return (
    <Formik
      validationSchema={incidentReportSchema}
      validateOnChange={true}
      validateOnBlur={true}
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
        handleReset,
      }) => {
        return (
          <div
            className={`position-relative ${
              isLoading ? "pointer-events-none" : ""
            }`}
          >
            <Form
              noValidate
              onSubmit={handleSubmit}
              id={id ? id : "create-incident-report"}
              className="d-flex flex-column gap-20"
            >
              {/* Date + Time */}

              <Row className="gy-3 gy-md-0 gx-0 gx-md-4">
                {/* Date */}
                <Col xs={12} md={6}>
                  <Form.Group
                    controlId="date"
                    className="d-flex flex-column gap-8"
                  >
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Date of Incident
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

                    {/* Show error manually */}
                    {errors.date && touched.date && (
                      <div className="invalid-feedback d-block">
                        {String(errors.date)}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Time */}
                <Col xs={12} md={6}>
                  <Form.Group
                    controlId="time"
                    className="d-flex flex-column gap-8"
                  >
                    <Form.Label className="text-xs xs:text-sm  fw-medium text-street-dark">
                      Time of Incident
                    </Form.Label>

                    <TimePicker
                      value={values.time}
                      onChange={(val) => setFieldValue("time", val)}
                      className={
                        touched.time && errors.time ? "is-invalid" : ""
                      }
                      onBlur={() => setFieldTouched("time", true)}
                    />

                    {errors.time && touched.time && (
                      <div className="invalid-feedback d-block">
                        {errors.time}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Location */}
              <Form.Group
                controlId="location"
                className="d-flex flex-column gap-8"
              >
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  placeholder="Building, room, or area where issue is located"
                  value={values.location}
                  onChange={handleChange}
                  className="text-xs xs:text-sm fw-normal"
                  isInvalid={!!errors.location && touched.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Description */}
              <Form.Group
                controlId="description"
                className="d-flex flex-column gap-8"
              >
                <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                  Detailed Description
                </Form.Label>
                <QuillEditor
                  content={values.description}
                  onChange={(val) => setFieldValue("description", val)}
                  isInvalid={touched.description && !!errors.description}
                  errorMessage={errors.description as string}
                />
                <div className="text-start  text-sm text-street-base">
                  {values.description.length} /500 characters
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Witnesses */}
              <Form.Group
                controlId="witnesses"
                className="d-flex flex-column gap-8"
              >
                <Form.Label className=" text-xs xs:text-sm fw-medium text-street-dark">
                  Witnesses
                </Form.Label>
                <FieldArray name="witnesses">
                  {({ push, remove }) => (
                    <>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Add a witness"
                          value={values.newWitness ?? ""}
                          onChange={(e) =>
                            setFieldValue("newWitness", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // ensure witnesses array exists
                              const witnessesArray = values.witnesses ?? [];
                              if (
                                values.newWitness &&
                                !witnessesArray.includes(values.newWitness)
                              ) {
                                push(values.newWitness);
                                setFieldValue("newWitness", "");
                              }
                            }
                          }}
                        />
                        <button
                          className="btn-street-primary radius-8 px-3 text-lg"
                          type="button"
                          onClick={() => {
                            if (
                              values.newWitness &&
                              values.witnesses &&
                              values?.witnesses.length < 5
                            ) {
                              push(values.newWitness);
                              setFieldValue("newWitness", "");
                            }
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div className="d-flex gap-2 flex-wrap mb-2">
                        {(values.witnesses ?? []).map((w, i) => (
                          <Badge key={i} variant="primary-soft">
                            {w}{" "}
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => remove(i)}
                            >
                              ×
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </FieldArray>
              </Form.Group>

              {/* Actions Taken */}
              <Form.Group
                controlId="actionsTaken"
                className="d-flex flex-column gap-8"
              >
                <Form.Label className=" text-xs xs:text-sm fw-medium text-street-dark">
                  Actions Taken
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="actionsTaken"
                  placeholder="Describe any immediate actions taken..."
                  value={values.actionsTaken}
                  onChange={handleChange}
                  className="text-xs xs:text-sm fw-normal mb-10"
                  isInvalid={!!errors.actionsTaken && touched.actionsTaken}
                />{" "}
                <div className="text-start  text-sm text-street-base">
                  {values.actionsTaken.length} /500 characters
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.actionsTaken}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Actions */}
              {footer && (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764759586/Incident_Reporting_mklfum.pdf",
                        "Incident Reporting Form"
                      )
                    }
                    className="btn btn-street-lg btn-street-outline-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                  >
                    Download
                  </button>
                  <button
                    type="submit"
                    className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                  >
                    Submit Report
                  </button>

                  <button
                    className="btn btn-street-neutral btn-street-lg d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                    onClick={handleReset}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default IncidentReportForm;
