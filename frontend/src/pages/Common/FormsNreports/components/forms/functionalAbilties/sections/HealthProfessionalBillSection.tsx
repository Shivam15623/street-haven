import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import ReactInputMask from "react-input-mask";
import { CANADA_PROVINCES } from "../../../../../../../services/FormApi";
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

const HealthProfessionalBillSection: React.FC<SectionProps> = ({
  errors,
  handleChange,

  setFieldValue,
  touched,
  values,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      <h2 className=" text-lg fw-semibold text-street-dark">
        Health Professional &amp; Billing Information
      </h2>
      <Form.Group className="d-flex flex-column gap-8">
        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
          Health Professional's Designation
        </Form.Label>

        <div className="d-flex flex-row gap-20 p-3 flex-wrap">
          {[
            "Chiropractor",
            "Physician",
            "Physiotherapist",
            "Registered Nurse (Extended Class)",
            "Other",
          ].map((option) => (
            <div key={option} className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={values.designationOfHealthPro === option}
                onChange={() =>
                  setFieldValue(
                    "designationOfHealthPro",
                    values.designationOfHealthPro === option ? "" : option
                  )
                }
                className="form-check-input"
              />

              <span className="text-xs xs:text-sm">{option}</span>

              {/* 👉 Show input field only if "Other" is selected */}
              {option === "Other" &&
                values.designationOfHealthPro === "Other" && (
                  <Form.Control
                    type="text"
                    name="otherDesignation"
                    placeholder="Please specify"
                    value={values.otherDesignation}
                    onChange={handleChange}
                    className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                    style={{ width: "200px", height: "auto" }}
                  />
                )}
            </div>
          ))}
        </div>

        {touched.designationOfHealthPro && errors.designationOfHealthPro && (
          <div className="text-danger text-xs mt-1">
            {errors.designationOfHealthPro}
          </div>
        )}

        {/* Error for Other field */}
        {values.designationOfHealthPro === "Other" &&
          touched.otherDesignation &&
          errors.otherDesignation && (
            <div className="text-danger text-xs mt-1">
              {errors.otherDesignation}
            </div>
          )}
      </Form.Group>
      <div
        className="p-12  d-flex flex-column gap-20 radius-12 "
        style={{ border: "1px solid #0000001A" }}
      >
        <h4 className="text-xl text-street-dark fw-semibold mb-0">
          PROVIDER BILLING INFORMATION IN THE BOLDED AREA OF SECTION C SHOULD
          NOT BE PROVIDED TO THE WORKER OR EMPLOYER
        </h4>
        <Form.Group className="d-flex flex-row align-items-center gap-20">
          <Form.Label
            style={{ width: "185px" }}
            className="text-md xs:text-xl fw-medium text-street-dark"
          >
            Are you registered with the WSIB?
          </Form.Label>

          <div className="d-flex flex-row  rounded" style={{ gap: "57px" }}>
            <div className="d-flex flex-column gap-10">
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
                    checked={values.iswsibRegistered === opt.value}
                    onChange={() =>
                      setFieldValue(
                        "iswsibRegistered",
                        values.iswsibRegistered === opt.value ? "" : opt.value
                      )
                    }
                    className="form-check-input"
                  />
                  <span className="text-xs xs:text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="d-flex flex-column justify-content-evenly gap-10">
              <p className="text-xs text-street-base">
                {" "}
                Please enter the{" "}
                <span className="text-street-dark fw-semibold">
                  WSIB Provider ID.
                </span>{" "}
                in the box provided
              </p>
              <p className="text-xs text-street-base">
                {" "}
                Please call{" "}
                <span className="text-street-dark fw-semibold">
                  1 - 800-569-7919
                </span>{" "}
                to register
              </p>
            </div>
          </div>

          {touched.iswsibRegistered && errors.iswsibRegistered && (
            <div className="text-danger text-xs mt-1">
              {errors.iswsibRegistered}
            </div>
          )}
        </Form.Group>
        <Row>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>WSIB Provider ID.</Form.Label>
              <Form.Control
                className="h-40-px"
                name="wsibId"
                style={{ height: "40px" }}
                value={values.wsibId}
                onChange={handleChange}
              />
              {touched.wsibId && errors.wsibId && (
                <div className="text-danger text-sm">{errors.wsibId}</div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>Your Invoice Number </Form.Label>
              <Form.Control
                className="h-40-px"
                name="invoiceNo"
                style={{ height: "40px" }}
                value={values.invoiceNo}
                onChange={handleChange}
              />
              {touched.invoiceNo && errors.invoiceNo && (
                <div className="text-danger text-sm">{errors.invoiceNo}</div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>Service Code</Form.Label>
              <Form.Control
                className="h-40-px"
                name="srvCode"
                style={{ height: "40px" }}
                value={values.srvCode}
                onChange={handleChange}
              />
              {touched.srvCode && errors.srvCode && (
                <div className="text-danger text-sm">{errors.srvCode}</div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <p className="text-xs text-street-dark fw-semibold">
          Complete these fields if HST is applicable to this form
        </p>
        <Row>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label>HST Registration Number</Form.Label>
              <Form.Control
                className="h-40-px"
                name="hstRegNo"
                style={{ height: "40px" }}
                value={values.hstRegNo}
                onChange={handleChange}
              />
              {touched.hstRegNo && errors.hstRegNo && (
                <div className="text-danger text-sm">{errors.hstRegNo}</div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label> Service Code</Form.Label>
              <Form.Control
                className="h-40-px"
                name="hstSrvcCode"
                style={{ height: "40px" }}
                value={values.hstSrvcCode}
                onChange={handleChange}
              />
              {touched.hstSrvcCode && errors.hstSrvcCode && (
                <div className="text-danger text-sm">{errors.hstSrvcCode}</div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="d-flex flex-column gap-2 mb-3">
              <Form.Label> HST Amount Billed</Form.Label>
              <Form.Control
                className="h-40-px"
                name="hstAmount"
                style={{ height: "40px" }}
                type="number"
                value={values.hstAmount}
                onChange={handleChange}
              />
              {touched.hstAmount && errors.hstAmount && (
                <div className="text-danger text-sm">{errors.hstAmount}</div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
      <Row>
        <Col sm={12} md={6}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>Health Professional's Name</Form.Label>
            <Form.Control
              className="h-40-px"
              name="healthProfessionalName"
              style={{ height: "40px" }}
              value={values.healthProfessionalName}
              onChange={handleChange}
            />
            {touched.healthProfessionalName &&
              errors.healthProfessionalName && (
                <div className="text-danger text-sm">
                  {errors.healthProfessionalName}
                </div>
              )}
          </Form.Group>
        </Col>
        <Col sm={12} md={6}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>Address (No. Street, Apt.)</Form.Label>
            <Form.Control
              className="h-40-px"
              name="hproAddress"
              style={{ height: "40px" }}
              value={values.hproAddress}
              onChange={handleChange}
            />
            {touched.hproAddress && errors.hproAddress && (
              <div className="text-danger text-sm">{errors.hproAddress}</div>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm={4} md={4}>
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>City/Town</Form.Label>
            <Form.Control
              className="h-40-px"
              name="hprocityTown"
              style={{ height: "40px" }}
              value={values.hprocityTown}
              onChange={handleChange}
            />
            {touched.hprocityTown && errors.hprocityTown && (
              <div className="text-danger text-sm">{errors.hprocityTown}</div>
            )}
          </Form.Group>
        </Col>
        <Col sm={2} md={4}>
          {" "}
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>Province</Form.Label>
            <Form.Select
              style={{ height: "40px" }}
              name="hproProvince"
              value={values.hproProvince}
              onChange={handleChange}
              isInvalid={!!(touched.hproProvince && errors.hproProvince)}
            >
              <option value="">Select Province</option>

              {CANADA_PROVINCES.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </Form.Select>
            {touched.hproProvince && errors.hproProvince && (
              <div className="text-danger text-sm">{errors.hproProvince}</div>
            )}
          </Form.Group>
        </Col>
        <Col sm={6} md={4}>
          {" "}
          <Form.Group className="d-flex flex-column gap-2 mb-3">
            <Form.Label>Postal Code</Form.Label>
            <ReactInputMask
              mask="a9a 9a9"
              value={values.hproPostalCode}
              onChange={(e) => setFieldValue("hproPostalCode", e.target.value)}
              className={`form-control ${
                touched.hproPostalCode && errors.hproPostalCode
                  ? "is-invalid"
                  : ""
              }`}
              placeholder="M5V 3L9"
              style={{
                height: "40px",
                textTransform: "uppercase",
              }}
            />

            {touched.hproPostalCode && errors.hproPostalCode && (
              <div className="text-danger text-sm">{errors.hproPostalCode}</div>
            )}
          </Form.Group>
        </Col>
      </Row>{" "}
      <Form.Group className="d-flex flex-column gap-2 mb-3">
        <Form.Label>Fax</Form.Label>
        <Form.Control
          className="h-40-px"
          name="hproFax"
          style={{ height: "40px" }}
          value={values.hproFax}
          onChange={handleChange}
        />
        {touched.hproFax && errors.hproFax && (
          <div className="text-danger text-sm">{errors.hproFax}</div>
        )}
      </Form.Group>
    </div>
  );
};

export default HealthProfessionalBillSection;
