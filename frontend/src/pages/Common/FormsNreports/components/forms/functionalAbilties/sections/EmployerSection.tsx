import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";

import { PatternFormat } from "react-number-format";
import ReactInputMask from "react-input-mask";
import { CANADA_PROVINCES } from "../../../../../../../services/FormApi";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";

interface EmployerSectionProps {
  values: FunctionalAbilityFormValues;
  errors: FormikErrors<FunctionalAbilityFormValues>;
  touched: FormikTouched<FunctionalAbilityFormValues>;
  handleChange: FormikHandlers["handleChange"];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const EmployerSection: React.FC<EmployerSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      {" "}
      <h2 className="text-lg fw-semibold text-street-dark">
        Employer Information
      </h2>
      <div>
        {" "}
        <Row>
          <Col sm={12} md={8}>
            <div className="d-flex flex-column gap-20 ">
              <Form.Group className="d-flex flex-column gap-2 mb-3">
                <Form.Label>Employer's Name</Form.Label>
                <Form.Control
                  style={{ height: "40px" }}
                  name="employer.fullName"
                  value={values.employer.fullName}
                  onChange={handleChange}
                />
                {touched.employer?.fullName && errors.employer?.fullName && (
                  <div className="text-danger text-sm">
                    {errors.employer.fullName}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="d-flex flex-column gap-2 mb-3">
                <Form.Label>Full Address (No., Street, Apt.)</Form.Label>
                <Form.Control
                  style={{ height: "40px" }}
                  name="employer.address"
                  value={values.employer.address}
                  onChange={handleChange}
                />
                {touched.employer?.address && errors.employer?.address && (
                  <div className="text-danger text-sm">
                    {errors.employer.address}
                  </div>
                )}
              </Form.Group>
            </div>
          </Col>

          <Col sm={12} md={4}>
            <div className="d-flex flex-column gap-20">
              <Form.Group className="d-flex flex-column gap-2 mb-3">
                <Form.Label>Employer's Telephone</Form.Label>
                <PatternFormat
                  format="+1 (###) ###-####"
                  allowEmptyFormatting
                  style={{ height: "40px" }}
                  mask="_"
                  className={`form-control ${
                    touched.employer?.telephone && errors.employer?.telephone
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="+1 (123) 456-7890"
                  value={values.employer.telephone}
                  onValueChange={(valuesObj) =>
                    setFieldValue(
                      "employer.telephone",
                      valuesObj.formattedValue
                    )
                  }
                  name="employer.telephone"
                />
                {touched.employer?.telephone && errors.employer?.telephone && (
                  <div className="text-danger text-sm">
                    {errors.employer.telephone}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="d-flex flex-column gap-2 mb-3">
                <Form.Label>Employer's Fax No.</Form.Label>
                <Form.Control
                  name="employerFaxNo"
                  value={values.employerFaxNo}
                  onChange={handleChange}
                  style={{ height: "40px" }}
                />
                {touched.employerFaxNo && errors.employerFaxNo && (
                  <div className="text-danger text-sm">
                    {errors.employerFaxNo}
                  </div>
                )}
              </Form.Group>
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>City/Town</Form.Label>
              <Form.Control
                style={{ height: "40px" }}
                name="employer.cityTown"
                value={values.employer.cityTown}
                onChange={handleChange}
              />
              {touched.employer?.cityTown && errors.employer?.cityTown && (
                <div className="text-danger text-sm">
                  {errors.employer.cityTown}
                </div>
              )}
            </Form.Group>
          </Col>

          <Col sm={12} md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>
                Province <span className="text-danger">*</span>
              </Form.Label>

              <Form.Select
                style={{ height: "40px" }}
                name="employer.province"
                value={values.employer.province}
                onChange={handleChange}
                isInvalid={
                  !!(touched.employer?.province && errors.employer?.province)
                }
              >
                <option value="">Select Province</option>

                {CANADA_PROVINCES.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.employer?.province}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col sm={12} md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>
                Postal Code <span className="text-danger">*</span>
              </Form.Label>

              <ReactInputMask
                mask="a9a 9a9"
                value={values.employer.postalCode}
                onChange={(e) =>
                  setFieldValue("employer.postalCode", e.target.value)
                }
                className={`form-control ${
                  touched.employer?.postalCode && errors.employer?.postalCode
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="M5V 3L9"
                style={{
                  height: "40px",
                  textTransform: "uppercase",
                }}
              />
              {touched.employer?.postalCode && errors.employer?.postalCode && (
                <div className="text-danger text-sm">
                  {errors.employer.postalCode}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EmployerSection;
