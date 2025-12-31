import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import { Form } from "react-bootstrap";
import CustomDatePicker from "../../../../../../../components/child/DatePicker";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";

interface SectionProps {
  values: FunctionalAbilityFormValues;
  errors: FormikErrors<FunctionalAbilityFormValues>;
  touched: FormikTouched<FunctionalAbilityFormValues>;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
}

const AssesmentSection: React.FC<SectionProps> = ({
  values,
  setFieldTouched,
  setFieldValue,
  errors,
  handleChange,
  touched,
  handleBlur,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      <h2 className="text-lg fw-semibold text-street-dark">Assesment</h2>
      <h3 className="text-md text-street-dark fw-semibold mb-0">
        D. The following information should be completed by the Health.
        Professional to identify the patient's overall abilities and
        restrictions.
      </h3>
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label>1. Date of Assessment</Form.Label>
        <CustomDatePicker
          className="h-40-px"
          value={values.assesmentDate ? new Date(values.assesmentDate) : null}
          onChange={(date) => {
            setFieldValue("assesmentDate", date, true);
            setFieldTouched("assesmentDate", true, false);
          }}
          isInvalid={Boolean(touched.assesmentDate && errors.assesmentDate)}
        />
        {touched.assesmentDate && errors.assesmentDate && (
          <div className="text-danger text-sm">
            {String(errors.assesmentDate)}
          </div>
        )}
      </Form.Group>
      <Form.Group className="d-flex flex-column gap-10">
        <Form.Label>
          2. <span> Please check one:</span>
        </Form.Label>{" "}
        <div className="d-flex flex-column flex-sm-row gap-20">
          <Form.Check
            type="radio"
            id="noRestrictions"
            className="d-flex flex-row gap-10"
            label={
              <p className="text-xs">
                Patient is capable of returning to work with{" "}
                <strong>no restrictions.</strong>
              </p>
            }
            name="returnToWorkStatus"
            value="noRestrictions"
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.returnToWorkStatus === "noRestrictions"}
          />

          {/* Option 2 */}
          <Form.Check
            type="radio"
            className="d-flex flex-row gap-10"
            id="withRestrictions"
            label={
              <p className="text-xs">
                Patient is capable of returning to work{" "}
                <strong>with restrictions.</strong> Complete sections{" "}
                <strong>E and F.</strong>
              </p>
            }
            name="returnToWorkStatus"
            value="withRestrictions"
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.returnToWorkStatus === "withRestrictions"}
          />

          {/* Option 3 */}
          <Form.Check
            type="radio"
            className="d-flex flex-row gap-10"
            id="unable"
            label={
              <p className="text-xs">
                Patient is physically unable to return to work at this time.
                Complete section <strong>F.</strong>
              </p>
            }
            name="returnToWorkStatus"
            value="unable"
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.returnToWorkStatus === "unable"}
          />
        </div>
        {/* Error Message */}
        {errors.returnToWorkStatus && touched.returnToWorkStatus && (
          <div className="text-danger mt-2">{errors.returnToWorkStatus}</div>
        )}
      </Form.Group>
      <hr style={{ backgroundColor: "#00000033" }} />
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label className="text-xs text-street-dark fw-normal">
          3. Additional Comments on Abilities and/or Restrictions
        </Form.Label>
        <Form.Control
          style={{ height: "40px" }}
          name="commentsOnAbilties"
          value={values.commentsOnAbilties}
          onChange={handleChange}
        />
        {touched.commentsOnAbilties && errors.commentsOnAbilties && (
          <div className="text-danger text-sm">{errors.commentsOnAbilties}</div>
        )}
      </Form.Group>

      {/* Assessment Duration */}
      <hr style={{ backgroundColor: "#00000033" }} />
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label className="text-xs text-street-dark fw-normal">
          4. From the date of this assessment, the above will apply for
          approximately
        </Form.Label>
        <div className="d-flex flex-row gap-20 align-items-center">
          {[
            { label: "1-2 days", value: "1-2 days" },
            { label: "3-7 days", value: "3-7 days" },
            { label: "8-14 days", value: "8-14 days" },
            { label: "14+ days", value: "14+ days" },
          ].map((opt) => (
            <div key={opt.label} className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={values.assessmentDuration === opt.value}
                onChange={() =>
                  setFieldValue(
                    "assessmentDuration",
                    values.assessmentDuration === opt.value ? "" : opt.value
                  )
                }
                className="form-check-input"
              />
              <span className="text-xs">{opt.label}</span>
            </div>
          ))}
        </div>
      </Form.Group>

      {/* Return to Work Discussion */}
      <hr style={{ backgroundColor: "#00000033" }} />
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label className="text-xs text-street-dark fw-normal">
          5. Have you discussed return to work with your patient?
        </Form.Label>

        <div className="d-flex flex-row gap-20 align-items-center">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <div key={opt.label} className="d-flex align-items-center gap-2">
              <input
                type="radio"
                name="isDiscussRTWtoPatient"
                value={String(opt.value)}
                checked={values.isDiscussRTWtoPatient === opt.value}
                onChange={() =>
                  setFieldValue("isDiscussRTWtoPatient", opt.value)
                }
                className="form-check-input"
              />
              <span className="text-xs">{opt.label}</span>
            </div>
          ))}
        </div>
      </Form.Group>
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label className="text-xs text-street-dark fw-normal">
          {" "}
          Recommended date of next appointment to review Abilities and/or
          Restrictions.
        </Form.Label>
        <div style={{ maxWidth: "300px" }}>
          <CustomDatePicker
            className="h-40-px"
            value={
              values.nextAppointmentDate
                ? new Date(values.nextAppointmentDate)
                : null
            }
            onChange={(date) => {
              setFieldValue("nextAppointmentDate", date, true);
              setFieldTouched("nextAppointmentDate", true, false);
            }}
            isInvalid={Boolean(
              touched.nextAppointmentDate && errors.nextAppointmentDate
            )}
          />
        </div>

        {touched.nextAppointmentDate && errors.nextAppointmentDate && (
          <div className="text-danger text-sm">
            {String(errors.nextAppointmentDate)}
          </div>
        )}
      </Form.Group>
      <Form.Group className="d-flex flex-column gap-20">
        {/* Label */}
        <Form.Label className="fw-semibold text-xl mb-0">
          I have provided this completed Functional Abilities Form to:
        </Form.Label>

        {/* Options */}
        <div className="d-flex align-items-center gap-4">
          <div className="form-check d-flex align-items-center flex-row gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="providedWorker"
              name="providedTo.worker"
              checked={values.providedTo.worker}
              onChange={handleChange}
            />
            <label
              className="form-check-label fw-medium"
              htmlFor="providedWorker"
            >
              Worker
            </label>
          </div>

          <span className="fw-semibold text-street-dark">and/or</span>

          <div className="form-check align-items-center d-flex flex-row gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="providedEmployer"
              name="providedTo.employer"
              checked={values.providedTo.employer}
              onChange={handleChange}
            />
            <label
              className="form-check-label fw-medium"
              htmlFor="providedEmployer"
            >
              Employer
            </label>
          </div>
        </div>

        {/* Error */}
        {errors.providedTo && typeof errors.providedTo === "string" && (
          <div className="text-danger small mt-2">{errors.providedTo}</div>
        )}
      </Form.Group>
      <hr style={{ backgroundColor: "#00000033" }} />
      <div className="row">
        {" "}
        <div className="col-md-8">
          <Form.Label className="text-xs fw-medium">
            6. Recommended Hours of Work
          </Form.Label>

          <div className="d-flex gap-20 mt-2">
            {[
              { label: "Regular", value: "regular" },
              { label: "Modified", value: "modified" },
              { label: "Graduated", value: "graduated" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="d-flex align-items-center gap-2 text-xs"
              >
                <input
                  type="radio"
                  name="recomendedHours"
                  value={opt.value}
                  checked={values.recomendedHours === opt.value}
                  onChange={() => setFieldValue("recomendedHours", opt.value)}
                  className="form-check-input"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {touched.recomendedHours && errors.recomendedHours && (
            <div className="text-danger text-xs mt-1">
              {errors.recomendedHours}
            </div>
          )}
        </div>
        <div className="col-md-4">
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>Start Date: </Form.Label>
            <CustomDatePicker
              className="h-40-px"
              value={values.startDate ? new Date(values.startDate) : null}
              onChange={(date) => {
                setFieldValue("startDate", date, true);
                setFieldTouched("startDate", true, false);
              }}
              isInvalid={Boolean(touched.startDate && errors.startDate)}
            />
            {touched.startDate && errors.startDate && (
              <div className="text-danger text-sm">
                {String(errors.startDate)}
              </div>
            )}
          </Form.Group>
        </div>
      </div>
    </div>
  );
};

export default AssesmentSection;
