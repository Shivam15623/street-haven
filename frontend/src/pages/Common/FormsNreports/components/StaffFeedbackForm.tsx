import React from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import { useCreateStaffFeedbackMutation } from "../../../../services/StaffFeedbackApi";
import { showSuccess } from "../../../../utills/toastutills";
import Badge from "../../../../components/child/Badge";
import { TimePicker } from "../../../../components/child/TimePicker";
import CustomDatePicker from "../../../../components/child/DatePicker";

function parseLocalDate(val: string) {
  const [year, month, day] = val.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

function isSameOrBeforeToday(val: string) {
  if (!val) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = parseLocalDate(val);
  console.log(selected, "rfergreg");
  console.log(today, "today");
  selected.setHours(0, 0, 0, 0);

  return selected <= today;
}

const staffFeedbackSchema = Yup.object({
  date: Yup.string()
    .required("Date of incident is required")
    .test("valid-date", "Invalid date format", (val) => {
      return val ? !isNaN(Date.parse(val)) : false;
    })
    .test("not-future-date", "Date cannot be in the future", (val) => {
      return isSameOrBeforeToday(val || "");
    }),

  time: Yup.string()
    .required("Time of incident is required")
    .test("not-future-time", "Time cannot be in the future", function (val) {
      const { date } = this.parent;
      if (!date || !val) return true;

      const [h, m] = val.split(":").map(Number);

      // combine date and time
      const incidentDateTime = new Date(date);
      incidentDateTime.setHours(h, m, 0, 0);

      const now = new Date();
      return incidentDateTime <= now;
    }),

  location: Yup.string(),
  category: Yup.string()
    .oneOf(["Other", "Behavior", "Equipment", "Safety"])
    .default("Other"),

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

type StaffFeedbackFormValues = Yup.InferType<typeof staffFeedbackSchema>;

const StaffFeedbackForm: React.FC = () => {
  const [createStaff, { isLoading }] = useCreateStaffFeedbackMutation();

  const handleSubmit = async (
    values: StaffFeedbackFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      // combine date and time if needed
      console.log("tor", values.time);
      const fullDateTime = values.time
        ? `${values.date}T${values.time}`
        : values.date;
      const payload = { ...values, date: fullDateTime };

      const res = await createStaff(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-column gap-12 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-20 p-md-24">
        <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-0">
          Staff Feedback Form
        </h4>

        <Formik
          validationSchema={staffFeedbackSchema}
          validateOnChange={false}
          validateOnBlur={true}
          initialValues={{
            date: new Date().toISOString().split("T")[0],
            time: "",
            location: "",
            description: "",
            witnesses: [] as string[],
            actionsTaken: "",
            reporterName: "",
            category: "Other",
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
            console.log("Formik Errors:", errors);
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
                      value={values.location}
                      onChange={handleChange}
                      isInvalid={!!errors.location && touched.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Category */}
                  <Form.Group
                    controlId="category"
                    className="d-flex flex-column gap-8"
                  >
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Category
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      isInvalid={!!errors.category && touched.category}
                    >
                      <option value="Other">Other</option>
                      <option value="Behavior">Behavior</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Safety">Safety</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
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
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description && touched.description}
                    />
                    <div>{values.description.length}/500 characters</div>
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
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Actions Taken
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="actionsTaken"
                      value={values.actionsTaken}
                      onChange={handleChange}
                      isInvalid={!!errors.actionsTaken && touched.actionsTaken}
                    />
                    <div>
                      {values.actionsTaken ? values.actionsTaken.length : 0}/500
                      characters
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
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Reporter Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="reporterName"
                      value={values.reporterName}
                      onChange={handleChange}
                      isInvalid={!!errors.reporterName && touched.reporterName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.reporterName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Actions */}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" className="btn btn-street-primary">
                      Submit Report
                    </button>
                    <button className="btn btn-street-neutral">Cancel</button>
                  </div>
                </Form>

                {isLoading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ zIndex: 10 }}
                  >
                    <Spinner animation="border" role="status">
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

export default StaffFeedbackForm;
