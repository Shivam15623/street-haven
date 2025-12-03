import { Formik } from "formik";

import * as Yup from "yup";
import { Col, Form, Row, Card } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";

import TimePicker from "../../../../../components/child/TimePicker";
import {
  useCreateClientincidentMutation,
  type ClientIncidentCredentials,
} from "../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";

const ClientIncidentFormSchema = Yup.object({
  date: Yup.date().required("Date is required"),

  time: Yup.string().required("Time is required"),

  place: Yup.string().required("Place is required"),

  affectedClientname: Yup.string().required("Client name is required"),

  staffName: Yup.string().required("Staff name is required"),

  WitnessName: Yup.string().required("Witness name is required"),

  staffEmail: Yup.string()
    .email("Invalid staff email format")
    .required("Staff email is required"),

  incidentType: Yup.string()
    .oneOf(
      [
        "Disaster",
        "Drugs",
        "Property Destruction",
        "Theft",
        "Medical / Injury / Health Emergency",
        "Intruders",
        "Police Action",
        "Actual Physical / Sexual Violence",
        "Threat of Physical / Sexual Violence",
        "Bomb Threat",
        "Other",
        "",
      ],
      "Select a valid incident type"
    )
    .required("Type of Incident is required"),

  otherIncidentDescription: Yup.string().when("incidentType", {
    is: "Other",
    then: (schema) => schema.required("Please specify the incident"),
    otherwise: (schema) => schema.notRequired(),
  }),

  incidentDescription: Yup.string().required(
    "Incident description is required"
  ),

  ActionTaken: Yup.string().required("Action taken is required"),

  debrief: Yup.string().required("Debrief is required"),

  reportingStaffName: Yup.string().required("Reporting staff name is required"),
  repotingDate: Yup.date().required("reporting Date is required"),

  reportedTo: Yup.string().required("Reported to (name) is required"),
  reportedToDate: Yup.date().required("reported Date is required"),
  followUp: Yup.string().required("Follow Up is required"),
});
type ClientIncidentValues = Yup.InferType<typeof ClientIncidentFormSchema>;
const ClientIncidentForm = () => {
  const [createIncident, { isLoading }] = useCreateClientincidentMutation();
  const handleSubmit = async (values: ClientIncidentValues) => {
    console.log("dfjvdfjvsavfsd", values);
    try {
      const payload: ClientIncidentCredentials = {
        date: values.date,
        place: values.place,
        action: values.ActionTaken,
        type: values.incidentType,
        time: values.time,
        witnessName: values.WitnessName, // ✅ FIXED
        affectedClient: values.affectedClientname,
        debrief: values.debrief,
        description: values.incidentDescription,
        reportingStaffName: values.reportingStaffName,
        reportedTo: values.reportedTo,
        staffEmail: values.staffEmail,
        staffName: values.staffName,
        followUp: values.followUp,
        reportedToDate: values.reportedToDate,
        reportingDate: values.repotingDate,

        // ✅ You forgot these:
      };

      if (values.incidentType === "Other" && values.otherIncidentDescription) {
        payload.otherincidentType = values.otherIncidentDescription;
      }

      const res = await createIncident(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError(err.message ?? "Something went wrong");
    }
  };

  const initialValues: ClientIncidentValues = {
    date: new Date(),
    time: "",
    place: "",
    affectedClientname: "",
    staffName: "",
    WitnessName: "",
    staffEmail: "",
    incidentType: "" as
      | "Disaster"
      | "Drugs"
      | "Property Destruction"
      | "Theft"
      | "Medical / Injury / Health Emergency"
      | "Intruders"
      | "Police Action"
      | "Actual Physical / Sexual Violence"
      | "Threat of Physical / Sexual Violence"
      | "Bomb Threat"
      | "Other"
      | "", // allow empty initially
    otherIncidentDescription: "",
    incidentDescription: "",
    ActionTaken: "",
    debrief: "",
    reportingStaffName: "",
    reportedTo: "",
    repotingDate: new Date(),
    reportedToDate: new Date(),
    followUp: "",
  };
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Free memory
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
              Client Incident Reporting Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ClientIncidentFormSchema} // Note: make sure the variable name matches
        validateOnChange
        validateOnBlur
        onSubmit={handleSubmit}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          errors,
          touched,
        }) => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-24"
          >
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <div
                  className="text-md sm:text-lg text-street-dark fw-semibold"
                  style={{
                    lineHeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Section 1: Background
                </div>
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Date of Incident
                      </Form.Label>

                      <CustomDatePicker
                        value={values.date ? new Date(values.date) : null}
                        onChange={(date) => {
                          const newDate = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          setFieldValue("date", newDate, true);
                          setFieldTouched("date", true, false);
                        }}
                        isInvalid={Boolean(errors.date && touched.date)}
                      />

                      {errors.date && touched.date && (
                        <div className="invalid-feedback d-block">
                          {String(errors.date)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Location */}
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
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Place:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="place"
                    value={values.place}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.place && !!errors.place}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.place}
                  </Form.Control.Feedback>
                </Form.Group>
                <Row className="gy-3 gx-4">
                  <Col xs={12} md={6} className="d-flex flex-column gap-24">
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Affected Client Name:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="affectedClientname"
                        value={values.affectedClientname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={
                          touched.affectedClientname &&
                          !!errors.affectedClientname
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.affectedClientname}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Name of Witness (if any)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="WitnessName"
                        value={values.WitnessName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.WitnessName && !!errors.WitnessName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.WitnessName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className="d-flex flex-column gap-24">
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Staff Name:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="staffName"
                        value={values.staffName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.staffName && !!errors.staffName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.staffName}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Staff Email:
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="staffEmail"
                        value={values.staffEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.staffEmail && !!errors.staffEmail}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.staffEmail}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark mb-3">
                    Type of Incident:
                  </Form.Label>
                  <div className="row gy-3 gx-4 ">
                    {[
                      "Disaster",
                      "Drugs",
                      "Property Destruction",
                      "Theft",
                      "Medical / Injury / Health Emergency",
                      "Intruders",
                      "Police Action",
                      "Actual Physical / Sexual Violence",
                      "Threat of Physical / Sexual Violence",
                      "Bomb Threat",
                      "Other",
                    ].map((option) => (
                      <div className="col-12 col-xs-6 col-sm-4 " key={option}>
                        <div
                          className="p-8 border-0-5 rounded-1 border-sh-base-50"
                          style={{ backgroundColor: "var(--street-card)" }}
                        >
                          <label
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={values.incidentType === option}
                              onChange={() =>
                                setFieldValue(
                                  "incidentType",
                                  values.incidentType === option ? "" : option
                                )
                              }
                              className="form-check-input"
                            />
                            <span className="text-xs xs:text-sm">{option}</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {touched.incidentType && errors.incidentType && (
                    <div className="text-danger text-xs mt-1">
                      {errors.incidentType}
                    </div>
                  )}
                </Form.Group>

                {/* Other Text Input */}
                {values.incidentType === "Other" && (
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Please specify:
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="otherIncidentDescription"
                      value={values.otherIncidentDescription}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={
                        touched.otherIncidentDescription &&
                        !!errors.otherIncidentDescription
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.otherIncidentDescription}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <div
                  className="text-md sm:text-lg text-street-dark fw-semibold"
                  style={{
                    lineHeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Section 2: Incident
                </div>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Clear Concise Description of the Incident:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="incidentDescription"
                    value={values.incidentDescription}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={
                      touched.incidentDescription &&
                      !!errors.incidentDescription
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.incidentDescription}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <div
                  className="text-md sm:text-lg text-street-dark fw-semibold"
                  style={{
                    lineHeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Section 3: Action Taken
                </div>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Action Taken:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="ActionTaken"
                    value={values.ActionTaken}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.ActionTaken && !!errors.ActionTaken}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ActionTaken}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <div
                  className="text-md sm:text-lg  text-street-dark fw-semibold"
                  style={{
                    lineHeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Section 4: Debrief
                </div>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Debrief:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="debrief"
                    value={values.debrief}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.debrief && !!errors.debrief}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.debrief}
                  </Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    {" "}
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Reporting Staff Name:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="reportingStaffName"
                        value={values.reportingStaffName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={
                          touched.reportingStaffName &&
                          !!errors.reportingStaffName
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.reportingStaffName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    {" "}
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Reporting Date:
                      </Form.Label>
                      <CustomDatePicker
                        value={
                          values.repotingDate
                            ? new Date(values.repotingDate)
                            : null
                        }
                        onChange={(date) => {
                          setFieldValue("repotingDate", date, true);
                          setFieldTouched("repotingDate", true, false);
                        }}
                        isInvalid={Boolean(
                          errors.repotingDate && touched.repotingDate
                        )}
                      />

                      {errors.repotingDate && touched.repotingDate && (
                        <div className="invalid-feedback d-block">
                          {String(errors.repotingDate)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    {" "}
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Reported To:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="reportedTo"
                        value={values.reportedTo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.reportedTo && !!errors.reportedTo}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.reportedTo}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    {" "}
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Reported Date:
                      </Form.Label>
                      <CustomDatePicker
                        value={
                          values.reportedToDate
                            ? new Date(values.reportedToDate)
                            : null
                        }
                        onChange={(date) => {
                          setFieldValue("reportedToDate", date, true);
                          setFieldTouched("reportedToDate", true, false);
                        }}
                        isInvalid={Boolean(
                          errors.reportedToDate && touched.reportedToDate
                        )}
                      />

                      {errors.reportedToDate && touched.reportedToDate && (
                        <div className="invalid-feedback d-block">
                          {String(errors.reportedToDate)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <div
                  className="text-md sm:text-lg  text-street-dark fw-semibold"
                  style={{
                    lineHeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Section 5: Follow Up (Post Incident) *To be completed by
                  management
                </div>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="followUp"
                    value={values.followUp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.followUp && !!errors.followUp}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.followUp}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                
                <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764759062/Client_Incident_Report_Form_bactlw.pdf",
                          "Client Incident Report Form"
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
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ClientIncidentForm;
