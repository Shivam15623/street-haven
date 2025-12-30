import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import CustomDatePicker from "../../../../../../../components/child/DatePicker";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";

interface SectionProps {
  values: FunctionalAbilityFormValues;
  errors: FormikErrors<FunctionalAbilityFormValues>;
  touched: FormikTouched<FunctionalAbilityFormValues>;
  handleChange: FormikHandlers["handleChange"];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
}

const JobInjurySection: React.FC<SectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,setFieldTouched
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      {" "}
      <h2 className="text-lg fw-semibold text-street-dark">
        Job &amp; Injury Details
      </h2>
      <div className="d-flex flex-column gap-10">
        {/* Other fields: job, injuries, RTW, contact, position */}
        <Row>
          <Col sm={12} md={8}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>
                1. Type of job at time of accident (where available, please
                attach description of job activities)
              </Form.Label>
              <Form.Control
                className="h-40-px"
                name="typeOfJobAtAccident"
                value={values.typeOfJobAtAccident}
                onChange={handleChange}
              />
              {touched.typeOfJobAtAccident && errors.typeOfJobAtAccident && (
                <div className="text-danger text-sm">
                  {errors.typeOfJobAtAccident}
                </div>
              )}
            </Form.Group>
          </Col>

          <Col sm={12} md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>Area(s) of injury(ies)/illness(es)</Form.Label>
              <Form.Control
                className="h-40-px"
                name="areasOfInjury"
                value={values.areasOfInjury}
                onChange={handleChange}
              />
              {touched.areasOfInjury && errors.areasOfInjury && (
                <div className="text-danger text-sm">
                  {errors.areasOfInjury}
                </div>
              )}
            </Form.Group>
          </Col>

          <Col sm={12} md={8}>
            <Form.Group className="d-flex flex-column gap-8">
              <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                2. Have the worker and the employer discussed Return To Work
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
                      checked={values.discussedRTW === opt.value}
                      onChange={() =>
                        setFieldValue(
                          "discussedRTW",
                          values.discussedRTW === opt.value ? "" : opt.value
                        )
                      }
                      className="form-check-input"
                    />
                    <span className="text-xs xs:text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {touched.discussedRTW && errors.discussedRTW && (
                <div className="text-danger text-xs mt-1">
                  {errors.discussedRTW}
                </div>
              )}
            </Form.Group>
          </Col>
          <Col sm={12} md={4}>
            {values.discussedRTW === false && (
              <Form.Group className="d-flex flex-column gap-2 mb-3">
                <Form.Label>lf no, will be discussed on</Form.Label>
                <CustomDatePicker
                  className="h-40-px"
                  value={
                    values.nodateOfDiscusswill
                      ? new Date(values.nodateOfDiscusswill)
                      : null
                  }
                  onChange={(date) => {
                    setFieldValue("nodateOfDiscusswill", date, true);
                    setFieldTouched("nodateOfDiscusswill", true, false);
                  }}
                  isInvalid={Boolean(
                    touched.nodateOfDiscusswill && errors.nodateOfDiscusswill
                  )}
                />
                {touched.nodateOfDiscusswill && errors.nodateOfDiscusswill && (
                  <div className="text-danger text-sm">
                    {String(errors.nodateOfDiscusswill)}
                  </div>
                )}
              </Form.Group>
            )}
          </Col>
        </Row>
        <Row>
          {" "}
          <Col sm={12} md={8}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>3. Employer contact name</Form.Label>
              <Form.Control
                className="h-40-px"
                name="employerContactName"
                value={values.employerContactName}
                onChange={handleChange}
              />
              {touched.employerContactName && errors.employerContactName && (
                <div className="text-danger text-sm">
                  {errors.employerContactName}
                </div>
              )}
            </Form.Group>
          </Col>
          <Col sm={12} md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                className="h-40-px"
                name="position"
                style={{ height: "40px" }}
                value={values.position}
                onChange={handleChange}
              />
              {touched.position && errors.position && (
                <div className="text-danger text-sm">{errors.position}</div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default JobInjurySection;
