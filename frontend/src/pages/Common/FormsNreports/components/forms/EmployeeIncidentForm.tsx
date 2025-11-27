import { Formik } from "formik";
import * as Yup from "yup";
import { Card, Col, Form, Row } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { PatternFormat } from "react-number-format";
import TimePicker from "../../../../../components/child/TimePicker";
import {
  useCreateEmployeeIncidentMutation,
  type EmployeeIncidentCredentials,
} from "../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";

export const EmployeeIncidentFormSchema = Yup.object({
  reportingFor: Yup.string()
    .oneOf(["Injury", "Illness", "Near Miss"], "Invalid option")
    .required("This field is required"),

  employeeName: Yup.string().required("Employee name is required"),

  jobTitle: Yup.string().required("Job title is required"),

  superviserName: Yup.string().required("Supervisor name is required"),

  informedSuperviser: Yup.boolean().required("please fill this field"),

  injuryDate: Yup.date()
    .typeError("Please input a valid date (M/d/yyyy)")
    .required("Date of injury / near miss is required"),

  injuryTime: Yup.string().required("Time is required"),

  witnessName: Yup.string(),

  exactLocation: Yup.string().required("Location is required"),

  activityAtTime: Yup.string().required("This field is required"),

  incidentDescription: Yup.string().required("This field is required"),

  prevention: Yup.string().required("This field is required"),

  injuredBodyParts: Yup.string().required("This field is required"),

  doctorVisited: Yup.boolean().required("This Field is Required"),

  doctorName: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) => schema.required("Doctor name is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorPhone: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) =>
      schema
        .required("Doctor phone number is required")
        .matches(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorVisitDate: Yup.date().when("doctorVisited", {
    is: true,
    then: (schema) =>
      schema
        .required("Date is required")
        .typeError("Enter a valid date (M/d/yyyy)"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorVisitTime: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) => schema.required("Time is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  previousInjury: Yup.boolean().required(),

  previousInjuryDate: Yup.string().when("previousInjury", {
    is: true,
    then: (schema) =>
      schema.required("Please provide the previous injury date"),
    otherwise: (schema) => schema.nullable(),
  }),
});
interface EmployeeIncidentFormValues {
  reportingFor: string;
  employeeName: string;
  jobTitle: string;
  superviserName: string;
  informedSuperviser: boolean;
  injuryDate: Date;
  injuryTime: string;
  witnessName: string;
  exactLocation: string;
  activityAtTime: string;
  incidentDescription: string;
  prevention: string;
  injuredBodyParts: string;
  doctorVisited: boolean;
  doctorName: string;
  doctorPhone: string;
  doctorVisitDate?: Date;
  doctorVisitTime?: string;
  previousInjury: boolean;
  previousInjuryDate: string;
}
const EmployeeIncidentForm = () => {
  const [createIncident, { isLoading }] = useCreateEmployeeIncidentMutation();
  const handleSubmit = async (values: EmployeeIncidentFormValues) => {
    try {
      const payload: EmployeeIncidentCredentials = {
        type: values.reportingFor,
        name: values.employeeName,
        jobTitle: values.jobTitle,
        supervisor: values.superviserName,
        informedSupervisor: values.informedSuperviser,
        injuryDate: values.injuryDate,
        injuryTime: values.injuryTime,

        location: values.exactLocation,
        activityAtTime: values.activityAtTime,
        description: values.incidentDescription,
        preventionSuggestion: values.prevention,
        injuredBodyPartOrRisk: values.injuredBodyParts,
        sawDoctor: values.doctorVisited,
        previousInjury: values.previousInjury,
      };
      if (values.witnessName) {
        payload.witnessName = values.witnessName;
      }
      if (values.doctorVisited === true) {
        payload.doctorName = values.doctorName;
        payload.doctorPhone = values.doctorPhone;
        payload.doctorVisitDate = values.doctorVisitDate;
        payload.doctorVisitTime = values.doctorVisitTime;
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

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
              Employee Incident Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ FORM START */}
      <Formik
        validationSchema={EmployeeIncidentFormSchema}
        validateOnChange
        validateOnBlur
        initialValues={{
          reportingFor: "",
          employeeName: "",
          jobTitle: "",
          superviserName: "",
          informedSuperviser: false,
          injuryDate: new Date(),
          injuryTime: "",
          witnessName: "",
          exactLocation: "",
          activityAtTime: "",
          incidentDescription: "",
          prevention: "",
          injuredBodyParts: "",
          doctorVisited: false,
          doctorName: "",
          doctorPhone: "",
doctorVisitDate:new Date(),
          doctorVisitTime: "",
          previousInjury: false,
          previousInjuryDate: "",
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
          handleBlur,
        }) => (
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-24">
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-10 p-20">
                {" "}
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    I am reporting a work related: *
                  </Form.Label>

                  <div className="d-flex flex-row gap-2 p-3 ">
                    {["Injury", "Illness", "Near Miss"].map((option) => (
                      <label
                        key={option}
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={values.reportingFor === option}
                          onChange={() =>
                            setFieldValue(
                              "reportingFor",
                              values.reportingFor === option ? "" : option
                            )
                          }
                          className="form-check-input"
                        />
                        <span className="text-xs xs:text-sm">{option}</span>
                      </label>
                    ))}
                  </div>

                  {touched.reportingFor && errors.reportingFor && (
                    <div className="text-danger text-xs mt-1">
                      {errors.reportingFor}
                    </div>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-10 p-20">
                {" "}
                <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                  Employee Information
                </h5>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Your Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeName"
                    value={values.employeeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.employeeName && !!errors.employeeName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.employeeName}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Job Title
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="jobTitle"
                    value={values.jobTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.jobTitle && !!errors.jobTitle}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.jobTitle}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Supervisor
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="superviserName"
                    value={values.superviserName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={
                      touched.superviserName && !!errors.superviserName
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.superviserName}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Have you told your supervisor about this injury/near miss?
                  </Form.Label>

                  <div className="d-flex flex-row gap-3 p-3  rounded">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={values.informedSuperviser === opt.value}
                          onChange={() =>
                            setFieldValue("informedSuperviser", opt.value)
                          }
                          className="form-check-input"
                        />
                        <span className="text-xs xs:text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {touched.informedSuperviser && errors.informedSuperviser && (
                    <div className="text-danger text-xs mt-1">
                      {errors.informedSuperviser}
                    </div>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-10 p-20">
                {" "}
                <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                  Incident Details
                </h5>
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Date of Injury/Near Miss
                      </Form.Label>

                      <CustomDatePicker
                        value={
                          values.injuryDate ? new Date(values.injuryDate) : null
                        }
                        onChange={(date) => {
                          const newDate = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          setFieldValue("injuryDate", newDate, true);
                          setFieldTouched("injuryDate", true, false);
                        }}
                        isInvalid={!!errors.injuryDate && !!touched.injuryDate}
                      />

                      {errors.injuryDate && touched.injuryDate && (
                        <div className="invalid-feedback d-block">
                          {String(errors.injuryDate)}
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
                        Time of injury/near miss
                      </Form.Label>

                      <TimePicker
                        value={values.injuryTime}
                        onChange={(val) => setFieldValue("injuryTime", val)}
                        className={
                          touched.injuryTime && errors.injuryTime
                            ? "is-invalid"
                            : ""
                        }
                        onBlur={() => setFieldTouched("injuryTime", true)}
                      />

                      {errors.injuryTime && touched.injuryTime && (
                        <div className="invalid-feedback d-block">
                          {errors.injuryTime}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Name of Witness (if any)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="witnessName"
                    value={values.witnessName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.witnessName && !!errors.witnessName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.witnessName}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Where, exactly did it happen?
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="exactLocation"
                    value={values.exactLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.exactLocation && !!errors.exactLocation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.exactLocation}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    What were you doing at the time?:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="activityAtTime"
                    value={values.activityAtTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={
                      touched.activityAtTime && !!errors.activityAtTime
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.activityAtTime}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Describe step by step what led up to the injury/near miss:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
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
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    What could have been done to prevent this injury/near miss?
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="prevention"
                    value={values.prevention}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={touched.prevention && !!errors.prevention}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.prevention}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    What parts of your body were injured? If a near miss, how
                    could you have been hurt?
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="injuredBodyParts"
                    value={values.injuredBodyParts}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-xs xs:text-sm"
                    isInvalid={
                      touched.injuredBodyParts && !!errors.injuredBodyParts
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.injuredBodyParts}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-10 p-20">
                {" "}
                <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                  Incident Details
                </h5>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Did you see a doctor about this injury/illness?
                  </Form.Label>

                  <div className="d-flex flex-row gap-3 p-3  rounded">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={values.doctorVisited === opt.value}
                          onChange={() =>
                            setFieldValue(
                              "doctorVisited",
                              values.doctorVisited === opt.value
                                ? ""
                                : opt.value
                            )
                          }
                          className="form-check-input"
                        />
                        <span className="text-xs xs:text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {touched.doctorVisited && errors.doctorVisited && (
                    <div className="text-danger text-xs mt-1">
                      {errors.doctorVisited}
                    </div>
                  )}
                </Form.Group>
                {values.doctorVisited === true && (
                  <div className="d-flex flex-column gap-16">
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        If yes, whom did you see?
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="doctorName"
                        value={values.doctorName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.doctorName && !!errors.doctorName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.doctorName}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="d-flex flex-column gap-1">
                      <Form.Label className="fw-normal m-0">
                        Doctor's phone number
                      </Form.Label>
                      <PatternFormat
                        format="+1 (###) ###-####"
                        mask="_"
                        name="doctorPhone"
                        className={`form-control ${
                          touched.doctorPhone && errors.doctorPhone
                            ? "is-invalid"
                            : ""
                        }`}
                        value={values.doctorPhone}
                        onValueChange={(val) => {
                          handleChange({
                            target: {
                              name: "doctorPhone",
                              value: val.formattedValue,
                            },
                          });
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.doctorPhone}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Row className="gy-3 gx-4">
                      {/* Date */}
                      <Col xs={12} md={6}>
                        <Form.Group className="d-flex flex-column gap-8">
                          <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                            Date
                          </Form.Label>

                          <CustomDatePicker
                            value={
                              values.doctorVisitDate
                                ? new Date(values.doctorVisitDate)
                                : null
                            }
                            onChange={(date) => {
                              const newDate = date
                                ? date.toISOString().split("T")[0]
                                : "";
                              setFieldValue("doctorVisitDate", newDate, true);
                              setFieldTouched("doctorVisitDate", true, false);
                            }}
                            isInvalid={
                              !!errors.doctorVisitDate &&
                              !!touched.doctorVisitDate
                            }
                          />

                          {errors.doctorVisitDate &&
                            touched.doctorVisitDate && (
                              <div className="invalid-feedback d-block">
                                {String(errors.doctorVisitDate)}
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
                            Time
                          </Form.Label>

                          <TimePicker
                            value={values.doctorVisitTime}
                            onChange={(val) =>
                              setFieldValue("doctorVisitTime", val)
                            }
                            className={
                              touched.doctorVisitTime && errors.doctorVisitTime
                                ? "is-invalid"
                                : ""
                            }
                            onBlur={() =>
                              setFieldTouched("doctorVisitTime", true)
                            }
                          />

                          {errors.doctorVisitTime &&
                            touched.doctorVisitTime && (
                              <div className="invalid-feedback d-block">
                                {errors.doctorVisitTime}
                              </div>
                            )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Has this part of your body been injured before?
                  </Form.Label>

                  <div className="d-flex flex-row gap-3 p-3  rounded">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={values.previousInjury === opt.value}
                          onChange={() =>
                            setFieldValue(
                              "previousInjury",
                              values.previousInjury === opt.value
                                ? ""
                                : opt.value
                            )
                          }
                          className="form-check-input"
                        />
                        <span className="text-xs xs:text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {touched.previousInjury && errors.previousInjury && (
                    <div className="text-danger text-xs mt-1">
                      {errors.previousInjury}
                    </div>
                  )}
                </Form.Group>
                {values.previousInjury === true && (
                  <div>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        If yes, when?
                      </Form.Label>

                      <CustomDatePicker
                        value={
                          values.previousInjuryDate
                            ? new Date(values.previousInjuryDate)
                            : null
                        }
                        onChange={(date) => {
                          const newDate = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          setFieldValue("previousInjuryDate", newDate, true);
                          setFieldTouched("previousInjuryDate", true, false);
                        }}
                        isInvalid={
                          !!errors.previousInjuryDate &&
                          touched.previousInjuryDate
                        }
                      />

                      {errors.previousInjuryDate &&
                        touched.previousInjuryDate && (
                          <div className="invalid-feedback d-block">
                            {errors.previousInjuryDate}
                          </div>
                        )}
                    </Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                <button
                  type="submit"
                  className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  Submit
                </button>
              </Card.Body>
            </Card>
          </Form>
        )}
      </Formik>
      {/* FORM END */}
    </div>
  );
};

export default EmployeeIncidentForm;
