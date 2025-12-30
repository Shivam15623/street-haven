import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import CustomDatePicker from "../../../../../../../components/child/DatePicker";
import { PatternFormat } from "react-number-format";
import ReactInputMask from "react-input-mask";
import { CANADA_PROVINCES } from "../../../../../../../services/FormApi";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";



interface ClaimWorkerSectionProps {
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
const ClaimWorkerSection: React.FC<ClaimWorkerSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldTouched,
  setFieldValue,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      <h2 className=" text-lg fw-semibold text-street-dark">
        Claim &amp; Worker Information
      </h2>
      <Row>
        <Col sm={12} md={6}>
          <Form.Group className="d-flex flex-column gap-2">
            <Form.Label>
              Claim No<span className="text-danger">*</span>
            </Form.Label>

            <Form.Control
              style={{ height: "40px" }}
              name="claimNo"
              value={values.claimNo}
              onChange={handleChange}
            />

            {touched.claimNo && errors.claimNo && (
              <div className="text-danger small">{errors.claimNo}</div>
            )}
          </Form.Group>
        </Col>
        <Col sm={12} md={6}>
          {" "}
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>
              Date Of Birth<span className="text-danger">*</span>
            </Form.Label>
            <CustomDatePicker
              className="h-40-px"
              value={
                values.worker.dateOfBirth
                  ? new Date(values.worker.dateOfBirth)
                  : null
              }
              onChange={(date) => {
                setFieldValue("worker.dateOfBirth", date, true);
                setFieldTouched("worker.dateOfBirth", true, false);
              }}
              isInvalid={Boolean(
                touched.worker?.dateOfBirth && errors.worker?.dateOfBirth
              )}
            />
            {touched.worker?.dateOfBirth && errors.worker?.dateOfBirth && (
              <div className="text-danger text-sm">
                {String(errors.worker.dateOfBirth)}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={4}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>
              First Name<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              style={{ height: "40px" }}
              name="worker.firstName"
              value={values.worker.firstName}
              onChange={handleChange}
            />
            {touched.worker?.firstName && errors.worker?.firstName && (
              <div className="text-danger text-sm">
                {errors.worker.firstName}
              </div>
            )}
          </Form.Group>
        </Col>

        <Col sm={12} md={4}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>
              Last Name<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              style={{ height: "40px" }}
              name="worker.lastName"
              value={values.worker.lastName}
              onChange={handleChange}
            />
            {touched.worker?.lastName && errors.worker?.lastName && (
              <div className="text-danger text-sm">
                {errors.worker.lastName}
              </div>
            )}
          </Form.Group>
        </Col>

        <Col sm={12} md={4}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>
              Telephone<span className="text-danger">*</span>
            </Form.Label>
            <PatternFormat
              format="+1 (###) ###-####"
              allowEmptyFormatting
              mask="_"
              name="worker.telephone"
              className={`form-control ${
                touched.worker?.telephone && errors.worker?.telephone
                  ? "is-invalid"
                  : ""
              }`}
              placeholder="+1 (123) 456-7890"
              value={values.worker.telephone}
              onValueChange={(valuesObj) =>
                setFieldValue("worker.telephone", valuesObj.formattedValue)
              }
            />
            {touched.worker?.telephone && errors.worker?.telephone && (
              <div className="text-danger text-sm">
                {errors.worker.telephone}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={4}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>
              City/Town<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              style={{ height: "40px" }}
              name="worker.cityTown"
              value={values.worker.cityTown}
              onChange={handleChange}
            />
            {touched.worker?.cityTown && errors.worker?.cityTown && (
              <div className="text-danger text-sm">
                {errors.worker.cityTown}
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
              name="worker.province"
              value={values.worker.province}
              onChange={handleChange}
              isInvalid={
                !!(touched.worker?.province && errors.worker?.province)
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
              {errors.worker?.province}
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
              value={values.worker.postalCode}
              onChange={(e) =>
                setFieldValue("worker.postalCode", e.target.value)
              }
              className={`form-control ${
                touched.worker?.postalCode && errors.worker?.postalCode
                  ? "is-invalid"
                  : ""
              }`}
              placeholder="M5V 3L9"
              style={{
                height: "40px",
                textTransform: "uppercase",
              }}
            />
            {touched.worker?.postalCode && errors.worker?.postalCode && (
              <div className="text-danger text-sm">
                {errors.worker.postalCode}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label>
          Address (no., street, apt.)<span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          style={{ height: "40px" }}
          name="worker.address"
          value={values.worker.address}
          onChange={handleChange}
        />
        {touched.worker?.address && errors.worker?.address && (
          <div className="text-danger text-sm">{errors.worker.address}</div>
        )}
      </Form.Group>
    </div>
  );
};

export default ClaimWorkerSection;
