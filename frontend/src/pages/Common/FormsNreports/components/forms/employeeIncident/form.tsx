import { Formik } from "formik";
import React, { useEffect } from "react";
import { Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { PatternFormat } from "react-number-format";
import * as Yup from "yup";
import { handleDownload } from "../../../../../../utills/handleDownload";
import CustomDatePicker from "../../../../../../components/child/DatePicker";
import TimePicker from "../../../../../../components/child/TimePicker";
import { useLazyEmployeeSuperFormQuery } from "../../../../../../services/EmployeeApi";
export const EmployeeIncidentFormSchema = Yup.object({
  reportingFor: Yup.string()
    .oneOf(["Injury", "Illness", "Near Miss"], "Invalid option")
    .required("This field is required"),
  employeeId: Yup.string().required("Employee name is required"),

  superviserName: Yup.string(),
  superviserId: Yup.string(),
  jobTitle: Yup.string(),

  informedSuperviser: Yup.boolean().required("please fill this field"),

  injuryDate: Yup.date()
    .required("Date of injury / near miss is required")
    .test(
      "not-future-date",
      "Date of injury cannot be in the future",
      (val) => {
        if (!val) return true;
        const today = new Date();
        const selected = new Date(val);
        // ignore time when comparing
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selected <= today;
      }
    ),

  injuryTime: Yup.string()
    .required("Time is required")
    .test(
      "not-future-time",
      "injury Time cannot be in the future",
      function (val) {
        const { injuryDate } = this.parent;
        if (!injuryDate || !val) return true;

        const [h, m] = val.split(":").map(Number);

        // combine date and time
        const incidentDateTime = new Date(injuryDate);
        incidentDateTime.setHours(h, m, 0, 0);

        const now = new Date();
        return incidentDateTime <= now;
      }
    ),

  witnessName: Yup.string(),

  exactLocation: Yup.string().required("Location is required"),

  activityAtTime: Yup.string().required("This field is required"),

  incidentDescription: Yup.string().required("This field is required"),

  prevention: Yup.string().required("This field is required"),

  injuredBodyParts: Yup.string(),

  doctorVisited: Yup.boolean()
    .default(false)
    .required("This Field is Required"),

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
        .min(
          Yup.ref("injuryDate"),
          "Doctor Visit Date Can not be earlier then injury Date"
        )
        .test(
          "not-future-date",
          "Date of doctor visit cannot be in the future",
          (val) => {
            if (!val) return true;
            const today = new Date();
            const selected = new Date(val);
            // ignore time when comparing
            selected.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            return selected <= today;
          }
        )
        .typeError("Enter a valid date (M/d/yyyy)"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorVisitTime: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) =>
      schema
        .required("Time is required")
        .test(
          "end-after-start",
          "doctor visit time must be later than start time",
          function (val) {
            const { injuryTime } = this.parent;
            if (!val || !injuryTime) return true;

            const [sh, sm] = injuryTime.split(":").map(Number);
            const [eh, em] = val.split(":").map(Number);

            const startMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;

            return endMinutes > startMinutes;
          }
        )
        .test(
          "not-future-time",
          "Time cannot be in the future",
          function (val) {
            const { doctorVisitDate } = this.parent;
            if (!doctorVisitDate || !val) return true;

            const [h, m] = val.split(":").map(Number);

            // combine date and time
            const incidentDateTime = new Date(doctorVisitDate);
            incidentDateTime.setHours(h, m, 0, 0);

            const now = new Date();
            return incidentDateTime <= now;
          }
        ),
    otherwise: (schema) => schema.nullable(),
  }),

  previousInjury: Yup.boolean().default(false).required(),

  previousInjuryDate: Yup.date().when("previousInjury", {
    is: true,
    then: (schema) =>
      schema
        .required("Please provide the previous injury date")
        .max(
          Yup.ref("injuryDate"),
          "Previous Injury Date can not be greater than inury Date"
        )
        .test(
          "not-future-date",
          "Date of doctor visit cannot be in the future",
          (val) => {
            if (!val) return true;
            const today = new Date();
            const selected = new Date(val);
            // ignore time when comparing
            selected.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            return selected <= today;
          }
        ),
    otherwise: (schema) => schema.nullable(),
  }),
});
interface FormProp {
  footer: boolean;
  isLoading: boolean;
  isActive: boolean;
  initialvalues: FormValues;
  id?: string;
  handleSubmit: (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => void;
}
export type FormValues = Yup.InferType<typeof EmployeeIncidentFormSchema>;
const EmployeeIncidentForm: React.FC<FormProp> = ({
  footer,
  isLoading,
  handleSubmit,
  initialvalues,
  isActive,
  id,
}) => {
  const [getEmpSup, { data, isLoading: fetchLoad }] =
    useLazyEmployeeSuperFormQuery();
  useEffect(() => {
    if (isActive) {
      getEmpSup();
    }
  }, [isActive, getEmpSup]);

  return (
    <Formik
      validationSchema={EmployeeIncidentFormSchema}
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
      }) => {
        return (
          <Form
            id={id ? id : "employeeincident"}
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-24"
          >
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-10 p-20">
                {" "}
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    I am reporting a work related:{" "}
                    <span className="text-danger">*</span>
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
              <Card.Body className="d-flex flex-column gap-20 p-20">
                {" "}
                <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                  Employee Information
                </h5>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label>
                    Employee Name: <span className="text-danger">*</span>
                  </Form.Label>

                  {fetchLoad ? (
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Spinner size="sm" />
                      Loading employees...
                    </div>
                  ) : (
                    <Form.Select
                      name="employeeId"
                      value={values.employeeId}
                      disabled={fetchLoad}
                      onChange={(e) => {
                        handleChange(e);
                        const selectedId = e.target.value;
                        setFieldValue("employeeId", selectedId);

                        const emp = data?.data.find(
                          (u) => u._id === selectedId
                        );

                        if (emp) {
                          setFieldValue("jobTitle", emp.title);
                          setFieldValue(
                            "superviserId",
                            emp.superviser?._id || ""
                          );
                          setFieldValue(
                            "superviserName",
                            emp.superviser
                              ? `${emp.superviser.firstname} ${emp.superviser.lastname}`
                              : ""
                          );
                        }
                      }}
                      isInvalid={touched.employeeId && !!errors.employeeId}
                    >
                      <option value="">Select employee</option>
                      {data?.data.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstname} {emp.lastname}
                        </option>
                      ))}
                    </Form.Select>
                  )}

                  <Form.Control.Feedback type="invalid">
                    {errors.employeeId}
                  </Form.Control.Feedback>
                </Form.Group>
                {/* Job Title */}
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label>
                    Job Title: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control value={values.jobTitle} readOnly />
                </Form.Group>
                {/* Supervisor */}
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label>
                    Supervisor Name: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={values.superviserName}
                    disabled
                    placeholder={
                      fetchLoad
                        ? "Loading..."
                        : !values.employeeId
                        ? "Select employee first"
                        : ""
                    }
                  />
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Have you told your supervisor about this injury/near miss?:{" "}
                    <span className="text-danger">*</span>
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
              <Card.Body className="d-flex flex-column gap-20 p-20">
                {" "}
                <h5 className="fw-semibold text-md md:text-lg text-street-dark">
                  Incident Details
                </h5>
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Date of Injury/Near Miss:{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>

                      <CustomDatePicker
                        value={
                          values.injuryDate ? new Date(values.injuryDate) : null
                        }
                        onChange={(date) => {
                          setFieldValue("injuryDate", date, true);
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
                        Time of injury/near miss:{" "}
                        <span className="text-danger">*</span>
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
                    Where, exactly did it happen?:{" "}
                    <span className="text-danger">*</span>
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
                    What were you doing at the time?:{" "}
                    <span className="text-danger">*</span>
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
                    Describe step by step what led up to the injury/near miss:{" "}
                    <span className="text-danger">*</span>
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
                    What could have been done to prevent this injury/near miss?:{" "}
                    <span className="text-danger">*</span>
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
                    Did you see a doctor about this injury/illness?{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>

                  <div className="d-flex flex-row gap-3 p-2  rounded">
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
                              setFieldValue("doctorVisitDate", date, true);
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
                    Has this part of your body been injured before?{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>

                  <div className="d-flex flex-row gap-3 p-2  rounded">
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
                          setFieldValue("previousInjuryDate", date, true);
                          setFieldTouched("previousInjuryDate", true, false);
                        }}
                        isInvalid={
                          !!errors.previousInjuryDate &&
                          !!touched.previousInjuryDate
                        }
                      />

                      {errors.previousInjuryDate &&
                        touched.previousInjuryDate && (
                          <div className="invalid-feedback d-block">
                            {String(errors.previousInjuryDate)}
                          </div>
                        )}
                    </Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>
            {footer === true && (
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764679476/employee_incident_report_Form_ukuygw.pdf",
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
        );
      }}
    </Formik>
  );
};

export default EmployeeIncidentForm;
