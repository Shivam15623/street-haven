import React from "react";
import { Form, Spinner } from "react-bootstrap";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import { useCreateIncidentReportMutation } from "../../../../services/IncidentReportApi";
import { showSuccess } from "../../../../utills/toastutills";
import Badge from "../../../../components/child/Badge";

const incidentReportSchema = Yup.object({
  date: Yup.string()
    .required("Date of incident is required")
    .test("valid-date", "Invalid date format", (val) => {
      return val ? !isNaN(Date.parse(val)) : false;
    })
    .test(
      "not-in-future",
      "Incident date & time cannot be in the future",
      function (val) {
        const { time } = this.parent; // get the time field
        if (!val || !time) return true; // let required handle empty fields

        const combined = new Date(`${val}T${time}`);
        const now = new Date();

        return combined <= now;
      }
    ),

  time: Yup.string().required("Time of incident is required"),
  location: Yup.string(),

  description: Yup.string()
    .required("Description is required")
    .max(500, "Description cannot exceed 500 characters"),

  witnesses: Yup.array()
    .of(Yup.string().required("witness can not be empty"))
    .min(1, "At least one witness is required"),

  actionsTaken: Yup.string().max(
    500,
    "Actions taken cannot exceed 500 characters"
  ),

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
      console.error(error)
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
            witnesses: [],
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
          }) => (
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
                <div className="d-flex flex-column flex-md-row gap-20">
                  <Form.Group controlId="date" className="flex-grow-1">
                    <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
                      Date of Incident
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={values.date}
                      onChange={handleChange}
                      className="text-xs xs:text-sm fw-normal"
                      isInvalid={!!errors.date && touched.date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group controlId="time" className="flex-grow-1">
                    <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
                      Time of Incident
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={values.time}
                      onChange={handleChange}
                      className="text-xs xs:text-sm fw-normal"
                      isInvalid={!!errors.time && touched.time}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.time}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Location */}
                <Form.Group controlId="location">
                  <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
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
                <Form.Group controlId="description">
                  <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
                    Detailed Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Provide a detailed description of what happened..."
                    value={values.description}
                    onChange={handleChange}
                    className="text-xs xs:text-sm fw-normal mb-10"
                    isInvalid={!!errors.description && touched.description}
                  />
                  <div className="text-start  text-sm text-street-base">
                    {values.description.length} /500 characters
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Witnesses */}
                <Form.Group controlId="witnesses">
                  <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
                    Witnesses
                  </Form.Label>
                  <FieldArray name="witnesses">
                    {({ push, remove }) => (
                      <>
                        <div className="d-flex gap-2 mb-2">
                          <Form.Control
                            type="text"
                            placeholder="Add a witness"
                            value={values.newWitness}
                            onChange={(e) =>
                              setFieldValue("newWitness", e.target.value)
                            } // ✅ fix
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (
                                  values.newWitness &&
                                  values.witnesses.length < 3 &&
                                  !values.witnesses.includes(values.newWitness)
                                ) {
                                  push(values.newWitness); // ✅ works now
                                  setFieldValue("newWitness", "");
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {values.witnesses.map((w, index) => (
                            <Badge
                              key={index}
                              variant="primary-soft"
                              className="px-2 py-1"
                            >
                              {w}{" "}
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() => remove(index)}
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
                <Form.Group controlId="actionsTaken">
                  <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
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
                <Form.Group controlId="reporterName">
                  <Form.Label className="mb-2 text-xs xs:text-sm fw-medium text-street-dark">
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
          )}
        </Formik>
      </div>
    </div>
  );
};

export default IncidentreportForm;
