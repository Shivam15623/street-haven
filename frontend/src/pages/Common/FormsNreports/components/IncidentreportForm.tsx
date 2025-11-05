import React from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import { useCreateIncidentReportMutation } from "../../../../services/IncidentReportApi";
import { showSuccess } from "../../../../utills/toastutills";
import Badge from "../../../../components/child/Badge";

import { TimePicker } from "../../../../components/child/TimePicker";
import CustomDatePicker from "../../../../components/child/DatePicker";
import QuillEditor from "../../../../components/child/QuillEditor";

const incidentReportSchema = Yup.object({
  date: Yup.string()
    .required("Date of incident is required")
    .test("valid-date", "Invalid date format", (val) => {
      return val ? !isNaN(Date.parse(val)) : false;
    })
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

  location: Yup.string(),

  description: Yup.string()
    .required("Description is required")
    .max(500, "Description cannot exceed 500 characters"),

  witnesses: Yup.array()
    .of(Yup.string().required("Witness cannot be empty"))
    .min(1, "At least one witness is required"),

  actionsTaken: Yup.string().max(
    500,
    "Actions taken cannot exceed 500 characters"
  ),
  newWitness: Yup.string(),
  reporterName: Yup.string(),
});

type IncidentReportFormValues = Yup.InferType<typeof incidentReportSchema>;

const IncidentreportForm: React.FC = () => {
  const [createIncidentReport, { isLoading }] =
    useCreateIncidentReportMutation();
  const handleSubmit = async (
    values: IncidentReportFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const fullDateTime = new Date(
        `${values.date}T${values.time}`
      ).toISOString();

      const payload = {
        ...values,
        date: fullDateTime, // full ISO timestamp
      };

      const res = await createIncidentReport(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="card">
      <div className="card-body  d-flex flex-column gap-12 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-20 p-md-24">
        <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-0">
          Incident Reporting Form
        </h4>

        <Formik
          validationSchema={incidentReportSchema}
          validateOnChange={true}
          validateOnBlur={true}
          initialValues={{
            date: new Date().toISOString().split("T")[0],
            time: "",
            location: "",
            description: "",
            witnesses: [] as string[],
            actionsTaken: "",
            reporterName: "",
            newWitness: "",
          }}
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
                            setFieldValue(
                              "date",
                              date ? date.toISOString().split("T")[0] : ""
                            );
                            setFieldTouched("date", true);
                          }}
                          isInvalid={!!errors.date && touched.date}
                        />

                        {/* Show error manually */}
                        {errors.date && touched.date && (
                          <div className="invalid-feedback d-block">
                            {errors.date}
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
                          name="time"
                          value={values.time}
                          onChange={(val) => setFieldValue("time", val)}
                          onBlur={() => setFieldTouched("time", true)} // 👈 handled automatically
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

                  {/* Reporter Name */}
                  <Form.Group
                    controlId="reporterName"
                    className="d-flex flex-column gap-8"
                  >
                    <Form.Label className=" text-xs xs:text-sm fw-medium text-street-dark">
                      Reporter Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="reporterName"
                      placeholder="Your name"
                      value={values.reporterName}
                      onChange={handleChange}
                      className="text-xs xs:text-sm fw-normal"
                      isInvalid={!!errors.reporterName && touched.reporterName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.reporterName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Actions */}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="submit"
                      className="btn btn-street-primary btn-street-lg text-xs xs:text-sm px-8  w-144-px h-40-px fw-medium radius-12"
                    >
                      Submit Report
                    </button>
                    <button className="btn btn-street-neutral btn-street-lg text-xs xs:text-sm px-8   w-144-px h-40-px fw-medium border-0 radius-12">
                      Cancel
                    </button>
                  </div>
                </Form>
                {isLoading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center "
                    style={{ zIndex: 10 }}
                  >
                    <Spinner
                      animation="border"
                      role="status"
                      style={{
                        width: "4rem",
                        height: "4rem",
                        borderWidth: "0.25rem",
                        color: "var(--street-primary-base)",
                      }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}
              </div>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default IncidentreportForm;
